/**
 * Server-side sports data access.
 *
 * SERVER-ONLY: this module reads SPORTS_API_KEY at call time and must only
 * be imported from Server Components / Route Handlers. Never import it from
 * a "use client" module.
 *
 * Public functions never throw for expected failures (missing key, provider
 * outage, timeout, empty data) - they log server-side and return empty
 * results so pages can render honest empty states. No placeholder/fake
 * fixtures are ever produced.
 */

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

export type { EventQueryOptions, League, Match, MatchStatistics, Sport, SportSlug } from "./types";

const PROVIDER_TIMEOUT_MS = Number(process.env.SPORTS_API_TIMEOUT_MS) || 8_000;

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

/** True when credentials exist - use it to pick between data and empty state. */
export function isSportsDataConfigured(): boolean {
  try {
    return getProvider().isConfigured();
  } catch {
    return false;
  }
}

/**
 * Wraps a provider call so expected failures degrade to fallback values.
 * Unexpected errors still surface (they indicate bugs, not outages).
 */
async function safeCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  let provider: SportsProvider;
  try {
    provider = getProvider();
  } catch (error) {
    console.error("[sports]", error instanceof Error ? error.message : error);
    return fallback;
  }

  if (!provider.isConfigured()) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    if (error instanceof SportsProviderError) {
      // Expected operational failure: outage, timeout, quota. Logged and swallowed.
      console.error(`[sports] ${error.message}`);
      return fallback;
    }
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function listSupportedSports(): Promise<Sport[]> {
  return safeCall(() => getProvider().listSports(), []);
}

export async function getLeagues(
  options?: { sport?: SportSlug; limit?: number }
): Promise<League[]> {
  return safeCall(() => getProvider().getLeagues(options), []);
}

export async function getLiveEvents(
  options?: EventQueryOptions
): Promise<Match[]> {
  return safeCall(() => getProvider().getLiveEvents(options), []);
}

export async function getUpcomingEvents(
  options?: EventQueryOptions
): Promise<Match[]> {
  return safeCall(() => getProvider().getUpcomingEvents(options), []);
}

export async function getEventById(id: string): Promise<Match | null> {
  return safeCall(async () => getProvider().getEventById(id), null);
}

export async function getEventsBySport(
  sport: SportSlug,
  options?: EventQueryOptions
): Promise<Match[]> {
  return safeCall(() => getProvider().getEventsBySport(sport, options), []);
}

export async function getLeagueEvents(
  leagueId: string,
  options?: EventQueryOptions
): Promise<Match[]> {
  return safeCall(() => getProvider().getLeagueEvents(leagueId, options), []);
}

export async function getEventStatistics(
  eventId: string
): Promise<MatchStatistics | null> {
  return safeCall(async () => {
    const provider = getProvider();
    return provider.getEventStatistics ? provider.getEventStatistics(eventId) : null;
  }, null);
}
