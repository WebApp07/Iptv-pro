import type { Metadata } from "next";
import Link from "next/link";
import {
  getMoreSeries,
  getPopularSeries,
  isMoviesDataConfigured,
  searchTitles,
} from "@/lib/movies";
import { TitleGrid, TitlesShelf } from "@/components/movies/title-card";

export const metadata: Metadata = {
  title: "Series | Discover Shows on IPTV Pro",
  description:
    "Discover TV series by rating, genre and year - IMDb-powered information for every show available in our IPTV plans.",
  alternates: { canonical: "/series" },
};

/** Series discovery - mirrors the /movies page with kind=series search. */
export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!isMoviesDataConfigured()) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Series</h1>
        <p className="mt-4 max-w-xl text-muted">
          Series discovery is coming soon - this section needs its data source
          configured first.
        </p>
      </section>
    );
  }

  const search = query ? await searchTitles(query, "series") : null;
  const [popular, more] = query
    ? [null, null]
    : await Promise.all([getPopularSeries(), getMoreSeries()]);

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
              Series
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Browse shows by rating, genre and year - powered by IMDb data.
          </p>
          <form action="/series" method="get" className="mt-6 flex max-w-xl gap-2" role="search">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search series by title..."
              aria-label="Search series by title"
              className="min-h-[46px] w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-[#ffd166]/60 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[46px] shrink-0 rounded-md bg-[#ffd166] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#f4c255]"
            >
              Search
            </button>
          </form>
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
                  : "Series search is temporarily unavailable - please try again shortly."}
              </p>
              {search!.data.length > 0 ? <TitleGrid titles={search!.data} /> : null}
            </>
          ) : (
            <>
              <TitlesShelf label="Popular Series" result={popular!} />
              <TitlesShelf label="More To Watch" result={more!} />
            </>
          )}

          <p className="text-center text-sm text-muted">
            Prefer films? Browse our{" "}
            <Link href="/movies" className="font-semibold text-[#ffd166] hover:text-[#f4c255]">
              movie collection
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
