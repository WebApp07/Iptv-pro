import type { League, Match, Sport, SportSlug } from "../types";
import type { SportsProvider } from "./types";
import {
  ALLSPORTS_SPORTS,
  PROVIDER_ID,
  createAllSportsProvider,
} from "./allsports";

/**
 * Composite AllSportsAPI provider spanning every sport whose subscription
 * key is present in the environment.
 *
 * Each AllSportsAPI product (football, basketball, tennis, cricket, hockey,
 * baseball, american football) is a separate subscription behind an
 * identical API contract. This wrapper instantiates one single-sport
 * adapter per configured key and fans queries out in parallel:
 *
 * - Sport-scoped calls delegate to the matching sub-adapter only.
 * - Global calls merge every active sub-adapter's results, sorted by start
 *   time where order matters.
 * - One product failing (outage, quota) never blanks out the others - its
 *   slice logs a warning and resolves empty.
 *
 * Ids (leagues, teams, events) are only unique WITHIN a product. Calls that
 * take a raw id therefore probe every active product; misses are cheap
 * cached lookups and hits short-circuit.
 */

const DEFAULT_TIMEOUT_MS = 8_000;

interface SubProvider {
  slug: SportSlug;
  name: string;
  provider: SportsProvider;
}

function buildSubs(timeoutMs: number): SubProvider[] {
  return ALLSPORTS_SPORTS.map((cfg) => ({
    slug: cfg.slug,
    name: cfg.name,
    provider: createAllSportsProvider({ sport: cfg.slug, timeoutMs }),
  }));
}

function ascendingByStartTime(a: Match, b: Match): number {
  return (a.startTime || "").localeCompare(b.startTime || "");
}

function descendingByStartTime(a: Match, b: Match): number {
  return (b.startTime || "").localeCompare(a.startTime || "");
}

export function createAllSportsMultiProvider(options?: {
  timeoutMs?: number;
}): SportsProvider {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const subs = buildSubs(timeoutMs);

  /** Sub-adapters with a live subscription right now. */
  function active(): SubProvider[] {
    return subs.filter((sub) => sub.provider.isConfigured());
  }

  function subFor(sport: SportSlug): SubProvider | undefined {
    return active().find((sub) => sub.slug === sport);
  }

  /**
   * Fans an operation out across every active product, isolating failures:
   * one product erroring degrades to `fallback` for that slice instead of
   * failing the merged result.
   */
  async function fanOut<T>(
    operation: (provider: SportsProvider) => Promise<T>,
    fallback: T,
    scope?: SubProvider[]
  ): Promise<T[]> {
    const targets = scope ?? active();
    if (targets.length === 0) return [];
    const slices = await Promise.all(
      targets.map(async (sub): Promise<T> => {
        try {
          return await operation(sub.provider);
        } catch (error) {
          console.warn(
            `[${PROVIDER_ID}] ${sub.slug} slice failed:`,
            error instanceof Error ? error.message : error
          );
          return fallback;
        }
      })
    );
    return slices;
  }

  return {
    id: PROVIDER_ID,

    isConfigured() {
      return active().length > 0;
    },

    async listSports(): Promise<Sport[]> {
      return active().map((sub) => ({ id: sub.slug, name: sub.name, slug: sub.slug }));
    },

    async getLeagues(lOptions) {
      const target = lOptions?.sport ? subFor(lOptions.sport) : undefined;
      // Unknown/unconfigured sport -> honest empty list.
      if (lOptions?.sport && !target) return [];
      const slices = await fanOut(
        (provider) => provider.getLeagues({ limit: lOptions?.limit }),
        [] as League[],
        target ? [target] : undefined
      );
      const merged = slices.flat();
      return lOptions?.limit ? merged.slice(0, lOptions.limit) : merged;
    },

    /**
     * Probes products sequentially - only used for curated registry ids,
     * which are few and cached.
     */
    async getLeagueById(id) {
      for (const sub of active()) {
        try {
          const league = await sub.provider.getLeagueById?.(id);
          if (league) return league;
        } catch {
          // Try the next product.
        }
      }
      return null;
    },

    async getLiveEvents(lOptions) {
      const target = lOptions?.sport ? subFor(lOptions.sport) : undefined;
      // Scoped to a sport with no active product -> honest empty list.
      if (lOptions?.sport && !target) return [];
      const slices = await fanOut(
        (provider) => provider.getLiveEvents(lOptions),
        [] as Match[],
        target ? [target] : undefined
      );
      const merged = slices.flat();
      return lOptions?.limit ? merged.slice(0, lOptions.limit) : merged;
    },

    async getUpcomingEvents(uOptions) {
      const target = uOptions?.sport ? subFor(uOptions.sport) : undefined;
      if (uOptions?.sport && !target) return [];
      const slices = await fanOut(
        (provider) => provider.getUpcomingEvents(uOptions),
        [],
        target ? [target] : undefined
      );
      return slices.flat().sort(ascendingByStartTime).slice(0, uOptions?.limit);
    },

    async getEventById(id) {
      const results = await fanOut((provider) => provider.getEventById(id), null);
      return results.find((match): match is Match => match !== null) ?? null;
    },

    async getEventsBySport(sport, sOptions) {
      const target = subFor(sport);
      if (!target) return [];
      try {
        return await target.provider.getEventsBySport(sport, sOptions);
      } catch (error) {
        console.warn(
          `[${PROVIDER_ID}] ${sport} query failed:`,
          error instanceof Error ? error.message : error
        );
        return [];
      }
    },

    async getLeagueEvents(leagueId, lOptions) {
      const slices = await fanOut(
        (provider) => provider.getLeagueEvents(leagueId, lOptions),
        []
      );
      return slices.flat().sort(ascendingByStartTime).slice(0, lOptions?.limit);
    },

    async getHeadToHead(teamAId, teamBId, limit = 5) {
      // Team ids are product-scoped; find the product that knows the pair.
      const slices = await fanOut(
        async (provider) =>
          provider.getHeadToHead ? provider.getHeadToHead(teamAId, teamBId, limit) : [],
        []
      );
      return slices.find((events) => events.length > 0) ?? [];
    },

    async getTeamRecentEvents(teamId, limit = 5) {
      const slices = await fanOut(
        async (provider) =>
          provider.getTeamRecentEvents ? provider.getTeamRecentEvents(teamId, limit) : [],
        []
      );
      return slices.flat().sort(descendingByStartTime).slice(0, limit);
    },

    async getTeamForm(teamId, limit = 5) {
      const slices = await fanOut(
        async (provider) => (provider.getTeamForm ? provider.getTeamForm(teamId, limit) : null),
        null
      );
      return slices.find((form): form is NonNullable<typeof form> => form !== null) ?? null;
    },

    async getEventStatistics(eventId) {
      const slices = await fanOut(
        async (provider) =>
          provider.getEventStatistics ? provider.getEventStatistics(eventId) : null,
        null
      );
      return (
        slices.find((stats): stats is NonNullable<typeof stats> => stats !== null) ?? null
      );
    },
  } satisfies SportsProvider;
}
