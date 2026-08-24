/**
 * Server-side sports data access.
 *
 * SERVER-ONLY: this module reads SPORTS_API_KEY at call time and must only
 * be imported from Server Components / Route Handlers. Never import it from
 * a "use client" module.
 *
 * Caching strategy (two layers):
 * 1. Cross-request: the provider adapter sets `fetch(url, { next: { revalidate }})`
 *    per data kind - live 30s, upcoming 5min, leagues 24h, single event 2min.
 *    Identical requests are served from Next's Data Cache until stale.
 * 2. Within a render pass: every query is wrapped in React `cache()` keyed on
 *    primitive arguments, so multiple components asking for the same data in
 *    one page share a single lookup (and a single provider mapping pass).
 *
 * Failures never throw for expected conditions (missing key, outage, timeout,
 * quota). Queries return a status so UI can distinguish "nothing scheduled"
 * from "temporarily unavailable". No placeholder fixtures are ever produced.
 */

import { cache } from "react";
import type {
  EventQueryOptions,
  League,
  Match,
  MatchStatistics,
  Sport,
  SportSlug,
} from "./types";
import { SportsProviderError } from "./errors";
import type { SportsProvider } from "./provider/types";
import { createApiSportsProvider } from "./provider/api-sports";
import { createAllSportsProvider } from "./provider/allsports";
import {
  LEAGUE_REGISTRY,
  matchesEntryName,
  findRegistryEntry,
  type LeagueRegistryEntry,
} from "./leagues";

export type {
  EventQueryOptions,
  League,
  Match,
  MatchStatistics,
  Sport,
  SportSlug,
} from "./types";

const PROVIDER_TIMEOUT_MS = Number(process.env.SPORTS_API_TIMEOUT_MS) || 8_000;

/** Outcome of a sports query, letting UI render honest empty vs error states. */
export interface SportsResult<T> {
  data: T;
  /** "ok" = real response (may still be empty). */
  status: "ok" | "unavailable" | "not-configured";
}

let cachedProvider: SportsProvider | null = null;

function getProvider(): SportsProvider {
  if (!cachedProvider) {
    const selected = process.env.SPORTS_PROVIDER || "api-sports";
    switch (selected) {
      case "api-sports":
        cachedProvider = createApiSportsProvider({
          timeoutMs: PROVIDER_TIMEOUT_MS,
        });
        break;
      case "allsports":
        cachedProvider = createAllSportsProvider({
          timeoutMs: PROVIDER_TIMEOUT_MS,
        });
        break;
      default:
        // Unknown provider names fail loudly in server logs rather than
        // silently returning wrong data.
        throw new SportsProviderError(selected, "Unknown SPORTS_PROVIDER value");
    }
  }
  return cachedProvider;
}

/** True when credentials exist - use it to pick between data and setup state. */
export function isSportsDataConfigured(): boolean {
  try {
    return getProvider().isConfigured();
  } catch {
    return false;
  }
}

