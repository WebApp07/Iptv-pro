import type {
  League,
  Match,
  MatchScore,
  MatchStatistics,
  MatchStatus,
  Sport,
  Team,
} from "../types";
import { SPORTS_CACHE_TTL } from "../cache";
import {
  SportsProviderError,
  SportsTimeoutError,
} from "../errors";
import type { SportsProvider } from "./types";

/**
 * Adapter for API-Sports (https://www.api-sports.io), football product
 * (v3.football.api-sports.io).
 *
 * The same account key works across the provider's per-sport products; point
 * SPORTS_API_HOST at a different product host to extend coverage later.
 *
 * This module runs server-side only and reads SPORTS_API_KEY at call time -
 * never at build time - so the key cannot be inlined into client bundles.
 */

const PROVIDER_ID = "api-sports";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_LIMIT = 20;

/** The sport product this adapter instance covers. */
const SUPPORTED_SPORT: Sport = {
  id: "football",
  name: "Football",
  slug: "football",
};

/* ------------------------------------------------------------------ */
/* Raw payload types (provider-specific - do not leak past this file)  */
/* ------------------------------------------------------------------ */

interface ApiSportsEnvelope<T> {
  errors?: string[] | Record<string, string>;
  results?: number;
  response?: T[];
}

interface ApiStatus {
  long?: string;
  short?: string;
  elapsed?: number | null;
}

interface ApiTeam {
  id?: number;
  name?: string;
  logo?: string;
  winner?: boolean | null;
}

interface ApiGoals {
  home?: number | null;
  away?: number | null;
}

interface ApiFixture {
  id?: number;
  date?: string;
  status?: ApiStatus;
  round?: string;
  venue?: { id?: number; name?: string; city?: string } | null;
  league?: {
    id?: number;
    name?: string;
    country?: string;
    logo?: string;
    season?: number;
    round?: string;
  };
  teams?: { home?: ApiTeam; away?: ApiTeam };
  goals?: ApiGoals;
  score?: Partial<Record<"halftime" | "fulltime" | "extratime" | "penalty", ApiGoals>>;
}

interface ApiStatisticEntry {
  type?: string;
  value?: string | number | null;
}

interface ApiTeamStatistics {
  team?: ApiTeam;
  statistics?: ApiStatisticEntry[];
}

/* ------------------------------------------------------------------ */
/* Status mapping                                                      */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, { status: MatchStatus; period?: string }> = {
  NS: { status: "scheduled" },
  SCHED: { status: "scheduled" },
  TBD: { status: "scheduled" },
  "1H": { status: "live", period: "1H" },
  HT: { status: "live", period: "HT" },
  "2H": { status: "live", period: "2H" },
  ET: { status: "live", period: "ET" },
  BT: { status: "live", period: "BT" },
  P: { status: "live", period: "P" },
  LIVE: { status: "live" },
  FT: { status: "finished" },
  AET: { status: "finished" },
  PEN: { status: "finished" },
  PST: { status: "postponed" },
  CANC: { status: "canceled" },
  ABD: { status: "canceled" },
  SUSP: { status: "suspended" },
  INT: { status: "suspended" },
};

function mapStatus(raw: ApiStatus | undefined): {
  status: MatchStatus;
  period?: string;
} {
  const short = raw?.short ?? "";
  const mapped = STATUS_MAP[short] ?? { status: "unknown" as const };
  return { status: mapped.status, period: mapped.period };
}

function toNumberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" ? value : null;
}

/* ------------------------------------------------------------------ */
/* Payload -> normalized mappings (pure, unit-testable)                */
/* ------------------------------------------------------------------ */

export function mapTeam(team: ApiTeam | undefined): Team | null {
  if (!team || typeof team.id !== "number" || !team.name) return null;
  return {
    id: String(team.id),
    name: team.name,
    logoUrl: team.logo,
  };
}

function mapBreakdown(score: ApiFixture["score"]): MatchScore["breakdown"] {
  if (!score) return undefined;
  const breakdown: NonNullable<MatchScore["breakdown"]> = {};
  const keys = ["halftime", "fulltime", "extratime", "penalty"] as const;
  let hasAny = false;
  for (const key of keys) {
    const entry = score[key];
    if (entry && (entry.home != null || entry.away != null)) {
      breakdown[key] = [toNumberOrNull(entry.home), toNumberOrNull(entry.away)];
      hasAny = true;
    }
  }
  return hasAny ? breakdown : undefined;
}

