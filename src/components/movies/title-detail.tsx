import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTitleBySlug, getRelatedTitles, isMoviesDataConfigured } from "@/lib/movies";
import { buttonVariants } from "@/components/ui/button";
import { TitleGrid } from "@/components/movies/title-card";
import { cn } from "@/lib/utils";

/**
 * Shared detail view for /movies/[slug] and /series/[slug]. Renders only
 * provider-backed fields; missing metadata simply does not appear.
 */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-20 shrink-0 font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="text-foreground/90">{value}</span>
    </div>
  );
}

export async function TitleDetailView({
  slug,
  basePath,
}: {
  slug: string;
  basePath: "/movies" | "/series";
}) {
  if (!isMoviesDataConfigured()) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Coming soon</h1>
        <p className="mt-4 max-w-xl text-muted">
          This section needs its data source configured first.
        </p>
        <Link href="/pricing" className={cn(buttonVariants(), "mt-6 bg-[#ffd166] text-black hover:bg-[#f4c255]")}>
          View IPTV Plans
        </Link>
      </section>
    );
  }

  const result = await getTitleBySlug(slug);
  const title = result.data;
  // Unknown id -> real 404; transient outage -> honest error state, no fake page.
  if (!title) {
    if (result.status === "unavailable") {
      return (
        <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Title information is temporarily unavailable
          </h1>
          <p className="mt-4 text-muted">Please try again in a few minutes.</p>
          <Link href={basePath} className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
            Back to {basePath === "/movies" ? "movies" : "series"}
          </Link>
        </section>
      );
    }
    notFound();
  }

  const related = await getRelatedTitles(title);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": title.kind === "series" ? "TVSeries" : "Movie",
    name: title.title,
    ...(title.plot ? { description: title.plot } : {}),
    ...(title.posterUrl ? { image: title.posterUrl } : {}),
    ...(title.released ? { datePublished: title.released } : {}),
    ...(title.director
      ? { director: { "@type": "Person", name: title.director } }
      : {}),
    ...(title.cast.length > 0
      ? {
          actor: title.cast.slice(0, 5).map((name) => ({
            "@type": "Person",
            name,
          })),
        }
      : {}),
    ...(title.rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: title.rating,
            bestRating: 10,
          },
        }
      : {}),
  };

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: blurred poster wash behind the content */}
      {title.posterUrl ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden opacity-20">
          <Image
            src={title.posterUrl}
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-3xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
          <Link href={basePath} className="transition-colors hover:text-foreground">
            {basePath === "/movies" ? "Movies" : "Series"}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground/80">{title.title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* Poster */}
          <div className="relative mx-auto aspect-[2/3] w-56 overflow-hidden rounded-xl border border-border shadow-xl sm:w-64 lg:mx-0 lg:w-full">
            {title.posterUrl ? (
              <Image
                src={title.posterUrl}
                alt={`${title.title} poster`}
                fill
                sizes="(max-width: 1024px) 256px, 280px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-muted">
                No artwork available
              </div>
            )}
          </div>

          {/* Facts */}
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {title.title}
            </h1>
            {title.rating != null || title.year ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {title.rating != null ? (
                  <span className="rounded-md bg-[#ffd166]/10 px-2 py-1 font-bold text-[#ffd166]">
                    ★ {title.rating.toFixed(1)} IMDb
                  </span>
                ) : null}
                {title.year ? <span className="text-muted">{title.year}</span> : null}
                {title.rated ? (
                  <span className="rounded border border-border px-1.5 py-0.5 text-xs font-medium uppercase text-muted">
                    {title.rated}
                  </span>
                ) : null}
                {title.runtime ? <span className="text-muted">{title.runtime}</span> : null}
              </div>
            ) : null}

            {title.genres.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Genres">
                {title.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            ) : null}

            {title.plot ? (
              <p className="mt-6 max-w-2xl leading-relaxed text-foreground/85">
                {title.plot}
              </p>
            ) : null}

            <div className="mt-8 space-y-2">
              {title.kind === "series" && title.totalSeasons != null ? (
                <InfoRow label="Seasons" value={String(title.totalSeasons)} />
              ) : null}
              {title.director ? <InfoRow label="Director" value={title.director} /> : null}
              {title.writer ? <InfoRow label="Writer" value={title.writer} /> : null}
              {title.cast.length > 0 ? (
                <InfoRow label="Cast" value={title.cast.slice(0, 6).join(", ")} />
              ) : null}
              {title.country ? <InfoRow label="Country" value={title.country} /> : null}
              {title.language ? <InfoRow label="Language" value={title.language} /> : null}
              {title.awards ? <InfoRow label="Awards" value={title.awards} /> : null}
            </div>

            {/* Subtle IPTV conversion */}
            <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border border-[#ffd166]/30 bg-card p-5">
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
                Watch {title.kind === "series" ? "shows" : "movies"} like this and
                thousands of live channels with one subscription.
              </p>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants(),
                  "min-h-[42px] shrink-0 bg-[#ffd166] text-black hover:bg-[#f4c255]"
                )}
              >
                View IPTV Plans
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Related titles
            </h2>
            <div className="mt-6">
              <TitleGrid titles={related} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
