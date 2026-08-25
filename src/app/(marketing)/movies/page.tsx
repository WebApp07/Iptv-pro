import type { Metadata } from "next";
import Link from "next/link";
import {
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  isMoviesDataConfigured,
  searchTitles,
} from "@/lib/movies";
import { TitleGrid, TitlesShelf } from "@/components/movies/title-card";

export const metadata: Metadata = {
  title: "Movies | Discover Films on IPTV Pro",
  description:
    "Discover movies by rating, genre and year - IMDb-powered information for every title available in our IPTV plans.",
  alternates: { canonical: "/movies" },
};

/**
 * Movies discovery (Server Component). ?q= runs a provider title search;
 * without a query the curated shelves render. All data flows through the
 * cached service layer - identical requests dedupe automatically.
 */

function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/movies" method="get" className="mt-6 flex max-w-xl gap-2" role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search movies by title..."
        aria-label="Search movies by title"
        className="min-h-[46px] w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-[#ffd166]/60 focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-[46px] shrink-0 rounded-md bg-[#ffd166] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#f4c255]"
      >
        Search
      </button>
    </form>
  );
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!isMoviesDataConfigured()) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Movies</h1>
        <p className="mt-4 max-w-xl text-muted">
          Movie discovery is coming soon - this section needs its data source
          configured first.
        </p>
      </section>
    );
  }

  const search = query ? await searchTitles(query, "movie") : null;
  const [trending, popular, topRated] = query
    ? [null, null, null]
    : await Promise.all([getTrendingMovies(), getPopularMovies(), getTopRatedMovies()]);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Discover{" "}
            <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
              Movies
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Browse films by rating, genre and year - powered by IMDb data.
          </p>
          <SearchBox defaultValue={query} />
        </div>

        <div className="mt-12 space-y-16">
          {query || search ? (
            <>
              <p
                className="text-xs uppercase tracking-[0.15em] text-muted"
                role="status"
              >
                {search!.status === "ok"
                  ? `${search!.data.length} result${search!.data.length === 1 ? "" : "s"} for "${query}"`
                  : "Movie search is temporarily unavailable - please try again shortly."}
              </p>
              {search!.data.length > 0 ? <TitleGrid titles={search!.data} /> : null}
            </>
          ) : (
            <>
              <TitlesShelf label="Trending" result={trending!} />
              <TitlesShelf label="Popular" result={popular!} />
              <TitlesShelf label="Top Rated" result={topRated!} />
            </>
          )}

          <p className="text-center text-sm text-muted">
            Looking for shows? Browse our{" "}
            <Link href="/series" className="font-semibold text-[#ffd166] hover:text-[#f4c255]">
              series collection
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
