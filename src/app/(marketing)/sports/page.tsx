import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { LiveEvents } from "@/components/sports/live-events";
import { UpcomingEvents } from "@/components/sports/upcoming-events";
import { SportCategories } from "@/components/sports/sport-categories";
import { PopularLeagues } from "@/components/sports/popular-leagues";
import { ConversionSection } from "@/components/sports/conversion-section";
import { RelatedSportsArticles } from "@/components/sports/related-articles";
import {
  getLiveEventsWithStatus,
  getUpcomingEventsWithStatus,
  isSportsDataConfigured,
} from "@/lib/sports";
import { breadcrumbJsonLd, sportsEventsJsonLd } from "@/lib/sports/schema";
import { siteConfig, siteUrl } from "@/config/site";

/**
 * Fixture data is time-sensitive: the HTML revalidates every minute while
 * the underlying queries keep finer windows (live 30s, upcoming 5min).
 *
 * Legacy ?sport=<slug> URLs are redirected to clean /sports/<slug> routes
 * by src/proxy.ts before this page renders.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Live Sports & Scores",
  description:
    "Follow today's biggest games, live scores, upcoming matches and your favorite leagues.",
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

async function eventsJsonLd(): Promise<object | null> {
  if (!isSportsDataConfigured()) return null;
  try {
    const result = await getUpcomingEventsWithStatus({ limit: 12 });
    if (result.status !== "ok") return null;
    return sportsEventsJsonLd(result.data);
  } catch {
    // Structured data is additive - never block rendering on it.
    return null;
  }
}

export default async function SportsPage() {
  // Pre-warm the section queries in parallel: the sections below then hit
  // React cache() instead of issuing their own lookups, removing any
  // render-time waterfall between them.
  const jsonLdEventsPromise = eventsJsonLd();
  await Promise.all([
    jsonLdEventsPromise,
    isSportsDataConfigured() ? getLiveEventsWithStatus({ limit: 9 }) : null,
    isSportsDataConfigured() ? getUpcomingEventsWithStatus({ limit: 12 }) : null,
  ].filter(Boolean));
  const jsonLdEvents = await jsonLdEventsPromise;

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
            <SportCategories active="all" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 pb-16 sm:px-6 lg:px-8">
        <LiveEvents limit={9} />
        <UpcomingEvents limit={12} />
        <PopularLeagues />
        <ConversionSection />
        <RelatedSportsArticles />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteUrl("/") },
              { name: "Sports", url: siteUrl("/sports") },
            ])
          ),
        }}
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
