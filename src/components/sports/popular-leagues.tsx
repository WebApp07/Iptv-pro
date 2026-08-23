import Image from "next/image";
import Link from "next/link";
import { getPopularLeagues } from "@/lib/sports";

/**
 * Popular leagues from the curated registry, resolved against live provider
 * metadata (24h cached). Only resolved leagues render - unsupported sports
 * or unresolvable entries never appear. Renders nothing on provider failure.
 */
export async function PopularLeagues({
  sport,
  title = "Popular leagues",
}: {
  sport?: string;
  title?: string;
}) {
  const result = await getPopularLeagues(sport);
  if (result.status !== "ok" || result.data.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="popular-leagues-heading">
      <div className="flex items-end justify-between gap-4">
        <h2 id="popular-leagues-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <span className="text-xs uppercase tracking-[0.14em] text-muted">
          Current season
        </span>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {result.data.map(({ entry, league }) => (
          <li key={`${entry.sport}-${entry.slug}`}>
            <Link
              href={`/sports/${entry.sport}/${entry.slug}`}
              className="flex h-full flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-[#ffd166]/40 sm:p-5"
            >
              {league.logoUrl ? (
                <Image
                  src={league.logoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 font-display text-sm font-bold text-muted"
                  aria-hidden="true"
                >
                  {(league.name || entry.label).slice(0, 2).toUpperCase()}
                </span>
              )}
              <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">
                {league.name || entry.label}
              </p>
              {league.country ? (
                <p className="mt-1 text-xs text-muted">{league.country}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-muted">
        Fixtures and standings are provided for discovery. Availability of
        specific competitions in your region depends on your IPTV package.
      </p>
    </section>
  );
}