export function mapFixture(fixture: ApiFixture): Match | null {
  const id = fixture.id;
  const home = mapTeam(fixture.teams?.home);
  const away = mapTeam(fixture.teams?.away);
  if (!id || !home || !away) return null;

  const statusInfo = mapStatus(fixture.status);

  const goals = fixture.goals ?? {};
  const hasGoals = goals.home != null || goals.away != null;
  const breakdown = mapBreakdown(fixture.score);
  const liveMinute =
    statusInfo.status === "live" && typeof fixture.status?.elapsed === "number"
      ? fixture.status.elapsed
      : undefined;

  return {
    id: String(id),
    sportId: SUPPORTED_SPORT.id,
    leagueId: fixture.league?.id != null ? String(fixture.league.id) : "",
    leagueName: fixture.league?.name,
    startTime: fixture.date ?? "",
    status: statusInfo.status,
    round: fixture.round ?? fixture.league?.round,
    homeTeam: home,
    awayTeam: away,
    ...(hasGoals || liveMinute !== undefined
      ? {
          score: {
            home: toNumberOrNull(goals.home),
            away: toNumberOrNull(goals.away),
            ...(statusInfo.period ? { period: statusInfo.period } : {}),
            ...(liveMinute !== undefined ? { minute: liveMinute } : {}),
            ...(breakdown ? { breakdown } : {}),
          },
        }
      : {}),
    ...(fixture.venue?.name || fixture.venue?.city
      ? { venue: { id: fixture.venue.id != null ? String(fixture.venue.id) : undefined, name: fixture.venue.name, city: fixture.venue.city } }
      : {}),
  };
}

export function mapLeague(league: {
  id?: number;
  name?: string;
  country?: string;
  logo?: string;
  season?: number;
}): League | null {
  if (!league.id || !league.name) return null;
  return {
    id: String(league.id),
    name: league.name,
    sportId: SUPPORTED_SPORT.id,
    country: league.country,
    logoUrl: league.logo,
    season: league.season != null ? String(league.season) : undefined,
  };
}

export function mapStatistics(
  fixtureId: string,
  rows: ApiTeamStatistics[]
): MatchStatistics | null {
  const teams: MatchStatistics["teams"] = [];
  for (const row of rows) {
    const team = mapTeam(row.team);
    if (!team) continue;
    const entries = (row.statistics ?? [])
      .filter((entry) => entry.type)
      .map((entry) => ({
        name: String(entry.type),
        value: entry.value == null ? "" : String(entry.value),
      }));
    teams.push({ teamId: team.id, entries });
  }
  if (teams.length === 0) return null;
  return { fixtureId, teams };
}

/* ------------------------------------------------------------------ */
/* HTTP plumbing                                                       */
/* ------------------------------------------------------------------ */

async function request<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
  apiKey: string,
  timeoutMs: number,
  revalidate: number
): Promise<T[]> {
  const url = new URL(endpoint, resolveHost());
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      signal: controller.signal,
      // Data Cache window for this data kind. Next also memoizes identical
      // GET requests within a single render pass, so multiple components
      // asking for the same data trigger exactly one upstream call.
      next: { revalidate },
    });

    if (!res.ok) {
      throw new SportsProviderError(PROVIDER_ID, `HTTP ${res.status} from ${endpoint}`);
    }

    const body = (await res.json()) as ApiSportsEnvelope<T>;

    // API-Sports signals quota/auth problems inside a 200 response.
    if (body.errors && !Array.isArray(body.errors) && Object.keys(body.errors).length > 0) {
      throw new SportsProviderError(
        PROVIDER_ID,
        `Provider reported errors: ${JSON.stringify(body.errors)}`
      );
    }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      throw new SportsProviderError(PROVIDER_ID, `Provider reported errors: ${body.errors.join("; ")}`);
    }

    return body.response ?? [];
  } catch (error) {
    if (error instanceof SportsProviderError) throw error;
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new SportsTimeoutError(PROVIDER_ID, timeoutMs);
    }
    throw new SportsProviderError(PROVIDER_ID, `Request to ${endpoint} failed`, error);
  } finally {
    clearTimeout(timer);
  }
}

