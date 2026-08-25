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
 * Adapter for Live Tennis API (https://livetennisapi.com):
 * https://api.livetennisapi.com/api/public/v1
 *
 * Integrates at the FREE tier budget (30 req/min, 100/day) - every method
 * issues the fewest possible requests and leans on the shared Data Cache
 * windows from ../cache. Endpoints used are all FREE-tier:
 *
 *   GET /matches?status=live      live matches with score
 *   GET /fixtures                 upcoming fixtures, earliest first
 *   GET /matches/{matchId}        full match detail
 *   GET /tournaments              tournament catalogue
 *
 * Paid-only surfaces (/rankings PRO, /h2h + history BASIC, statistics
 * ULTRA) are deliberately NOT wired - the adapter simply omits those
 * optional provider methods rather than inventing data.
 *
 * Contract notes:
 * - Auth travels as an `Authorization: Bearer` header; the key never
 *   appears in URLs.
 * - List endpoints return `{data, meta}`; single resources return the
 *   object directly. Timestamps arrive as UTC ISO 8601 with `Z`.
 * - Scores are player-major: sets=[p1,p2], games=[[p1 sets],[p2 sets]].
 *   Mapped onto the normalized score as sets-won with a "Set N" period;
 *   the in-progress game points have no equivalent in the shared types
 *   and are dropped.
 */

const PROVIDER_ID = "tennis";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SPORT: Sport = { id: "tennis", name: "Tennis", slug: "tennis" };

/* ------------------------------------------------------------------ */
/* Raw payload types                                                   */
/* ------------------------------------------------------------------ */

interface ApiPlayerRef {
  id?: number | string;
  name?: string;
  country?: string | null;
}

interface ApiScore {
  /** [sets_p1, sets_p2] */
  sets?: Array<number | null> | null;
  /** [[games_p1 per set], [games_p2 per set]] */
  games?: number[][] | null;
  points?: Array<string | null> | null;
  server?: number | null;
}

interface ApiMatchRow {
  id?: number | string;
  tournament?: string | null;
  tournament_id?: string | null;
  tour?: string | null;
  surface?: string | null;
  round?: string | null;
  round_code?: string | null;
  /** upcoming | live | completed | cancelled */
  status?: string;
  /** Retired | Cancelled | Walk Over | Postponed | Interrupted | null */
  event_status?: string | null;
  scheduled_time?: string | null;
  players?: { p1?: ApiPlayerRef | null; p2?: ApiPlayerRef | null } | null;
  score?: ApiScore | null;
  winner?: number | null;
}

interface ApiTournamentRow {
  tournament_id?: string | number;
  id?: string | number;
  name?: string;
  category?: string | null;
  city?: string | null;
  country?: string | null;
}

interface ApiListEnvelope<T> {
  data?: T[];
  meta?: unknown;
}

function mapLifecycle(row: ApiMatchRow): MatchStatus {
  switch ((row.status ?? "").toLowerCase()) {
    case "live":
      // In-play suspension (rain/darkness) reads as paused, not live.
      return (row.event_status ?? "").toLowerCase() === "interrupted"
        ? "suspended"
        : "live";
    case "completed":
      return "finished";
    case "cancelled":
      return "canceled";
    case "upcoming":
    case "":
      return "scheduled";
    default:
      return (row.event_status ?? "").toLowerCase() === "postponed"
        ? "postponed"
        : "unknown";
  }
}

/* ------------------------------------------------------------------ */
/* Payload -> normalized mapping                                       */
/* ------------------------------------------------------------------ */

export function mapMatch(row: ApiMatchRow): Match | null {
  const id = row.id != null && row.id !== "" ? String(row.id) : "";
  const p1 = row.players?.p1;
  const p2 = row.players?.p2;
  if (!id || !p1?.name || !p2?.name) return null;

  // Player ids may be absent on lower-tour feeds; synthesize stable ones.
  const homeTeam = {
    id: p1.id != null && p1.id !== "" ? String(p1.id) : `${id}:p1`,
    name: p1.name,
    country: p1.country ?? undefined,
  };
  const awayTeam = {
    id: p2.id != null && p2.id !== "" ? String(p2.id) : `${id}:p2`,
    name: p2.name,
    country: p2.country ?? undefined,
  };

  const status = mapLifecycle(row);

  // Sets won become the headline score; the current-set indicator rides in
  // `period`. In-game points ("40","AD") have no slot in the shared types.
  let score: Match["score"] | undefined;
  const sets = row.score?.sets;
  const hasSets =
    Array.isArray(sets) &&
    typeof sets[0] === "number" &&
    typeof sets[1] === "number";
  if (hasSets || status === "live") {
    const currentSet = row.score?.games?.[0]?.length ?? 0;
    score = {
      home: hasSets ? Number(sets![0]) : null,
      away: hasSets ? Number(sets![1]) : null,
      ...(status === "live" && currentSet > 0 ? { period: `Set ${currentSet}` } : {}),
    };
  }

  return {
    id,
    sportId: SPORT.id,
    leagueId: row.tournament_id != null ? String(row.tournament_id) : "",
    leagueName: row.tournament ?? undefined,
    startTime: row.scheduled_time ?? "",
    status,
    round: row.round ?? undefined,
    homeTeam,
    awayTeam,
    ...(score ? { score } : {}),
  };
}

export function mapTournament(row: ApiTournamentRow): League | null {
  const key =
    row.tournament_id != null
      ? String(row.tournament_id)
      : row.id != null
        ? String(row.id)
        : "";
  if (!key || !row.name) return null;
  return {
    id: key,
    name: row.name,
    sportId: SPORT.id,
    country: row.city
      ? `${row.city}${row.country ? `, ${row.country}` : ""}`
      : (row.country ?? undefined),
  };
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createTennisProvider(options?: {
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  /**
   * Single request shape for every call. 404 resolves null (honest "no
   * such resource"); 403 surfaces tier limits; 429 surfaces rate limits -
   * both as expected operational errors the UI empty-states already handle.
   */
  async function request<T>(
    path: string,
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<T | null> {
    const apiKey = process.env.TENNIS_API_KEY;
    if (!apiKey) throw new SportsProviderError(PROVIDER_ID, "Missing TENNIS_API_KEY");
    const host = (
      process.env.TENNIS_API_HOST ||
      "https://api.livetennisapi.com/api/public/v1"
    ).replace(/\/+$/, "");

    const url = new URL(`${host}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
        next: { revalidate },
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new SportsProviderError(
          PROVIDER_ID,
          res.status === 403
            ? "Plan does not unlock this endpoint"
            : res.status === 429
              ? "Rate limited by provider (retry later)"
              : `HTTP ${res.status} from ${path}${body.error ? ` (${body.error})` : ""}`
        );
      }
      return (await res.json()) as T;
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

  async function fetchList(
    path: string,
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<ApiMatchRow[]> {
    const body = await request<ApiListEnvelope<ApiMatchRow>>(path, params, revalidate);
    return Array.isArray(body?.data) ? body!.data! : [];
  }

  function mapRows(rows: ApiMatchRow[]): Match[] {
    return rows.map(mapMatch).filter((m): m is Match => m !== null);
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return Boolean(process.env.TENNIS_API_KEY);
    },

    async listSports(): Promise<Sport[]> {
      return [SPORT];
    },

    async getLeagues(lOptions) {
      if (lOptions?.sport && lOptions.sport !== SPORT.slug) return [];
      const body = await request<ApiListEnvelope<ApiTournamentRow>>(
        "/tournaments",
        { limit: 200 },
        SPORTS_CACHE_TTL.league
      );
      const leagues = (Array.isArray(body?.data) ? body!.data! : [])
        .map(mapTournament)
        .filter((l): l is League => l !== null);
      return lOptions?.limit ? leagues.slice(0, lOptions.limit) : leagues;
    },

    async getLiveEvents(lOptions) {
      const rows = await fetchList(
        "/matches",
        {
          status: "live",
          limit: Math.min(lOptions?.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
        },
        SPORTS_CACHE_TTL.live
      );
      const events = mapRows(rows);
      return lOptions?.limit ? events.slice(0, lOptions.limit) : events;
    },

    async getUpcomingEvents(uOptions) {
      // /fixtures returns the earliest matches first - slicing the head is
      // the nearest real schedule even mid-off-season.
      const rows = await fetchList(
        "/fixtures",
        { limit: Math.min(uOptions?.limit ?? DEFAULT_LIMIT, MAX_LIMIT) },
        SPORTS_CACHE_TTL.upcoming
      );
      const events = mapRows(rows)
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .filter((m) => !uOptions?.date || m.startTime.startsWith(uOptions.date));
      return events.slice(0, uOptions?.limit);
    },

    async getEventById(id) {
      const row = await request<ApiMatchRow>(
        `/matches/${encodeURIComponent(id)}`,
        {},
        SPORTS_CACHE_TTL.event
      );
      return row ? mapMatch(row) : null;
    },

    async getEventsBySport(sportSlug, sOptions) {
      // This product covers tennis only.
      if (sportSlug !== SPORT.slug) return [];
      const limit = sOptions?.limit ?? DEFAULT_LIMIT;
      const [live, fixtures] = await Promise.all([
        fetchList("/matches", { status: "live", limit }, SPORTS_CACHE_TTL.live),
        fetchList("/fixtures", { limit }, SPORTS_CACHE_TTL.upcoming),
      ]);
      const events = [...mapRows(live), ...mapRows(fixtures)];
      return events.slice(0, limit);
    },

    /**
     * No server-side tournament filter exists on the FREE endpoints, so
     * league pages filter the live + fixture lists locally. Coverage is
     * bounded by what those lists carry - honest partial coverage.
     */
    async getLeagueEvents(leagueId, lOptions) {
      const limit = lOptions?.limit ?? DEFAULT_LIMIT;
      const [live, fixtures] = await Promise.all([
        fetchList("/matches", { status: "live", limit: MAX_LIMIT }, SPORTS_CACHE_TTL.live),
        fetchList("/fixtures", { limit: MAX_LIMIT }, SPORTS_CACHE_TTL.upcoming),
      ]);
      const events = [...mapRows(live), ...mapRows(fixtures)]
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
