import Link from "next/link";
import Image from "next/image";
import { LiveEvents } from "@/components/sports/live-events";
import { UpcomingEvents } from "@/components/sports/upcoming-events";
import { ConversionSection } from "@/components/sports/conversion-section";
import { RelatedSportsArticles } from "@/components/sports/related-articles";
import {
  getLiveEventsWithStatus,
  isSportsDataConfigured,
} from "@/lib/sports";
import type { League } from "@/lib/sports";
import type { LeagueRegistryEntry } from "@/lib/sports/leagues";
import type { SportCategorySlug } from "@/components/sports/sport-categories";
import { breadcrumbJsonLd } from "@/lib/sports/schema";
import { siteUrl } from "@/config/site";

/**
 * League schedule page content. Two honest states:
 * - provider covers the league: live + upcoming fixtures, indexable
 * - registry entry without provider coverage: coming-soon shell, noindex
 *   (handled by generateMetadata; nothing here pretends to have data)
 */
export async function LeaguePageContent({
  category,
  resolved,
}: {
  category: { slug: SportCategorySlug; label: string };
  resolved: { entry: LeagueRegistryEntry; league: League | null };
}) {
  const { entry, league } = resolved;
  const covered = league !== null;
  const leaguePath = `/sports/${category.slug}/${entry.slug}`;

  let liveCount = 0;
  if (league && isSportsDataConfigured()) {
    try {
      const live = await getLiveEventsWithStatus({ leagueId: league.id });
      if (live.status === "ok") liveCount = live.data.length;
    } catch {
      // Section will render its own state.
    }
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/sports" className="transition-colors hover:text-foreground">
              Sports
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/sports/${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.label}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-foreground/80">{entry.label}</span>
          </nav>

          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {league?.logoUrl ? (
              <Image
                src={league.logoUrl}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 shrink-0 object-contain sm:h-18 sm:w-18"
              />
            ) : (
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-card font-display text-lg font-bold text-muted"
                aria-hidden="true"
              >
                {entry.label.slice(0, 3).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {league?.name ?? entry.label}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                {[
                  `${category.label} schedule`,
                  league?.country,
                  league ? "live scores & upcoming fixtures" : "coverage coming soon",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 pb-16 sm:px-6 lg:px-8">
        {covered && league ? (
          <>
            {liveCount > 0 ? (
              <LiveEvents limit={9} leagueId={league.id} />
            ) : null}
            <UpcomingEvents limit={12} leagueId={league.id} />
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-bold">
              {entry.label} coverage coming soon
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              We don&apos;t have schedules for this competition yet. Check the
              other sports in the meantime.
            </p>
            <Link
              href="/sports"
              className="mt-6 inline-block text-sm font-medium text-[#ffd166] transition-colors hover:text-[#f4c255]"
            >
              Browse all sports
            </Link>
          </div>
        )}

        <ConversionSection />
        <RelatedSportsArticles
          terms={[
            entry.label.toLowerCase(),
            ...(league?.name ? [league.name.toLowerCase()] : []),
            category.slug,
          ]}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteUrl("/") },
              { name: "Sports", url: siteUrl("/sports") },
              { name: category.label, url: siteUrl(`/sports/${category.slug}`) },
              { name: entry.label, url: siteUrl(leaguePath) },
            ])
          ),
        }}
      />
    </>
  );
}
