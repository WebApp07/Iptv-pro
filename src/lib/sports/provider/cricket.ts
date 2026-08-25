import type {
  League,
  Match,
  MatchStatus,
  Sport,
} from "../types";
import { SPORTS_CACHE_TTL } from "../cache";
import { SportsProviderError, SportsTimeoutError } from "../errors";
import type { SportsProvider } from "./types";

/**
 * Adapter for CricketData.org / CricAPI (https://cricketdata.org):
 * https://api.cricapi.com/v1
 *
 * Documented endpoints used (all on the free plan):
 *
 *   GET /currentMatches   matches started today - scores included
 *   GET /matches          match schedule (upcoming)
 *   GET /match_info?id=   single match detail
 *   GET /series           series/tournament catalogue
 *   GET /players          player search (metadata)
 *
 * Plan realities honored here:
 * - ~100 requests/day on the free plan -> every method issues ONE cached
 *   request; "current matches" deliberately reuse the 5-minute window
 *   instead of the 30-second live one because the provider documents
 *   free-tier data delays.
 * - The free plan covers a LIMITED series list and its data lags real
 *   time; commercial use is restricted by CricketData's terms.
 * - Auth travels as an `apikey` QUERY parameter and CricketData ECHOES IT
 *   BACK inside every response body. This module therefore never logs
 *   URLs or raw payloads.
 */

const PROVIDER_ID = "cricket";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SPORT: Sport = { id: "cricket", name: "Cricket", slug: "cricket" };

/* ------------------------------------------------------------------ */
/* Raw payload types                                                   */
/* ------------------------------------------------------------------ */

interface ApiTeamInfo {
  name?: string;
  shortname?: string;
  img?: string;
}

interface ApiInnings {
  /** Runs. */
  r?: number | string;
  /** Wickets. */
  w?: number | string;
  /** Overs. */
  o?: number | string;
  /** e.g. "India Innings" - identifies the batting side. */
  inning?: string;
}

interface ApiMatchRow {
  id?: string | number;
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  teamInfo?: ApiTeamInfo[];
  score?: ApiInnings[];
  series_id?: string | number;
  series?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
}