function resolveHost(): string {
  const raw = process.env.SPORTS_API_HOST || "https://v3.football.api-sports.io";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

function currentSeasonYear(now = new Date()): number {
  // European seasons run roughly Aug-Jun; July onwards counts as the new year.
  return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

export function createApiSportsProvider(options?: {
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function fixtures(
    params: Record<string, string | number | undefined>,
    revalidate: number
  ): Promise<Match[]> {
    const apiKey = process.env.SPORTS_API_KEY;
    if (!apiKey) return [];
    const rows = await request<ApiFixture>(
      "/fixtures",
      params,
      apiKey,
      timeoutMs,
      revalidate
    );
    return rows
      .map(mapFixture)
      .filter((match): match is Match => match !== null);
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return Boolean(process.env.SPORTS_API_KEY);
    },

    async listSports() {
      return [SUPPORTED_SPORT];
    },

    async getLeagues(options) {
      const apiKey = process.env.SPORTS_API_KEY;
      if (!apiKey) return [];
      const rows = await request<{
        league: { id?: number; name?: string; country?: string; logo?: string; season?: number };
      }>(
        "/leagues",
        {
          current: "true",
          type: "league",
        },
        apiKey,
        timeoutMs,
        SPORTS_CACHE_TTL.league
      );
      const leagues = rows
        .map((row) => mapLeague(row.league ?? {}))
        .filter((league): league is League => league !== null);
      return options?.limit ? leagues.slice(0, options.limit) : leagues;
    },

    async getLeagueById(id) {
      if (!/^\d+$/.test(id)) return null;
      const apiKey = process.env.SPORTS_API_KEY;
      if (!apiKey) return null;
      const rows = await request<{
        league: { id?: number; name?: string; country?: string; logo?: string; season?: number };
      }>(
        "/leagues",
        { id },
        apiKey,
        timeoutMs,
        SPORTS_CACHE_TTL.league
      );
      const first = rows[0];
      return first ? mapLeague(first.league ?? {}) : null;
    },

    async getLiveEvents(options) {
      const events = await fixtures(
        {
          live: "all",
          ...(options?.leagueId ? { league: options.leagueId } : {}),
        },
        SPORTS_CACHE_TTL.live
      );
      return options?.limit ? events.slice(0, options.limit) : events;
    },

    async getUpcomingEvents(options) {
      if (options?.leagueId) {
        // League-scoped upcoming fixtures use the league + season endpoint.
        return fixtures(
          {
            league: options.leagueId,
            season: currentSeasonYear(),
            next: options.limit ?? DEFAULT_LIMIT,
            ...(options.date ? { date: options.date } : {}),
          },
          SPORTS_CACHE_TTL.upcoming
        );
      }
      const events = await fixtures(
        {
          next: options?.limit ?? DEFAULT_LIMIT,
          ...(options?.date ? { date: options.date } : {}),
        },
        SPORTS_CACHE_TTL.upcoming
      );
      return events.filter((event) => event.status === "scheduled");
    },

    async getEventById(id) {
      const events = await fixtures({ id }, SPORTS_CACHE_TTL.event);
      return events[0] ?? null;
    },

    async getEventsBySport(sport, options) {
      // This adapter instance only covers its configured product. Other
      // sports are reported as empty rather than throwing, so pages can
      // render an empty state.
      if (sport !== SUPPORTED_SPORT.slug) return [];
      const events = await fixtures(
        {
          date: options?.date,
          ...(options?.date ? {} : { live: "all" }),
        },
        options?.date ? SPORTS_CACHE_TTL.upcoming : SPORTS_CACHE_TTL.live
      );
      return options?.limit ? events.slice(0, options.limit) : events;
    },

    async getLeagueEvents(leagueId, options) {
      if (options?.date) {
        return fixtures(
          { league: leagueId, season: currentSeasonYear(), date: options.date },
          SPORTS_CACHE_TTL.upcoming
        );
      }
      // Without a date, ask for the league's next fixtures directly.
      return fixtures(
        {
          league: leagueId,
          season: currentSeasonYear(),
          next: options?.limit ?? DEFAULT_LIMIT,
        },
        SPORTS_CACHE_TTL.upcoming
      );
    },

    async getEventStatistics(eventId) {
      const apiKey = process.env.SPORTS_API_KEY;
      if (!apiKey) return null;
      const rows = await request<ApiTeamStatistics>(
        "/fixtures/statistics",
        { fixture: eventId },
        apiKey,
        timeoutMs,
        SPORTS_CACHE_TTL.event
      );
      return mapStatistics(String(eventId), rows);
    },

    async getHeadToHead(teamA, teamB, limit = 5) {
      return fixtures(
        { h2h: `${teamA}-${teamB}`, last: limit },
        SPORTS_CACHE_TTL.event
      );
    },

    async getTeamRecentEvents(teamId, limit = 5) {
      return fixtures(
        { team: teamId, last: limit },
        SPORTS_CACHE_TTL.event
      );
    },

    async getTeamForm() {
      // Not directly supported by this provider product; consumers derive
      // form from recent finished fixtures via getLeagueEvents/getEventById.
      return null;
    },
  };
}
