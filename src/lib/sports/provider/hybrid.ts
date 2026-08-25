import type { League, Match, Sport } from "../types";
import type { SportsProvider } from "./types";

/**
 * Routes queries across several independent providers (e.g. api-sports for
 * football + rundown for basketball).
 *
 * - Sport-scoped calls fan out; each provider answers only what it covers
 *   and results are filtered by the normalized `sportId`/`sport` fields.
 * - Global calls merge every provider's slice, sorted by start time where
 *   order matters.
 * - Ids are only unique per product, so id lookups probe all providers in
 *   parallel and take the first hit.
 * - One provider failing never blanks the others - its slice logs a
 *   warning and resolves empty.
 */
export function createHybridProvider(providers: SportsProvider[]): SportsProvider {
  if (providers.length === 0) {
    throw new Error("createHybridProvider requires at least one provider");
  }

  function active(): SportsProvider[] {
    return providers.filter((provider) => provider.isConfigured());
  }

  async function fanOut<T>(
    operation: (provider: SportsProvider) => Promise<T>,
    fallback: T,
    targets?: SportsProvider[]
  ): Promise<T[]> {
    const list = targets ?? active();
    if (list.length === 0) return [];
    return Promise.all(
      list.map(async (provider): Promise<T> => {
        try {
          return await operation(provider);
        } catch (error) {
          console.warn(
            `[hybrid] ${provider.id} slice failed:`,
            error instanceof Error ? error.message : error
          );
          return fallback;
        }
      })
    );
  }

  /** Merged slices dedupe by id within a sport - providers may overlap. */
  function uniqueBySportAndId(matches: Match[]): Match[] {
    const seen = new Set<string>();
    return matches.filter((m) => {
      const key = `${m.sportId}:${m.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const ascendingByStartTime = (a: Match, b: Match): number =>
    (a.startTime || "").localeCompare(b.startTime || "");

  return {
    // Composite has no single identity; the first provider keeps debug
    // logs meaningful.
    id: providers[0]!.id,

    isConfigured() {
      return active().length > 0;
    },

    async listSports(): Promise<Sport[]> {
      const slices = await fanOut((provider) => provider.listSports(), []);
      const seen = new Set<string>();
      return slices.flat().filter((sport) => {
        if (seen.has(sport.slug)) return false;
        seen.add(sport.slug);
        return true;
      });
    },

    async getLeagues(lOptions) {
      const slices = await fanOut(
        (provider) => provider.getLeagues({ limit: lOptions?.limit }),
        [] as League[]
      );
      const seen = new Set<string>();
      const merged = slices.flat().filter((league) => {
        if (lOptions?.sport && league.sportId !== lOptions.sport) return false;
        const key = `${league.sportId}:${league.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return lOptions?.limit ? merged.slice(0, lOptions.limit) : merged;
    },

    async getLeagueById(id) {
      for (const provider of active()) {
        try {
          const league = await provider.getLeagueById?.(id);
          if (league) return league;
        } catch {
          // Probe the next provider.
        }
      }
      return null;
    },

    async getLiveEvents(lOptions) {
      const target = lOptions?.sport;
      const slices = await fanOut((provider) => provider.getLiveEvents(lOptions), []);
      const merged = uniqueBySportAndId(slices.flat()).filter(
        (m) => !target || m.sportId === target
      );
      return lOptions?.limit ? merged.slice(0, lOptions.limit) : merged;
    },

    async getUpcomingEvents(uOptions) {
      const target = uOptions?.sport;
      const slices = await fanOut((provider) => provider.getUpcomingEvents(uOptions), []);
      const merged = uniqueBySportAndId(slices.flat())
        .filter((m) => !target || m.sportId === target)
        .sort(ascendingByStartTime);
      return uOptions?.limit ? merged.slice(0, uOptions.limit) : merged;
    },

    async getEventById(id) {
      const results = await fanOut((provider) => provider.getEventById(id), null);
      return results.find((match): match is Match => match !== null) ?? null;
    },

    async getEventsBySport(sport, sOptions) {
      const slices = await fanOut((provider) => provider.getEventsBySport(sport, sOptions), []);
      const merged = uniqueBySportAndId(slices.flat());
      return sOptions?.limit ? merged.slice(0, sOptions.limit) : merged;
    },

    async getLeagueEvents(leagueId, lOptions) {
      const slices = await fanOut(
        (provider) => provider.getLeagueEvents(leagueId, lOptions),
        []
      );
      const merged = uniqueBySportAndId(slices.flat()).sort(ascendingByStartTime);
      return lOptions?.limit ? merged.slice(0, lOptions.limit) : merged;
    },

    async getHeadToHead(teamAId, teamBId, limit = 5) {
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
      return (
        slices
          .flat()
          .sort((a, b) => (b.startTime || "").localeCompare(a.startTime || ""))
          .slice(0, limit)
      );
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
