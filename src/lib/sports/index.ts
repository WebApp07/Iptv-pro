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
    if (selected !== "api-sports") {
      // Unknown provider names fail loudly in server logs rather than
      // silently returning wrong data.
      throw new SportsProviderError(selected, "Unknown SPORTS_PROVIDER value");
    }
    cachedProvider = createApiSportsProvider({ timeoutMs: PROVIDER_TIMEOUT_MS });
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
    console.error("[sports]", error instanceof Error ? error.message : error);
    return { data: fallback, status: "not-configured" };
  }

  if (!provider.isConfigured()) {
    return { data: fallback, status: "not-configured" };
  }

  try {
    return { data: await operation(provider), status: "ok" };
  } catch (error) {
    if (error instanceof SportsProviderError) {
      // Expected operational failure: outage, timeout, quota.
      console.error(`[sports] ${error.message}`);
      return { data: fallback, status: "unavailable" };
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Cached internals - primitive keys keep dedupe reliable              */
/* ------------------------------------------------------------------ */

const liveCore = cache(async (limit?: number): Promise<SportsResult<Match[]>> =>
  safeResult(
    async (provider) => {
      const events = await provider.getLiveEvents(limit ? { limit } : undefined);
      return limit ? events.slice(0, limit) : events;
    },
    []
  )
);

const upcomingCore = cache(
  async (limit?: number, date?: string): Promise<SportsResult<Match[]>> =>
    safeResult(async (provider) => provider.getUpcomingEvents({ limit, date }), [])
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

/**
 * Well-known football league ids in API-Sports, used to curate the
 * "Popular Leagues" section. Provider-specific by nature - when another
 * provider is added, move this list into its adapter.
 */
const POPULAR_LEAGUE_IDS = ["39", "140", "135", "78", "61", "2"] as const;

const popularLeaguesCore = cache(
  async (): Promise<SportsResult<League[]>> =>
    safeResult(
      async (provider) => {
        if (!provider.getLeagueById) return [];
        const resolved = await Promise.all(
          POPULAR_LEAGUE_IDS.map((id) => provider.getLeagueById!(id))
        );
        // Drop leagues that came back empty so we never render placeholders.
        return resolved.filter((league): league is League => league !== null);
      },
      []
    )
);

const leaguesForSportCore = cache(
  async (sport: SportSlug, limit: number): Promise<SportsResult<League[]>> =>
    safeResult(async (provider) => provider.getLeagues({ sport, limit }), [])
);

const supportedSportsCore = cache(async (): Promise<SportsResult<Sport[]>> =>
  safeResult((provider) => provider.listSports(), [])
);

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getLiveEventsWithStatus(
  options?: Pick<EventQueryOptions, "limit">
): Promise<SportsResult<Match[]>> {
  return liveCore(options?.limit);
}

export async function getUpcomingEventsWithStatus(
  options?: EventQueryOptions
): Promise<SportsResult<Match[]>> {
  return upcomingCore(options?.limit, options?.date);
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

/**
 * Curated popular leagues, resolved from live provider metadata.
 * Football uses a curated id list; other sports fall back to the
 * provider's league listing and return empty when unsupported.
 */
export async function getPopularLeagues(
  sport: SportSlug = "football"
): Promise<SportsResult<League[]>> {
  if (sport === "football") {
    return popularLeaguesCore();
  }
  const result = await leaguesForSportCore(sport, 6);
  // Only claim popular status for sports the provider actually covers.
  const supported = await isSportSupported(sport);
  if (!supported) {
    return { data: [], status: result.status };
  }
  return result;
}

/**
 * True when the provider covers this sport. Unsupported sports render an
 * honest "coming soon" state instead of empty-looking results.
 */
export async function isSportSupported(sport: SportSlug): Promise<boolean> {
  const result = await supportedSportsCore();
  return (
    result.status === "ok" &&
    result.data.some((s) => s.slug.toLowerCase() === sport.toLowerCase())
  );
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
