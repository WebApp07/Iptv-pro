import Image from "next/image";
import Link from "next/link";
import type { TitleSummary } from "@/lib/movies";

/** Poster card for every titles grid - list pages and homepage sections. */
export function TitleCard({ title }: { title: TitleSummary }) {
  const href = title.kind === "series" ? `/series/${title.slug}` : `/movies/${title.slug}`;
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[#ffd166]/40"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary/40">
        {title.posterUrl ? (
          <Image
            src={title.posterUrl}
            alt={`${title.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
            {title.title}
          </div>
        )}
        {title.rating != null ? (
          <span className="absolute right-2 top-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-bold text-[#ffd166]">
            ★ {title.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 font-display text-sm font-semibold tracking-tight">
          {title.title}
        </p>
        <p className="text-xs text-muted">
          {[title.year, title.genres[0]].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

export function TitleGrid({ titles }: { titles: readonly TitleSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {titles.map((title) => (
        <TitleCard key={title.id} title={title} />
      ))}
    </div>
  );
}

/** Shared shelf header + optional empty/error states. */
export function TitlesShelf({
  label,
  result,
  max = 10,
}: {
  label: string;
  result: { data: readonly TitleSummary[]; status: string };
  max?: number;
}) {
  if (result.status !== "ok" || result.data.length === 0) return null;
  return (
    <section aria-labelledby={`shelf-${label}`}>
      <h2
        id={`shelf-${label}`}
        className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {label}
      </h2>
      <div className="mt-6">
        <TitleGrid titles={result.data.slice(0, max)} />
      </div>
    </section>
  );
}