async function safeResult<T>(
  operation: (provider: SportsProvider) => Promise<T>,
  fallback: T
): Promise<SportsResult<T>> {
  let provider: SportsProvider;
  try {
    provider = getProvider();
  } catch (error) {
    console.warn("[sports]", error instanceof Error ? error.message : error);
    return { data: fallback, status: "not-configured" };
  }

  if (!provider.isConfigured()) {
    return { data: fallback, status: "not-configured" };
  }

  try {
    return { data: await operation(provider), status: "ok" };
  } catch (error) {
    if (error instanceof SportsProviderError) {
      // Expected operational failure: outage, timeout, quota. Logged as a
      // warning - console.error would raise Next.js's dev error overlay for
      // a condition the UI already handles gracefully.
      console.warn(`[sports] ${error.message}`);
      return { data: fallback, status: "unavailable" };
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Cached internals - primitive keys keep dedupe reliable              */
/* ------------------------------------------------------------------ */

const liveCore = cache(
  async (
    limit?: number,
    leagueId?: string
  ): Promise<SportsResult<Match[]>> => {
    const result = await safeResult(
      async (provider) => {
        const events = await provider.getLiveEvents(
          limit || leagueId ? { limit, leagueId } : undefined
        );
        return limit ? events.slice(0, limit) : events;
      },
      []
    );
    if (process.env.SPORTS_DEBUG === "1") {
      console.log(
        `[sports:debug] liveCore -> status ${result.status}, count ${result.data.length}`
      );
    }
    return result;
  }
);

const upcomingCore = cache(
  async (
    limit?: number,
    date?: string,
    leagueId?: string
  ): Promise<SportsResult<Match[]>> =>
    safeResult(
      async (provider) => provider.getUpcomingEvents({ limit, date, leagueId }),
      []
    )
);

const eventByIdCore = cache(
  async (id: string): Promise<SportsResult<Match | null>> =>
    safeResult(async (provider) => provider.getEventById(id), null)
);

const bySportCore = cache(
  async (
    sport: SportSlug,
    limit?: number,
    date?: string
  ): Promise<SportsResult<Match[]>> =>
    safeResult(async (provider) => provider.getEventsBySport(sport, { limit, date }), [])
);

const leagueEventsCore = cache(
  async (
    leagueId: string,
    limit?: number,
    date?: string
  ): Promise<SportsResult<Match[]>> =>
    safeResult(
      async (provider) => provider.getLeagueEvents(leagueId, { limit, date }),
      []
    )
);

const leaguesCore = cache(
  async (
    sport: SportSlug | undefined,
    limit?: number
  ): Promise<SportsResult<League[]>> =>
    safeResult(async (provider) => provider.getLeagues({ sport, limit }), [])
);

const statisticsCore = cache(
  async (eventId: string): Promise<SportsResult<MatchStatistics | null>> =>
    safeResult(
      async (provider) =>
        provider.getEventStatistics ? provider.getEventStatistics(eventId) : null,
      null
    )
);

const headToHeadCore = cache(
  async (
    teamAId: string,
    teamBId: string,
    limit: number
  ): Promise<SportsResult<Match[]>> =>
    safeResult(
      async (provider) =>
        provider.getHeadToHead ? provider.getHeadToHead(teamAId, teamBId, limit) : [],
      []
    )
);

const teamRecentEventsCore = cache(
  async (
    teamId: string,
    limit: number
  ): Promise<SportsResult<Match[]>> =>
    safeResult(
      async (provider) =>
        provider.getTeamRecentEvents ? provider.getTeamRecentEvents(teamId, limit) : [],
      []
    )
);

/**
 * Curated registry of popular competitions (see leagues.ts). Entries only
 * surface when the configured provider actually resolves them - unsupported
 * sports/leagues never render or link.
 */
const allLeaguesCore = cache(async (): Promise<SportsResult<League[]>> =>
  safeResult((provider) => provider.getLeagues({}), [])
);

async function resolveRegistryEntry(
  provider: SportsProvider,
  entry: LeagueRegistryEntry
): Promise<League | null> {
  // 1) Shortcut with a known provider id when the registry has one for
  //    this provider.
  const knownId = entry.knownIds?.[provider.id];
  if (knownId && provider.getLeagueById) {
    const byId = await provider.getLeagueById(knownId);
    if (byId) return { ...byId, slug: entry.slug };
  }
  // 2) Fall back to exact name matching over the league listing.
  const all = await allLeaguesCore();
  if (all.status !== "ok") return null;
  const found = all.data.find(
    (league) =>
      league.sportId === entry.sport && matchesEntryName(entry, league.name)
  );
  return found ? { ...found, slug: entry.slug } : null;
}

export interface ResolvedLeague {
  entry: LeagueRegistryEntry;
  league: League;
}

const popularLeaguesCore = cache(
  async (): Promise<SportsResult<ResolvedLeague[]>> =>
    safeResult(async (provider) => {
      const resolved: ResolvedLeague[] = [];
      for (const entry of LEAGUE_REGISTRY) {
        const league = await resolveRegistryEntry(provider, entry);
        if (league) resolved.push({ entry, league });
      }
      return resolved;
    }, [])
);

const supportedSportsCore = cache(async (): Promise<SportsResult<Sport[]>> =>
  safeResult((provider) => provider.listSports(), [])
);

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getLiveEventsWithStatus(
  options?: Pick<EventQueryOptions, "limit" | "leagueId">
): Promise<SportsResult<Match[]>> {
  return liveCore(options?.limit, options?.leagueId);
}

export async function getUpcomingEventsWithStatus(
  options?: EventQueryOptions
): Promise<SportsResult<Match[]>> {
  return upcomingCore(options?.limit, options?.date, options?.leagueId);
}

export async function getEventByIdWithStatus(
  id: string
): Promise<SportsResult<Match | null>> {
  return eventByIdCore(id);
}

export async function getEventsBySportWithStatus(
  sport: SportSlug,
  options?: EventQueryOptions
): Promise<SportsResult<Match[]>> {
  return bySportCore(sport, options?.limit, options?.date);
}

export async function getLeagueEventsWithStatus(
  leagueId: string,
  options?: EventQueryOptions
): Promise<SportsResult<Match[]>> {
  return leagueEventsCore(leagueId, options?.limit, options?.date);
}

export async function getLeaguesWithStatus(
  options?: { sport?: SportSlug; limit?: number }
): Promise<SportsResult<League[]>> {
  return leaguesCore(options?.sport, options?.limit);
}

export async function getEventStatisticsWithStatus(
  eventId: string
): Promise<SportsResult<MatchStatistics | null>> {
  return statisticsCore(eventId);
}

/** Previous meetings between two teams (newest first). */
export async function getHeadToHeadWithStatus(
  teamAId: string,
  teamBId: string,
  limit = 5
): Promise<SportsResult<Match[]>> {
  return headToHeadCore(teamAId, teamBId, limit);
}

/** Recent finished matches for a team, newest first. */
export async function getTeamRecentEventsWithStatus(
  teamId: string,
  limit = 5
): Promise<SportsResult<Match[]>> {
  return teamRecentEventsCore(teamId, limit);
}

/**
 * Popular leagues from the curated registry, resolved against live provider
 * metadata. Registry entries the provider cannot resolve are omitted.
 * When `sport` is given only that sport's leagues are returned.
 */
export async function getPopularLeagues(
  sport?: SportSlug
): Promise<SportsResult<ResolvedLeague[]>> {
  const result = await popularLeaguesCore();
  if (result.status !== "ok") return result;
  return {
    status: "ok",
    data: sport
      ? result.data.filter((item) => item.entry.sport === sport)
      : result.data,
  };
}

/**
 * Resolves a registry league route (/sports/<sport>/<league-slug>).
 * Returns null for unknown slug/sport combinations; `league` is null when
 * the entry exists but the provider does not cover it (page must render an
 * honest coming-soon state and stay out of the index).
 */
export async function getLeagueRoute(
  sport: SportSlug,
  leagueSlug: string
): Promise<{ entry: LeagueRegistryEntry; league: League | null } | null> {
  const entry = findRegistryEntry(sport, leagueSlug);
  if (!entry) return null;
  let provider: SportsProvider;
  try {
    provider = getProvider();
  } catch {
    return { entry, league: null };
  }
  if (!provider.isConfigured()) return { entry, league: null };
  try {
    const league = await resolveRegistryEntry(provider, entry);
    return { entry, league };
  } catch {
    return { entry, league: null };
  }
}

/**
 * True when the provider covers this sport. Unsupported sports render an
 * honest "coming soon" state instead of empty-looking results.
 */
export async function isSportSupported(sport: SportSlug): Promise<boolean> {
  const result = await supportedSportsCore();
  const supported =
    result.status === "ok" &&
    result.data.some((s) => s.slug.toLowerCase() === sport.toLowerCase());
  if (process.env.SPORTS_DEBUG === "1") {
    console.log(
      `[sports:debug] isSportSupported(${sport}) -> ${supported} (status ${result.status}, sports ${JSON.stringify(result.data)})`
    );
  }
  return supported;
}

/* Convenience wrappers matching the original simple signatures. */

export async function listSupportedSports(): Promise<Sport[]> {
  return safeResult((provider) => provider.listSports(), []).then((r) => r.data);
}

export async function getLiveEvents(options?: EventQueryOptions): Promise<Match[]> {
  return (await getLiveEventsWithStatus(options)).data;
}

export async function getUpcomingEvents(options?: EventQueryOptions): Promise<Match[]> {
  return (await getUpcomingEventsWithStatus(options)).data;
}

export async function getEventById(id: string): Promise<Match | null> {
  return (await getEventByIdWithStatus(id)).data;
}

export async function getEventsBySport(
  sport: SportSlug,
  options?: EventQueryOptions
): Promise<Match[]> {
  return (await getEventsBySportWithStatus(sport, options)).data;
}

export async function getLeagueEvents(
  leagueId: string,
  options?: EventQueryOptions
): Promise<Match[]> {
  return (await getLeagueEventsWithStatus(leagueId, options)).data;
}

export async function getLeagues(
  options?: { sport?: SportSlug; limit?: number }
): Promise<League[]> {
  return (await getLeaguesWithStatus(options)).data;
}

export async function getEventStatistics(
  eventId: string
): Promise<MatchStatistics | null> {
  return (await getEventStatisticsWithStatus(eventId)).data;
}
