import type {
  League,
  Match,
  MatchStatistics,
  MatchStatus,
  SportSlug,
  TeamForm,
} from "../types";
import { SPORTS_CACHE_TTL } from "../cache";
import { SportsProviderError, SportsTimeoutError } from "../errors";
import type { SportsProvider } from "./types";

/**
 * Adapter for AllSportsAPI (https://allsportsapi.com).
 *
 * AllSportsAPI sells every sport as a SEPARATE subscription (own API key),
 * but all products expose an identical contract - same methods
 * (`met=Fixtures|Livescore|Leagues|H2H`), same JSON envelope - under a
 * per-sport base path. This factory therefore builds one adapter instance
 * per sport; use createAllSportsMultiProvider for the fan-out composite.
 *
 * Contract notes:
 * - Auth travels as an `APIkey` QUERY parameter (never a header); the
 *   request-level debug log therefore never prints the full URL.
 * - Event times default to Europe/Berlin; `timezone=UTC` is requested so
 *   start times assemble into UTC ISO strings.
 * - Live status is expressed as the elapsed minute ("74") or a period
 *   string ("HALFTIME", "Q2") with event_live="1"; finished matches use
 *   "Finished".
 *
 * Server-side only: keys are read at call time.
 */

export const PROVIDER_ID = "allsports";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_ROOT = "https://apiv2.allsportsapi.com";

/* ------------------------------------------------------------------ */
/* Per-sport product catalog                                           */
/* ------------------------------------------------------------------ */

export interface AllSportsSportConfig {
  slug: SportSlug;
  /** Display name surfaced through listSports(). */
  name: string;
  /** Product path segment under the API root. */
  path: string;
  /** Dedicated key env var for this sport's subscription. */
  apiKeyEnv: string;
}

/**
 * Every AllSportsAPI product we can wire up. A sport is only ACTIVE when
 * its dedicated key exists (football additionally accepts the legacy shared
 * SPORTS_API_KEY), so any subset can be subscribed to.
 */
export const ALLSPORTS_SPORTS: AllSportsSportConfig[] = [
  { slug: "football", name: "Football", path: "football", apiKeyEnv: "SPORTS_API_KEY_FOOTBALL" },
  { slug: "basketball", name: "Basketball", path: "basketball", apiKeyEnv: "SPORTS_API_KEY_BASKETBALL" },
  { slug: "tennis", name: "Tennis", path: "tennis", apiKeyEnv: "SPORTS_API_KEY_TENNIS" },
  { slug: "cricket", name: "Cricket", path: "cricket", apiKeyEnv: "SPORTS_API_KEY_CRICKET" },
  { slug: "hockey", name: "Hockey", path: "hockey", apiKeyEnv: "SPORTS_API_KEY_HOCKEY" },
  { slug: "baseball", name: "Baseball", path: "baseball", apiKeyEnv: "SPORTS_API_KEY_BASEBALL" },
  { slug: "american-football", name: "American Football", path: "american-football", apiKeyEnv: "SPORTS_API_KEY_AMERICAN_FOOTBALL" },
];

/**
 * Key for one sport product. Football keeps backward compatibility with the
 * original single-key setup via the shared SPORTS_API_KEY.
 */
export function resolveAllSportsApiKey(cfg: AllSportsSportConfig): string | undefined {
  return process.env[cfg.apiKeyEnv] ?? (cfg.slug === "football" ? process.env.SPORTS_API_KEY : undefined);
}

/**
 * Base URL for one sport product. SPORTS_API_HOST may override the root
 * (or already include the product path, which is then not duplicated).
 */
function resolveBaseUrl(cfg: AllSportsSportConfig): string {
  const root = (process.env.SPORTS_API_HOST || DEFAULT_ROOT).replace(/\/+$/, "");
  try {
    const pathname = new URL(root).pathname.replace(/\/+$/, "");
    if (pathname.toLowerCase() === `/${cfg.path}`) return root;
  } catch {
    // Malformed host - let the fetch layer surface the error.
  }
  return `${root}/${cfg.path}`;
}

/* ------------------------------------------------------------------ */
/* Raw payload types                                                   */
/* ------------------------------------------------------------------ */

interface ApiEventRow {
  event_key?: string | number;
  event_date?: string;
  event_time?: string;
  event_home_team?: string;
  home_team_key?: string | number;
  event_away_team?: string;
  away_team_key?: string | number;
  event_halftime_result?: string;
  event_final_result?: string;
  event_ft_result?: string;
  event_status?: string;
  event_live?: string;
  league_name?: string;
  league_key?: string | number;
  league_round?: string;
  league_logo?: string;
  country_name?: string;
  event_stadium?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  statistics?: Array<{ type?: string; home?: string; away?: string }>;
}

