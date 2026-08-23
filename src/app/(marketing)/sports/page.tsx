import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { LiveEvents } from "@/components/sports/live-events";
import { UpcomingEvents } from "@/components/sports/upcoming-events";
import {
  SportCategories,
  isValidSportCategory,
} from "@/components/sports/sport-categories";
import { PopularLeagues } from "@/components/sports/popular-leagues";
import { ConversionSection } from "@/components/sports/conversion-section";
import { RelatedSportsArticles } from "@/components/sports/related-articles";
import { getUpcomingEventsWithStatus, isSportsDataConfigured } from "@/lib/sports";
import { siteConfig, siteUrl } from "@/config/site";

/**
 * Fixture data is time-sensitive: the HTML revalidates every minute while
 * the underlying queries keep finer windows (live 30s, upcoming 5min).
 */
export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}): Promise<Metadata> {
  const { sport } = await searchParams;
  const filtered = Boolean(sport && sport !== "all");

  return {
    title: filtered ? `${sport} schedule` : "Live Sports & Scores",
    description:
      "Follow today's biggest games, live scores, upcoming matches and your favorite leagues.",
    // Filtered views are near-duplicates of the hub - crawlable but not indexable.
    robots: filtered ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: siteUrl("/sports"),
    },
    openGraph: {
      title: `Live Sports & Scores | ${siteConfig.name}`,
      description:
        "Follow today's biggest games, live scores, upcoming matches and your favorite leagues.",
      url: siteUrl("/sports"),
      images: [{ url: siteConfig.ogImage }],
    },
  };
}

function breadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sports",
        item: siteUrl("/sports"),
      },
    ],
  };
}

/**
 * SportsEvent structured data built strictly from real provider data -
 * only emitted when fixtures were actually returned.
 */
async function sportsEventsJsonLd() {
  if (!isSportsDataConfigured()) return null;
  try {
    const result = await getUpcomingEventsWithStatus({ limit: 12 });
    if (result.status !== "ok" || result.data.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: result.data.map((match, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SportsEvent",
          name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          startDate: match.startTime || undefined,
          eventStatus:
            match.status === "postponed"
              ? "https://schema.org/EventPostponed"
              : match.status === "canceled"
                ? "https://schema.org/EventCancelled"
                : "https://schema.org/EventScheduled",
          sport: match.sportId,
          ...(match.venue?.name
            ? {
                location: {
                  "@type": "Place",
                  name: match.venue.name,
                  address: match.venue.city,
                },
              }
            : {}),
          competitor: [
            { "@type": "SportsTeam", name: match.homeTeam.name },
            { "@type": "SportsTeam", name: match.awayTeam.name },
          ],
        },
      })),
    };
  } catch {
    return null;
  }
}

export default async function SportsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const activeCategory =
    sport && isValidSportCategory(sport) ? sport : ("all" as const);
  const activeSport =
    activeCategory === "all" ? undefined : activeCategory;

  const jsonLdEvents = await sportsEventsJsonLd();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              Schedule &amp; Scores
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Live{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                Sports &amp; Scores
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Follow today&apos;s biggest games, live scores, upcoming matches
              and your favorite leagues.
            </p>
          </div>

          <div className="mt-10">
            <SportCategories active={activeCategory} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 pb-16 sm:px-6 lg:px-8">
        <LiveEvents limit={9} sport={activeSport} />
        <UpcomingEvents limit={12} sport={activeSport} />
        <PopularLeagues />
        <ConversionSection />
        <RelatedSportsArticles />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
      {jsonLdEvents ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvents) }}
        />
      ) : null}
    </>
  );
}
