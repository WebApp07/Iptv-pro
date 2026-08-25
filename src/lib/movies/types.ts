/**
 * Normalized movie/series domain types.
 *
 * UI code consumes ONLY these - provider response shapes stay inside
 * src/lib/movies/omdb.ts, mirroring the src/lib/sports pattern.
 */

export type TitleKind = "movie" | "series";

export interface TitleSummary {
  /** Stable IMDb id, e.g. "tt0468569". */
  id: string;
  /** URL slug: "<kebab-title>-<id>". */
  slug: string;
  kind: TitleKind;
  title: string;
  year: string;
  rating?: number;
  genres: string[];
  posterUrl?: string;
  plot?: string;
}

export interface TitleDetail extends TitleSummary {
  runtime?: string;
  rated?: string;
  released?: string;
  director?: string;
  writer?: string;
  cast: string[];
  language?: string;
  country?: string;
  awards?: string;
  /** Series only - number of seasons reported by the provider. */
  totalSeasons?: number;
}

/** Outcome of a titles query - pages distinguish empty vs error vs setup. */
export interface TitlesResult<T> {
  data: T;
  status: "ok" | "unavailable" | "not-configured";
}
