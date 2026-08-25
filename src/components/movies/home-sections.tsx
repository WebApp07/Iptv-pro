import Link from "next/link";
import {
  getPopularMovies,
  getPopularSeries,
  getTopRatedMovies,
  getTrendingMovies,
  isMoviesDataConfigured,
} from "@/lib/movies";import { TitlesShelf } from "@/components/movies/title-card";

/**
 * Homepage Movies & Series sections. Renders nothing when OMDB_API_KEY is
 * missing - the site never breaks without credentials.
 */
export async function MoviesHomeSections() {
  if (!isMoviesDataConfigured()) return null;

  const [trending, popular, topRated, series] = await Promise.all([
    getTrendingMovies(),
    getPopularMovies(),
    getTopRatedMovies(),
    getPopularSeries(),
  ]);

  const hasAny =
    trending.data.length + popular.data.length + topRated.data.length + series.data.length >
    0;
  if (!hasAny) return null;

  return (
    <section className="relative space-y-16 py-24">
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Your Next Favorite
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            From trending movies to top-rated series, find something worth
            watching.
          </p>
        </div>
        <TitlesShelf label="Trending Movies" result={trending} max={5} />
        <TitlesShelf label="Popular Movies" result={popular} max={5} />
        <TitlesShelf label="Popular Series" result={series} max={5} />
        <TitlesShelf label="Top Rated" result={topRated} max={5} />
        <p className="text-center text-sm text-muted">
          Discover more in{" "}
          <Link
            href="/movies"
            className="font-semibold text-[#ffd166] hover:text-[#f4c255]"
          >
            Movies
          </Link>{" "}
          and{" "}
          <Link
            href="/series"
            className="font-semibold text-[#ffd166] hover:text-[#f4c255]"
          >
            Series
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
