import { cache } from "react";
import type {
  TitleDetail,
  TitleKind,
  TitleSummary,
  TitlesResult,
} from "./types";
import {
  MORE_SERIES_IDS,
  POPULAR_MOVIE_IDS,
  POPULAR_SERIES_IDS,
  TOP_RATED_MOVIE_IDS,
  TRENDING_MOVIE_IDS,
} from "./seeds";
import { createOmdbAdapter, extractImdbId } from "./omdb";

/**
 * Server-only movies/series data access.
 *
 * SERVER-ONLY: reads OMDB_API_KEY at call time; import exclusively from
 * Server Components / Route Handlers - never from "use client" modules.
 *
 * Mirrors the src/lib/sports contract: queries return a status so pages can
 * distinguish "not configured" from "temporarily unavailable" from real
 * empty results, and expected provider failures never throw to the UI.
 */

const adapter = createOmdbAdapter();

export type {
  TitleDetail,
  TitleKind,
  TitleSummary,
  TitlesResult,
} from "./types";

/** True when OMDB_API_KEY exists - use it to pick content vs setup state. */
export function isMoviesDataConfigured(): boolean {
  return adapter.isConfigured();
}

async function safeTitles<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<TitlesResult<T>> {
  if (!adapter.isConfigured()) {
    return { data: fallback, status: "not-configured" };
  }
  try {
    return { data: await operation(), status: "ok" };
  } catch (error) {
    console.warn(
      "[movies]",
      error instanceof Error ? error.message : error
    );
    return { data: fallback, status: "unavailable" };
  }
}

/* Cached shelves - primitive keys keep dedupe reliable across sections. */

const shelfCore = cache(async (ids: readonly string[]) =>
  safeTitles(() => adapter.fetchDetails(ids), [] as TitleSummary[])
);

const detailCore = cache(async (imdbId: string) =>
  safeTitles(() => adapter.fetchDetail(imdbId), null as TitleDetail | null)
);

const searchCore = cache(
  async (query: string, kind?: TitleKind, limit?: number) =>
    safeTitles(() => adapter.search(query, kind, limit), [] as TitleSummary[])
);

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getTrendingMovies(): Promise<TitlesResult<TitleSummary[]>> {
  return shelfCore(TRENDING_MOVIE_IDS);
}

export async function getPopularMovies(): Promise<TitlesResult<TitleSummary[]>> {
  return shelfCore(POPULAR_MOVIE_IDS);
}

export async function getTopRatedMovies(): Promise<TitlesResult<TitleSummary[]>> {
  return shelfCore(TOP_RATED_MOVIE_IDS);
}

export async function getPopularSeries(): Promise<TitlesResult<TitleSummary[]>> {
  return shelfCore(POPULAR_SERIES_IDS);
}

export async function getMoreSeries(): Promise<TitlesResult<TitleSummary[]>> {
  return shelfCore(MORE_SERIES_IDS);
}

/**
 * Related titles: other entries from the same curated shelf, excluding the
 * current one. Cheap - the shelf is already cached by the homepage.
 */
export async function getRelatedTitles(
  current: TitleSummary
): Promise<TitleSummary[]> {
  const ids =
    current.kind === "series"
      ? [...POPULAR_SERIES_IDS, ...MORE_SERIES_IDS]
      : [...TRENDING_MOVIE_IDS, ...TOP_RATED_MOVIE_IDS, ...POPULAR_MOVIE_IDS];
  const result = await shelfCore(ids);
  if (result.status !== "ok") return [];
  return result.data.filter((title) => title.id !== current.id).slice(0, 6);
}

/** Full record for a /movies/[slug] or /series/[slug] route. */
export async function getTitleBySlug(
  slug: string
): Promise<TitlesResult<TitleDetail | null>> {
  const imdbId = extractImdbId(slug);
  if (!imdbId) return { data: null, status: "ok" };
  return detailCore(imdbId.toLowerCase());
}

/** Title search by name; kind narrows to movies or series. */
export async function searchTitles(
  query: string,
  kind?: TitleKind,
  limit = 24
): Promise<TitlesResult<TitleSummary[]>> {
  const trimmed = query.trim();
  if (!trimmed) return { data: [], status: "ok" };
  return searchCore(trimmed, kind, limit);
}
