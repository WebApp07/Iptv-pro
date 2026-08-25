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
 * Adapter for TheRundown API (basketball), consumed via RapidAPI:
 * https://rapidapi.com/therundown/api/therundown
 *
 * TheRundown is a North-American sports data service (schedules, scores,
 * odds). This integration uses the v1 schedule feed for NBA games
 * (sport_id 4, override with RUNDOWN_SPORT_ID - e.g. 8 = WNBA, 5 = NCAAB):
 *
 *   GET {host}/sports/{sportId}/schedule?from=YYYY-MM-DD&limit=100&sort=asc
 *
 * Contract notes:
 * - Auth travels as `x-rapidapi-key` / `x-rapidapi-host` headers.
 * - Rows carry `teams_normalized` (no logos) and TOP-LEVEL status/scores
 *   (`status`, `home_score`); older deployments nest them under `score`,
 *   so both shapes are parsed.
 * - Pagination walks the `last_event_uuid` cursor while full pages return.
 *
 * Server-side only: RUNDOWN_API_KEY is read at call time.
 */

const PROVIDER_ID = "rundown";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_HOST = "https://therundown-therundown-v1.p.rapidapi.com";
const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const SPORT: Sport = { id: "basketball", name: "Basketball", slug: "basketball" };

/* ------------------------------------------------------------------ */
/* Raw payload types                                                   */
/* ------------------------------------------------------------------ */

interface RundownTeamNormalized {
  team_id?: number | string;
  name?: string;
  mascot?: string;
  abbreviation?: string;
  is_home?: boolean;
  is_away?: boolean;
}

interface RundownScore {
  event_status?: string;
  event_status_detail?: string;
  display_clock?: string;
  game_period?: number | string;
  away_score?: number | null;
  home_score?: number | null;
}

interface RundownEventRow {
  /** Canonical event hash; some deployments also expose a numeric `id`. */
  event_id?: string | number;
  id?: string | number;
  event_uuid?: string;
  event_date?: string;
  date_event?: string;
  sport_id?: number;
  league_id?: number | string;
  league_name?: string | null;
  event_name?: string | null;
  event_location?: string | null;
  broadcast?: string | null;
  season_type?: string;
  season_year?: number;
  home_team?: string;
  away_team?: string;
  home_team_id?: number | string;
  away_team_id?: number | string;
  teams_normalized?: RundownTeamNormalized[];
  /** Status/scores sit at top level on current deployments... */
  event_status?: string;
  event_status_detail?: string;
  game_period?: number | string;
  away_score?: number | null;
  home_score?: number | null;
  /** ...and nested under `score` on older ones - both shapes parsed. */
  score?: RundownScore;
  status?: string;
  status_detail?: string;
}

interface RundownEnvelope {
  schedules?: RundownEventRow[];
  events?: RundownEventRow[];
}