interface ApiLeagueRow {
  league_key?: string | number;
  league_name?: string;
  country_name?: string;
  league_logo?: string;
}

interface ApiH2HResult {
  H2H?: ApiEventRow[];
}

function utcDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Status + score normalization                                        */
/* ------------------------------------------------------------------ */

/** Live period strings seen across products, normalized for the UI. */
const LIVE_PERIODS: Record<string, string> = {
  HALFTIME: "HT",
  HT: "HT",
  PENALTY: "P",
  P: "P",
  ET: "ET",
  OT: "OT",
  AOT: "OT",
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
};

function mapStatus(row: ApiEventRow): { status: MatchStatus; period?: string } {
  const raw = (row.event_status ?? "").trim();

  if (row.event_live === "1") {
    if (/^\d+$/.test(raw)) return { status: "live" };
    const period = LIVE_PERIODS[raw.toUpperCase()];
    return period ? { status: "live", period } : { status: "live" };
  }

  switch (raw.toLowerCase()) {
    case "finished":
    case "ft":
    case "match finished":
      return { status: "finished" };
    case "postponed":
      return { status: "postponed" };
    case "canceled":
    case "cancelled":
      return { status: "canceled" };
    case "suspended":
    case "interrupted":
      return { status: "suspended" };
    case "not started":
    case "ns":
    case "tbd":
    case "":
      return { status: "scheduled" };
    default:
      return { status: "unknown" };
  }
}