interface ApiSeriesRow {
  id?: string | number;
  name?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Envelope. NOTE: CricketData echoes `apikey` back in this object - never
 * log or persist it.
 */
interface ApiEnvelope<T> {
  apikey?: unknown;
  status?: string;
  reason?: string;
  data?: T | null;
}

function mapLifecycle(row: ApiMatchRow): MatchStatus {
  const statusText = (row.status ?? "").toLowerCase();
  // Provider-confirmed lifecycle flags first; free-text only as fallback.
  if (row.matchEnded === true) return "finished";
  if (/abandon/.test(statusText)) return "canceled";
  if (/postponed|cancelled|canceled/.test(statusText)) {
    return /cancel/.test(statusText) ? "canceled" : "postponed";
  }
  if (row.matchStarted === true) return "live";
  if (row.matchStarted === false || statusText === "") return "scheduled";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/* Payload -> normalized mapping                                       */
/* ------------------------------------------------------------------ */

export function mapMatch(row: ApiMatchRow): Match | null {
  const id = row.id != null && row.id !== "" ? String(row.id) : "";
  const homeName = row.teamInfo?.[0]?.name ?? row.teams?.[0];
  const awayName = row.teamInfo?.[1]?.name ?? row.teams?.[1];
  if (!id || !homeName || !awayName) return null;

  const status = mapLifecycle(row);

  let startTime = "";
  if (row.dateTimeGMT) {
    startTime = /[z+]/i.test(row.dateTimeGMT.slice(-6))
      ? row.dateTimeGMT
      : `${row.dateTimeGMT}Z`;
  } else if (row.date && /^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    startTime = `${row.date}T00:00:00Z`;
  }

  // Innings arrive in batting order, not home/away order; the first two
  // entries are the most common presentation. Only runs fit the shared
  // score shape - wickets/overs have no slot and are dropped honestly.
  const innings = Array.isArray(row.score) ? row.score : [];
  const toRuns = (i: ApiInnings | undefined): number | null => {
    const n = Number(i?.r);
    return Number.isFinite(n) ? n : null;
  };
  let score: Match["score"] | undefined;
  if (status !== "scheduled" && innings.length > 0) {
    score = {
      home: toRuns(innings[0]),
      away: innings.length > 1 ? toRuns(innings[1]) : null,
    };
  }

  return {
    id,
    sportId: SPORT.id,
    leagueId: row.series_id != null ? String(row.series_id) : "",
    leagueName: row.name ?? undefined,
    startTime,
    status,
    round: row.matchType ?? undefined,
    homeTeam: {
      id: String(row.teamInfo?.[0]?.shortname ?? homeName),
      name: homeName,
    },
    awayTeam: {
      id: String(row.teamInfo?.[1]?.shortname ?? awayName),
      name: awayName,
    },
    ...(score ? { score } : {}),
    ...(row.venue ? { venue: { name: row.venue } } : {}),
  };
}

export function mapSeries(row: ApiSeriesRow): League | null {
  const id = row.id != null && row.id !== "" ? String(row.id) : "";
  if (!id || !row.name) return null;
  return {
    id,
    name: row.name,
    sportId: SPORT.id,
  };
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createCricketProvider(options?: {
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  /**
   * One request shape for every call. Failures surface as expected
   * operational errors (quota, auth, timeout) the shared empty-states
   * already handle; malformed envelopes resolve empty rather than crash.
   * Never logs the URL - the apikey rides in it.
   */
  async function request<T>(
    path: string,
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<ApiEnvelope<T>> {
    const apiKey = process.env.CRICKET_API_KEY;
    if (!apiKey) throw new SportsProviderError(PROVIDER_ID, "Missing CRICKET_API_KEY");
    const host = (
      process.env.CRICKET_API_HOST || "https://api.cricapi.com/v1"
    ).replace(/\/+$/, "");

    const url = new URL(`${host}/${path.replace(/^\/+/, "")}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    url.searchParams.set("apikey", apiKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        next: { revalidate },
      });
      if (!res.ok) {
        throw new SportsProviderError(
          PROVIDER_ID,
          res.status === 429
            ? "Rate limited by provider (daily quota)"
            : res.status === 401 || res.status === 403
              ? "API key rejected by provider"
              : `HTTP ${res.status} from ${path}`
        );
      }
      const body = (await res.json()) as ApiEnvelope<T>;
      if (body.reason && body.data == null) {
        throw new SportsProviderError(PROVIDER_ID, `Provider error: ${body.reason}`);
      }
      return body;
    } catch (error) {
      if (error instanceof SportsProviderError) throw error;
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        throw new SportsTimeoutError(PROVIDER_ID, timeoutMs);
      }
      throw new SportsProviderError(PROVIDER_ID, `Request to ${path} failed`, error);
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchRows(
    path: string,
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<ApiMatchRow[]> {
    const body = await request<ApiMatchRow[]>(path, { offset: 0, ...params }, revalidate);
    return Array.isArray(body.data) ? body.data : [];
  }

  function mapRows(rows: ApiMatchRow[]): Match[] {
    return rows.map(mapMatch).filter((m): m is Match => m !== null);
  }

  /**
   * Current matches reuse the 5-minute window: the provider documents
   * free-tier delays, and the daily quota punishes aggressive polling.
   */
  async function currentMatches(limit: number): Promise<Match[]> {
    const rows = await fetchRows(
      "currentMatches",
      {},
      SPORTS_CACHE_TTL.upcoming
    );
    return mapRows(rows).slice(0, limit);
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return Boolean(process.env.CRICKET_API_KEY);
    },

    async listSports(): Promise<Sport[]> {
      return [SPORT];
    },

    async getLeagues(lOptions) {
      if (lOptions?.sport && lOptions.sport !== SPORT.slug) return [];
      const body = await request<ApiSeriesRow[]>(
        "series",
        { offset: 0 },
        SPORTS_CACHE_TTL.league
      );
      const leagues = (Array.isArray(body.data) ? body.data : [])
        .map(mapSeries)
        .filter((l): l is League => l !== null);
      return lOptions?.limit ? leagues.slice(0, lOptions.limit) : leagues;
    },

    async getLiveEvents(lOptions) {
      const events = await currentMatches(MAX_LIMIT);
      const started = events.filter((m) => m.status === "live");
      return lOptions?.limit ? started.slice(0, lOptions.limit) : started;
    },

    async getUpcomingEvents(uOptions) {
      // Schedule feed sorted locally; nearest fixtures win even when the
      // covered series list is sparse.
      const rows = await fetchRows("matches", {}, SPORTS_CACHE_TTL.upcoming);
      const events = mapRows(rows)
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .filter((m) => !uOptions?.date || m.startTime.startsWith(uOptions.date));
      return events.slice(0, uOptions?.limit);
    },

    async getEventById(id) {
      const body = await request<ApiMatchRow>(
        "match_info",
        { id },
        SPORTS_CACHE_TTL.event
      );
      // Single-resource endpoint: data is one match object or null.
      return body.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? mapMatch(body.data as ApiMatchRow)
        : null;
    },

    async getEventsBySport(sportSlug, sOptions) {
      // This product covers cricket only.
      if (sportSlug !== SPORT.slug) return [];
      const events = await currentMatches(sOptions?.limit ?? DEFAULT_LIMIT);
      return sOptions?.limit ? events.slice(0, sOptions.limit) : events;
    },

    /**
     * No server-side series filter on these endpoints - league pages
     * filter the current + schedule lists locally by series id. Coverage
     * is bounded by what those lists carry (honest partial coverage).
     */
    async getLeagueEvents(leagueId, lOptions) {
      const limit = lOptions?.limit ?? DEFAULT_LIMIT;
      const [current, schedule] = await Promise.all([
        fetchRows("currentMatches", {}, SPORTS_CACHE_TTL.upcoming),
        fetchRows("matches", {}, SPORTS_CACHE_TTL.upcoming),
      ]);
      const events = [...mapRows(current), ...mapRows(schedule)]
        .filter(
          (m) =>
            m.leagueId === leagueId &&
            (!lOptions?.date || m.startTime.startsWith(lOptions.date))
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return events.slice(0, limit);
    },
  } satisfies SportsProvider;
}
