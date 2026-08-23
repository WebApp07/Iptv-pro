/**
 * Normalized sports domain types.
 *
 * These are the ONLY types React components may consume. Provider-specific
 * response shapes must never leak past src/lib/sports/provider/*.
 *
 * Fields are optional when the upstream provider does not support them or
 * when data is missing - consumers must handle undefined gracefully.
 */

export type SportSlug =
  | "football"
  | "basketball"
  | "tennis"
  | "hockey"
  | "baseball"
  | "american-football"
  | (string & {});

export interface Sport {
  id: string;
  name: string;
  slug: SportSlug;
}

export interface League {
  id: string;
  name: string;
  sportId: string;
  country?: string;
  logoUrl?: string;
  /** Season label as presented by the provider, e.g. "2026" or "2026-2027". */
  season?: string;
  /** Clean URL slug (from the curated registry) when applicable. */
  slug?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  country?: string;
}

export interface Venue {
  id?: string;
  name?: string;
  city?: string;
  country?: string;
}

/**
 * Coarse match state used by the UI. Providers map their own status codes
 * into this union; anything unrecognized becomes "unknown".
 */
export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "canceled"
  | "suspended"
  | "unknown";

export interface MatchScore {
  home: number | null;
  away: number | null;
  /** Current period for live matches, e.g. "1H", "HT", "2H", "ET". */
  period?: string;
  /** Minute elapsed for live matches where supported. */
  minute?: number;
  /** Breakdown where supported, e.g. { fulltime: [2, 1] }. */
  breakdown?: Partial<Record<"halftime" | "fulltime" | "extratime" | "penalty", [number | null, number | null]>>;
}

/** One named statistic for one team, e.g. { name: "Shots", value: "14" }. */
export interface StatisticEntry {
  name: string;
  value: string;
}

export interface TeamStatistics {
  teamId: string;
  entries: StatisticEntry[];
}

export interface MatchStatistics {
  fixtureId: string;
  teams: TeamStatistics[];
}

/** Head-to-head record: previous meetings between two teams. */
export interface HeadToHead {
  totalMeetings: number;
  events: Match[];
}

/** Recent form for one team, oldest last. */
export interface TeamForm {
  teamId: string;
  results: Array<"W" | "D" | "L">;
}

export interface Match {
  id: string;
  sportId: string;
  leagueId: string;
  leagueName?: string;
  /** ISO 8601 start time in UTC. */
  startTime: string;
  status: MatchStatus;
  round?: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: MatchScore;
  venue?: Venue;
  /** Present only when explicitly requested; providers may not support it. */
  statistics?: MatchStatistics;
  h2h?: HeadToHead;
  form?: TeamForm[];
}

/** Shared query options for event lists. */
export interface EventQueryOptions {
  /** Maximum number of events to return. Providers may cap this lower. */
  limit?: number;
  /** Filter to events on this date (YYYY-MM-DD) where supported. */
  date?: string;
  /** Restrict results to one provider league id where supported. */
  leagueId?: string;
}
