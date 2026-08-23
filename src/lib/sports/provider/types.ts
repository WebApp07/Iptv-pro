import type {
  EventQueryOptions,
  HeadToHead,
  League,
  Match,
  MatchStatistics,
  Sport,
  SportSlug,
  TeamForm,
} from "../types";

/**
 * Contract every sports provider adapter must implement.
 *
 * Adapters translate provider-specific payloads into the normalized types
 * from ../types and MUST NOT be imported by UI code directly - always go
 * through the public functions in src/lib/sports/index.ts.
 */
export interface SportsProvider {
  /** Machine identifier, e.g. "api-sports". */
  readonly id: string;

  /** True when required credentials are present in the environment. */
  isConfigured(): boolean;

  listSports(): Promise<Sport[]>;

  getLeagues(options?: { sport?: SportSlug; limit?: number }): Promise<League[]>;

  getLeagueById?(id: string): Promise<League | null>;

  getLiveEvents(options?: EventQueryOptions): Promise<Match[]>;

  getUpcomingEvents(options?: EventQueryOptions): Promise<Match[]>;

  getEventById(id: string): Promise<Match | null>;

  getEventsBySport(sport: SportSlug, options?: EventQueryOptions): Promise<Match[]>;

  getLeagueEvents(leagueId: string, options?: EventQueryOptions): Promise<Match[]>;

  /** Optional extras - return null/[] when unsupported by the provider. */
  getEventStatistics?(eventId: string): Promise<MatchStatistics | null>;
  getHeadToHead?(
    teamAId: string,
    teamBId: string,
    limit?: number
  ): Promise<HeadToHead["events"]>;
  getTeamForm?(teamId: string, limit?: number): Promise<TeamForm | null>;
}