function utcDate(offsetDays = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

/** Offset in days between "today" (UTC) and a YYYY-MM-DD string. */
function offsetForDate(dateStr: string): number {
  const target = Date.parse(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(target)) return 0;
  const today = Date.parse(`${utcDate(0).toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((target - today) / 86_400_000);
}

/* ------------------------------------------------------------------ */
/* Status + score normalization                                        */
/* ------------------------------------------------------------------ */

function statusFields(row: RundownEventRow): {
  raw: string;
  detail: string;
  period: number | string | undefined;
} {
  return {
    raw: (row.event_status ?? row.score?.event_status ?? row.status ?? "").trim(),
    detail: (
      row.event_status_detail ??
      row.score?.event_status_detail ??
      row.status_detail ??
      ""
    ).trim(),
    period: row.game_period ?? row.score?.game_period,
  };
}

function mapStatus(row: RundownEventRow): { status: MatchStatus; period?: string } {
  const { raw, detail, period } = statusFields(row);
  const upper = raw.toUpperCase();

  switch (upper) {
    case "":
    case "STATUS_SCHEDULED":
    case "SCHEDULED":
      return { status: "scheduled" };
    case "STATUS_IN_PROGRESS":
    case "IN_PROGRESS":
    case "INPROGRESS":
    case "LIVE": {
      const periodNum = Number(period ?? NaN);
      // Basketball periods: 1-4 are quarters, anything beyond is overtime.
      if (!Number.isNaN(periodNum) && periodNum > 0) {
        return { status: "live", period: periodNum <= 4 ? `Q${periodNum}` : "OT" };
      }
      if (detail.toUpperCase() === "HALFTIME") return { status: "live", period: "HT" };
      return { status: "live" };
    }
    case "STATUS_FINAL":
    case "FINAL":
    case "FINISHED":
      return { status: "finished" };
    case "STATUS_POSTPONED":
    case "POSTPONED":
      return { status: "postponed" };
    case "STATUS_CANCELED":
    case "STATUS_CANCELLED":
    case "CANCELED":
    case "CANCELLED":
      return { status: "canceled" };
    case "STATUS_SUSPENDED":
    case "SUSPENDED":
      return { status: "suspended" };
    default:
      return { status: "unknown" };
  }
}

/* ------------------------------------------------------------------ */
/* Payload -> normalized mapping                                       */
/* ------------------------------------------------------------------ */

export function mapEvent(row: RundownEventRow): Match | null {
  const id =
    row.event_id != null && row.event_id !== ""
      ? String(row.event_id)
      : row.id != null && row.id !== ""
        ? String(row.id)
        : row.event_uuid
          ? String(row.event_uuid)
          : "";
  if (!id) return null;

  // Teams arrive as flat id/name fields on current deployments and as a
  // teams_normalized array elsewhere - accept either, require both sides.
  let homeId: string | undefined;
  let homeName: string | undefined;
  let awayId: string | undefined;
  let awayName: string | undefined;
  if (row.home_team_id != null && row.home_team && row.away_team_id != null && row.away_team) {
    homeId = String(row.home_team_id);
    homeName = row.home_team;
    awayId = String(row.away_team_id);
    awayName = row.away_team;
  } else {
    const normalized = row.teams_normalized ?? [];
    const homeNorm = normalized.find((t) => t.is_home);
    const awayNorm = normalized.find((t) => t.is_away);
    homeId = homeNorm?.team_id != null ? String(homeNorm.team_id) : undefined;
    homeName = homeNorm?.name;
    awayId = awayNorm?.team_id != null ? String(awayNorm.team_id) : undefined;
    awayName = awayNorm?.name;
  }
  if (!homeId || !homeName || !awayId || !awayName) return null;

  const statusInfo = mapStatus(row);

  let startTime = "";
  const rawDate = row.date_event ?? row.event_date;
  if (rawDate) startTime = /[z+]/i.test(rawDate.slice(-6)) ? rawDate : `${rawDate}Z`;

  // Pre-game rows carry 0/0 scores - only attach once a game has meaning.
  const scoreRaw = row.score ?? {};
  const homeScore = row.home_score ?? scoreRaw.home_score;
  const awayScore = row.away_score ?? scoreRaw.away_score;
  const hasScores =
    statusInfo.status !== "scheduled" && (homeScore != null || awayScore != null);

  let score: Match["score"] | undefined;
  if (hasScores || statusInfo.period) {
    score = {
      home: typeof homeScore === "number" ? homeScore : null,
      away: typeof awayScore === "number" ? awayScore : null,
      ...(statusInfo.period ? { period: statusInfo.period } : {}),
    };
  }

  return {
    id,
    sportId: SPORT.id,
    // Rows without a numeric league id (observed in the wild) fall back to
    // the league name as the stable join key.
    leagueId:
      row.league_id != null
        ? String(row.league_id)
        : row.league_name
          ? row.league_name
          : "",
    leagueName: row.league_name ?? undefined,
    startTime,
    status: statusInfo.status,
    round: row.season_type ?? undefined,
    homeTeam: {
      id: homeId,
      name: homeName,
    },
    awayTeam: {
      id: awayId,
      name: awayName,
    },
    ...(score ? { score } : {}),
    ...(row.event_location ? { venue: { name: row.event_location } } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createRundownProvider(options?: {
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const sportId = process.env.RUNDOWN_SPORT_ID || "4"; // 4 = NBA

  /**
   * Fetches the schedule starting at a UTC day offset, walking cursor
   * pagination until a partial page or the safety cap. One HTTP shape for
   * every query kind keeps parsing and caching uniform.
   */
  async function fetchSchedule(
    fromOffsetDays: number,
    revalidate: number
  ): Promise<RundownEventRow[]> {
    const apiKey = process.env.RUNDOWN_API_KEY;
    if (!apiKey) throw new SportsProviderError(PROVIDER_ID, "Missing RUNDOWN_API_KEY");
    const host = (process.env.RUNDOWN_API_HOST || DEFAULT_HOST).replace(/\/+$/, "");
    const hostname = new URL(host).hostname;
    const from = utcDate(fromOffsetDays).toISOString().slice(0, 10);

    const collected: RundownEventRow[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL(`${host}/sports/${sportId}/schedule`);
      url.searchParams.set("from", from);
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("sort", "asc");
      url.searchParams.set("include_teams", "1");
      if (cursor) url.searchParams.set("last_event_uuid", cursor);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url.toString(), {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": hostname,
          },
          signal: controller.signal,
          next: { revalidate },
        });
        if (!res.ok) {
          throw new SportsProviderError(PROVIDER_ID, `HTTP ${res.status} from schedule`);
        }
        const body = (await res.json()) as RundownEnvelope;
        const rows = body.schedules ?? body.events ?? [];
        collected.push(...rows);
        if (rows.length < PAGE_SIZE) break;
        const last = rows[rows.length - 1];
        if (!last?.event_uuid) break;
        cursor = last.event_uuid;
      } catch (error) {
        if (error instanceof SportsProviderError) throw error;
        if (
          error instanceof Error &&
          (error.name === "AbortError" || error.name === "TimeoutError")
        ) {
          throw new SportsTimeoutError(PROVIDER_ID, timeoutMs);
        }
        throw new SportsProviderError(PROVIDER_ID, "Schedule request failed", error);
      } finally {
        clearTimeout(timer);
      }
    }

    return collected;
  }

  function mapRows(rows: RundownEventRow[]): Match[] {
    return rows.map(mapEvent).filter((m): m is Match => m !== null);
  }

  /** Dedupes overlapping windows / pagination boundaries. */
  function uniqueById(matches: Match[]): Match[] {
    const seen = new Set<string>();
    return matches.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return Boolean(process.env.RUNDOWN_API_KEY);
    },

    async listSports(): Promise<Sport[]> {
      return [SPORT];
    },

    /**
     * Leagues observed in the current schedule window - honest by design,
     * so off-season gaps never fabricate entries.
     */
    async getLeagues(lOptions) {
      const rows = await fetchSchedule(0, SPORTS_CACHE_TTL.league);
      const leagues = new Map<string, League>();
      for (const row of rows) {
        if (!row.league_name) continue;
        const key = row.league_id != null ? String(row.league_id) : row.league_name;
        if (!key || leagues.has(key)) continue;
        leagues.set(key, {
          id: key,
          name: row.league_name,
          sportId: SPORT.id,
        });
      }
      const list = [...leagues.values()];
      return lOptions?.limit ? list.slice(0, lOptions.limit) : list;
    },

    async getLiveEvents(lOptions) {
      const limit = lOptions?.limit ?? DEFAULT_LIMIT;
      // Late games from yesterday can still be running; scan that window.
      const events = uniqueById(mapRows(await fetchSchedule(-1, SPORTS_CACHE_TTL.live)))
        .filter((m) => m.status === "live")
        .sort((a, b) => b.startTime.localeCompare(a.startTime));
      return events.slice(0, limit);
    },

    async getUpcomingEvents(uOptions) {
      const limit = uOptions?.limit ?? DEFAULT_LIMIT;
      // The feed comes back sorted ascending from the requested day, so
      // slicing the head yields the nearest fixtures even mid-off-season -
      // no artificial date horizon needed.
      const rows = await fetchSchedule(uOptions?.date ? offsetForDate(uOptions.date) : 0, SPORTS_CACHE_TTL.upcoming);
      const events = uniqueById(mapRows(rows))
        .filter(
          (m) =>
            m.status === "scheduled" &&
            (!uOptions?.date || m.startTime.startsWith(uOptions.date))
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return events.slice(0, limit);
    },

    async getEventById(id) {
      const events = uniqueById(mapRows(await fetchSchedule(-1, SPORTS_CACHE_TTL.event)));
      return events.find((m) => m.id === id) ?? null;
    },

    async getEventsBySport(sportSlug, sOptions) {
      // This product covers basketball only.
      if (sportSlug !== SPORT.slug) return [];
      const rows = await fetchSchedule(0, SPORTS_CACHE_TTL.live);
      const events = mapRows(rows);
      return sOptions?.limit ? events.slice(0, sOptions.limit) : events;
    },

    async getLeagueEvents(leagueId, lOptions) {
      const rows = await fetchSchedule(
        lOptions?.date ? offsetForDate(lOptions.date) : 0,
        SPORTS_CACHE_TTL.upcoming
      );
      const events = uniqueById(mapRows(rows))
        .filter(
          (m) =>
            m.leagueId === leagueId &&
            m.status === "scheduled" &&
            (!lOptions?.date || m.startTime.startsWith(lOptions.date))
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      return events.slice(0, lOptions?.limit ?? DEFAULT_LIMIT);
    },
  } satisfies SportsProvider;
}
