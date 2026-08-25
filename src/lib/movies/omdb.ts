import type {
  TitleDetail,
  TitleKind,
  TitleSummary,
} from "./types";

/**
 * Adapter for the OMDb API (https://www.omdbapi.com) - the licensed source
 * of IMDb ratings and metadata.
 *
 * Contract notes:
 * - Auth travels as an `apikey` QUERY parameter; OMDb does NOT echo it in
 *   responses, but URLs are still never logged.
 * - Failures arrive as HTTP 200 with Response:"False" + Error:"...".
 * - There is no trending/list endpoint; the service layer fetches curated
 *   IMDb ids (see ../seeds) through the detail endpoint instead.
 * - Posters are served from m.media-amazon.com (whitelisted in
 *   next.config.ts).
 *
 * Server-side only: OMDB_API_KEY is read at call time.
 */

const DEFAULT_TIMEOUT_MS = 8_000;

interface OmdbSearchRow {
  imdbID?: string;
  Title?: string;
  Year?: string;
  Type?: string;
  Poster?: string;
}

interface OmdbEnvelope<T> {
  Response?: string;
  Error?: string;
  Search?: T[];
  totalResults?: string;
}

interface OmdbDetail extends OmdbSearchRow {
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Metascore?: string;
  imdbRating?: string;
  totalSeasons?: string;
}

export class MoviesProviderError extends Error {
  readonly detail?: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.name = "MoviesProviderError";
    this.detail = detail;
  }
}

/** "The Dark Knight" -> "the-dark-knight". */
function titleToSlugPart(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeTitleSlug(title: string, imdbId: string): string {
  const part = titleToSlugPart(title);
  return part ? `${part}-${imdbId}` : imdbId;
}

/** Extracts the trailing IMDb id from a slug; null when absent. */
export function extractImdbId(slug: string): string | null {
  const match = /(tt\d+)/i.exec(slug);
  return match ? match[1]! : null;
}

function toRating(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function splitList(value: string | undefined): string[] {
  return value
    ? value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

function posterOrUndefined(poster: string | undefined): string | undefined {
  // OMDb uses the literal "N/A" for missing images.
  return poster && poster !== "N/A" ? poster : undefined;
}

/* ------------------------------------------------------------------ */
/* HTTP plumbing                                                       */
/* ------------------------------------------------------------------ */

async function request<T>(
  params: Record<string, string | number | undefined>,
  timeoutMs: number,
  revalidate: number
): Promise<T> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) throw new MoviesProviderError("Missing OMDB_API_KEY");
  const host = process.env.OMDB_API_HOST || "https://www.omdbapi.com";

  const url = new URL(`${host.replace(/\/+$/, "")}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  url.searchParams.set("apikey", apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate },
    });
    if (!res.ok) {
      throw new MoviesProviderError(`HTTP ${res.status} from OMDb`);
    }
    const body = (await res.json()) as OmdbEnvelope<unknown> & T;
    if (body.Response === "False") {
      throw new MoviesProviderError(
        "OMDb reported failure",
        body.Error ?? "unknown error"
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof MoviesProviderError) throw error;
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new MoviesProviderError(`OMDb request timed out after ${timeoutMs}ms`);
    }
    throw new MoviesProviderError("OMDb request failed", error);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

export function mapSearchRow(row: OmdbSearchRow): TitleSummary | null {
  if (!row.imdbID || !row.Title) return null;
  return {
    id: row.imdbID,
    slug: makeTitleSlug(row.Title, row.imdbID),
    kind: row.Type === "series" ? "series" : "movie",
    title: row.Title,
    year: row.Year ?? "",
    genres: [],
    posterUrl: posterOrUndefined(row.Poster),
  };
}

export function mapDetail(detail: OmdbDetail): TitleDetail | null {
  if (!detail.imdbID || !detail.Title) return null;
  const kind: TitleKind = detail.Type === "series" ? "series" : "movie";
  return {
    id: detail.imdbID,
    slug: makeTitleSlug(detail.Title, detail.imdbID),
    kind,
    title: detail.Title,
    year: detail.Year ?? "",
    rating: toRating(detail.imdbRating),
    genres: splitList(detail.Genre),
    posterUrl: posterOrUndefined(detail.Poster),
    plot:
      detail.Plot && detail.Plot !== "N/A" ? detail.Plot : undefined,
    runtime: detail.Runtime && detail.Runtime !== "N/A" ? detail.Runtime : undefined,
    rated: detail.Rated && detail.Rated !== "N/A" ? detail.Rated : undefined,
    released: detail.Released && detail.Released !== "N/A" ? detail.Released : undefined,
    director:
      detail.Director && detail.Director !== "N/A" ? detail.Director : undefined,
    writer: detail.Writer && detail.Writer !== "N/A" ? detail.Writer : undefined,
    cast: splitList(detail.Actors),
    language:
      detail.Language && detail.Language !== "N/A" ? detail.Language : undefined,
    country:
      detail.Country && detail.Country !== "N/A" ? detail.Country : undefined,
    awards: detail.Awards && detail.Awards !== "N/A" ? detail.Awards : undefined,
    ...(kind === "series"
      ? { totalSeasons: toRating(detail.totalSeasons) }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Adapter                                                             */
/* ------------------------------------------------------------------ */

export function createOmdbAdapter(options?: { timeoutMs?: number }) {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  /** Catalog data changes rarely; a day keeps quota usage tiny. */
  const LIST_REVALIDATE = 86_400;
  const DETAIL_REVALIDATE = 86_400;

  return {
    isConfigured() {
      return Boolean(process.env.OMDB_API_KEY);
    },

    async fetchDetail(imdbId: string): Promise<TitleDetail | null> {
      try {
        const body = await request<OmdbDetail>(
          { i: imdbId, plot: "full" },
          timeoutMs,
          DETAIL_REVALIDATE
        );
        return mapDetail(body);
      } catch (error) {
        // Unknown id (404-equivalent) is an honest miss, not an outage.
        if (error instanceof MoviesProviderError && error.detail === "Movie not found!") {
          return null;
        }
        throw error;
      }
    },

    async fetchDetails(imdbIds: readonly string[]): Promise<TitleSummary[]> {
      const details = await Promise.all(
        imdbIds.map(async (id) => {
          try {
            return await this.fetchDetail(id);
          } catch {
            // One bad seed never blanks a whole shelf.
            return null;
          }
        })
      );
      return details.filter((d): d is TitleDetail => d !== null);
    },

    async search(query: string, kind?: TitleKind, limit = 24): Promise<TitleSummary[]> {
      const body = await request<OmdbEnvelope<OmdbSearchRow>>(
        { s: query, type: kind, page: 1 },
        timeoutMs,
        LIST_REVALIDATE
      );
      return (Array.isArray(body.Search) ? body.Search : [])
        .map(mapSearchRow)
        .filter((t): t is TitleSummary => t !== null)
        .slice(0, limit);
    },
  };
}