function parseScorePair(value: string | undefined): [number, number] | null {
  if (!value) return null;
  const m = /(\d+)\s*-\s*(\d+)/.exec(value);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/**
 * Cricket results carry wickets ("236/7 - 230/8"), which the generic pair
 * parser would misread; extract the runs instead.
 */
function parseCricketScorePair(value: string | undefined): [number, number] | null {
  if (!value) return null;
  const m = /(\d+)\s*\/\s*\d*\D+(\d+)/.exec(value);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

function parseCurrentScore(sport: SportSlug, row: ApiEventRow): [number, number] | null {
  if (sport === "cricket") {
    const runs =
      parseCricketScorePair(row.event_ft_result) ?? parseCricketScorePair(row.event_final_result);
    if (runs) return runs;
  }
  return parseScorePair(row.event_ft_result) ?? parseScorePair(row.event_final_result);
}

/* ------------------------------------------------------------------ */
/* Payload -> normalized mappings                                      */
/* ------------------------------------------------------------------ */

function mapTeams(
  row: ApiEventRow
): { home: Match["homeTeam"]; away: Match["awayTeam"] } | null {
  const homeId = row.home_team_key != null ? String(row.home_team_key) : "";
  const awayId = row.away_team_key != null ? String(row.away_team_key) : "";
  if (!homeId || !row.event_home_team || !awayId || !row.event_away_team) return null;
  return {
    home: { id: homeId, name: row.event_home_team, logoUrl: row.home_team_logo },
    away: { id: awayId, name: row.event_away_team, logoUrl: row.away_team_logo },
  };
}

export function mapEvent(row: ApiEventRow, sportId: SportSlug): Match | null {
  const id = row.event_key != null ? String(row.event_key) : "";
  const teams = mapTeams(row);
  if (!id || !teams) return null;

  const statusInfo = mapStatus(row);

  let startTime = "";
  if (row.event_date) {
    // timezone=UTC was requested upstream, so this is already UTC.
    startTime = `${row.event_date}T${(row.event_time ?? "00:00").slice(0, 8)}Z`;
  }

  const current = parseCurrentScore(sportId, row);
  const halftime = parseScorePair(row.event_halftime_result);
  const rawMinute = (row.event_status ?? "").trim();
  const minute =
    statusInfo.status === "live" && /^\d+$/.test(rawMinute) ? Number(rawMinute) : undefined;

  let score: Match["score"] | undefined;
  if (current || statusInfo.period || minute !== undefined) {
    score = {
      home: current ? current[0] : null,
      away: current ? current[1] : null,
      ...(statusInfo.period ? { period: statusInfo.period } : {}),
      ...(minute !== undefined ? { minute } : {}),
    };
    if (halftime) score.breakdown = { halftime };
  }

  const statistics: MatchStatistics | undefined =
    row.statistics && row.statistics.some((s) => s.type)
      ? {
          fixtureId: id,
          teams: [
            {
              teamId: teams.home.id,
              entries: row.statistics.map((s) => ({
                name: String(s.type ?? ""),
                value: String(s.home ?? ""),
              })),
            },
            {
              teamId: teams.away.id,
              entries: row.statistics.map((s) => ({
                name: String(s.type ?? ""),
                value: String(s.away ?? ""),
              })),
            },
          ],
        }
      : undefined;

  return {
    id,
    sportId,
    leagueId: row.league_key != null ? String(row.league_key) : "",
    leagueName: row.league_name,
    startTime,
    status: statusInfo.status,
    round: row.league_round,
    homeTeam: teams.home,
    awayTeam: teams.away,
    ...(score ? { score } : {}),
    ...(row.event_stadium ? { venue: { name: row.event_stadium } } : {}),
    ...(statistics ? { statistics } : {}),
  };
}

export function mapLeagueRow(row: ApiLeagueRow, sportId: SportSlug): League | null {
  const key = row.league_key != null ? String(row.league_key) : null;
  if (!key || !row.league_name) return null;
  return {
    id: key,
    name: row.league_name,
    sportId,
    country: row.country_name,
    logoUrl: row.league_logo,
  };
}

/** W/D/L for a team from finished fixtures (rows newest-first). */
function deriveForm(teamId: string, recent: Match[], limit: number): TeamForm | null {
  const results: TeamForm["results"] = [];
  for (const m of recent) {
    if (m.status !== "finished" || !m.score) continue;
    const isHome = m.homeTeam.id === teamId;
    const own = isHome ? m.score.home : m.score.away;
    const opp = isHome ? m.score.away : m.score.home;
    if (own == null || opp == null) continue;
    results.push(own > opp ? "W" : own === opp ? "D" : "L");
    if (results.length >= limit) break;
  }
  return results.length ? { teamId, results: results.reverse() } : null;
}

/* ------------------------------------------------------------------ */
/* HTTP plumbing                                                       */
/* ------------------------------------------------------------------ */

async function request<T>(
  baseUrl: string,
  met: string,
  params: Record<string, string | number | undefined>,
  apiKey: string,
  timeoutMs: number,
  revalidate: number
): Promise<T> {
  const url = new URL(`${baseUrl}/`);
  url.searchParams.set("met", met);
  url.searchParams.set("APIkey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate },
    });
    if (!res.ok) {
      throw new SportsProviderError(PROVIDER_ID, `HTTP ${res.status} from ${met}`);
    }
    const body = (await res.json()) as { success?: number; result?: unknown };
    if (body.success !== 1) {
      throw new SportsProviderError(
        PROVIDER_ID,
        `Provider reported failure for ${met}: ${JSON.stringify(body.result ?? "")}`
      );
    }
    return (body.result ?? ([] as unknown)) as T;
  } catch (error) {
    if (error instanceof SportsProviderError) throw error;
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new SportsTimeoutError(PROVIDER_ID, timeoutMs);
    }
    throw new SportsProviderError(PROVIDER_ID, `Request to ${met} failed`, error);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createAllSportsProvider(options?: {
  sport?: SportSlug;
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const cfg =
    ALLSPORTS_SPORTS.find((s) => s.slug === options?.sport) ?? ALLSPORTS_SPORTS[0];
  const sport = cfg.slug;

  async function fetchRows(
    met: string,
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<ApiEventRow[]> {
    const apiKey = resolveAllSportsApiKey(cfg);
    if (!apiKey) return [];
    const result = await request<ApiEventRow[]>(
      resolveBaseUrl(cfg),
      met,
      { timezone: "UTC", ...params },
      apiKey,
      timeoutMs,
      revalidate
    );
    return Array.isArray(result) ? result : [];
  }

  async function mapRows(rows: ApiEventRow[]): Promise<Match[]> {
    return rows.map((row) => mapEvent(row, sport)).filter((m): m is Match => m !== null);
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return Boolean(resolveAllSportsApiKey(cfg));
    },

    async listSports() {
      return [{ id: cfg.slug, name: cfg.name, slug: cfg.slug }];
    },

    async getLeagues(lOptions) {
      const apiKey = resolveAllSportsApiKey(cfg);
      if (!apiKey) return [];
      const rows = await request<ApiLeagueRow[]>(
        resolveBaseUrl(cfg),
        "Leagues",
        {},
        apiKey,
        timeoutMs,
        SPORTS_CACHE_TTL.league
      );
      const leagues = (Array.isArray(rows) ? rows : [])
        .map((row) => mapLeagueRow(row, sport))
        .filter((l): l is League => l !== null);
      return lOptions?.limit ? leagues.slice(0, lOptions.limit) : leagues;
    },

    /**
     * The Leagues listing is plan-filtered and may omit a covered league,
     * so id lookups probe the fixtures feed directly: rows prove coverage
     * and carry the league metadata needed to build the object.
     */
    async getLeagueById(id) {
      const apiKey = resolveAllSportsApiKey(cfg);
      if (!apiKey) return null;
      try {
        const result = await request<ApiEventRow[]>(
          resolveBaseUrl(cfg),
          "Fixtures",
          { leagueId: id, from: utcDate(0), to: utcDate(13), timezone: "UTC" },
          apiKey,
          timeoutMs,
          SPORTS_CACHE_TTL.league
        );
        const row = (Array.isArray(result) ? result : [])[0];
        if (!row?.league_name) return null;
        return {
          id: String(id),
          name: row.league_name,
          sportId: sport,
          country: row.country_name,
          logoUrl: row.league_logo ?? undefined,
        };
      } catch {
        return null;
      }
    },

    async getLiveEvents(lOptions) {
      const rows = await fetchRows(
        "Livescore",
        lOptions?.leagueId ? { leagueId: lOptions.leagueId } : {},
        SPORTS_CACHE_TTL.live
      );
      const events = await mapRows(rows);
      return lOptions?.limit ? events.slice(0, lOptions.limit) : events;
    },

    async getUpcomingEvents(uOptions) {
      const limit = uOptions?.limit ?? DEFAULT_LIMIT;
      // Entry plans restrict historical ranges; the API also caps any
      // from/to span at 15 days.
      const from = uOptions?.date ?? utcDate(0);
      const to = uOptions?.date ?? utcDate(2);
      let rows = await fetchRows(
        "Fixtures",
        { from, to, ...(uOptions?.leagueId ? { leagueId: uOptions.leagueId } : {}) },
        SPORTS_CACHE_TTL.upcoming
      );
      // Covered competitions may not play inside 48h (off-season, sparse
      // plans) - widen once toward the 15-day cap before giving up, so the
      // section shows the nearest real fixtures instead of nothing.
      if (rows.length === 0 && !uOptions?.date && !uOptions?.leagueId) {
        rows = await fetchRows(
          "Fixtures",
          { from: utcDate(0), to: utcDate(13), timezone: "UTC" },
          SPORTS_CACHE_TTL.upcoming
        );
      }
      const events = await mapRows(rows);
      return events
        .filter((e) => e.status === "scheduled")
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, limit);
    },

    async getEventById(id) {
      const rows = await fetchRows("Fixtures", { matchId: id }, SPORTS_CACHE_TTL.event);
      return (await mapRows(rows))[0] ?? null;
    },

    async getEventsBySport(sportSlug, sOptions) {
      // This product instance covers exactly one sport.
      if (sportSlug !== cfg.slug) return [];
      const rows = await fetchRows(
        "Livescore",
        sOptions?.leagueId ? { leagueId: sOptions.leagueId } : {},
        SPORTS_CACHE_TTL.live
      );
      const events = await mapRows(rows);
      return sOptions?.limit ? events.slice(0, sOptions.limit) : events;
    },

    async getLeagueEvents(leagueId, lOptions) {
      const from = lOptions?.date ?? utcDate(0);
      const to = lOptions?.date ?? utcDate(2);
      let rows = await fetchRows(
        "Fixtures",
        { leagueId, from, to },
        SPORTS_CACHE_TTL.upcoming
      );
      // Same widening rule as getUpcomingEvents: sparse league calendars
      // deserve the nearest real fixtures, not an empty section.
      if (rows.length === 0 && !lOptions?.date) {
        rows = await fetchRows(
          "Fixtures",
          { leagueId, from: utcDate(0), to: utcDate(13) },
          SPORTS_CACHE_TTL.upcoming
        );
      }
      const events = await mapRows(rows);
      return events
        .filter((e) => e.status === "scheduled")
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, lOptions?.limit ?? DEFAULT_LIMIT);
    },

    async getHeadToHead(teamA, teamB, limit = 5) {
      const apiKey = resolveAllSportsApiKey(cfg);
      if (!apiKey) return [];
      const result = await request<ApiH2HResult>(
        resolveBaseUrl(cfg),
        "H2H",
        { firstTeamId: teamA, secondTeamId: teamB, timezone: "UTC" },
        apiKey,
        timeoutMs,
        SPORTS_CACHE_TTL.upcoming
      );
      const rows = Array.isArray(result?.H2H) ? result.H2H.slice(0, limit) : [];
      return (await mapRows(rows)).slice(0, limit);
    },

    async getTeamRecentEvents(teamId, limit = 5) {
      const apiKey = resolveAllSportsApiKey(cfg);
      if (!apiKey) return [];
      // 13-day lookback - the API rejects from/to spans beyond 15 days.
      const rows = await fetchRows(
        "Fixtures",
        { teamId, from: utcDate(-13), to: utcDate(0) },
        SPORTS_CACHE_TTL.event
      );
      return (await mapRows(rows)).slice(0, limit);
    },

    async getTeamForm(teamId, limit = 5) {
      const recent = (await this.getTeamRecentEvents!(teamId, limit)).filter(
        (m) => m.status === "finished"
      );
      return deriveForm(teamId, [...recent].reverse(), limit);
    },

    async getEventStatistics(eventId) {
      const byId = await this.getEventById!(eventId);
      return byId?.statistics ?? null;
    },
  } satisfies SportsProvider;
}
