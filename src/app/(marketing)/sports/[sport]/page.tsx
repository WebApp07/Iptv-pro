import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LiveEvents } from "@/components/sports/live-events";
import { UpcomingEvents } from "@/components/sports/upcoming-events";
import { PopularLeagues } from "@/components/sports/popular-leagues";
import { ConversionSection } from "@/components/sports/conversion-section";
import { RelatedSportsArticles } from "@/components/sports/related-articles";
import {
  SportCategories,
  resolveSportCategory,
} from "@/components/sports/sport-categories";
import {
  getLiveEventsWithStatus,
  getUpcomingEventsWithStatus,
  isSportSupported,
  isSportsDataConfigured,
} from "@/lib/sports";
import { breadcrumbJsonLd, sportsEventsJsonLd } from "@/lib/sports/schema";
import { siteConfig, siteUrl } from "@/config/site";

/**
 * Clean per-sport routes (/sports/football etc.) sharing the exact same
 * components as the hub - no duplicated UI. Unknown slugs 404; unsupported
 * sports render honest coming-soon states.
 */

const PRE_RENDERED_SPORTS = ["football", "basketball", "tennis", "hockey"] as const;

export function generateStaticParams() {
  return PRE_RENDERED_SPORTS.map((sport) => ({ sport }));
}

type SportPageProps = {
  params: Promise<{ sport: string }>;
};

export async function generateMetadata({ params }: SportPageProps): Promise<Metadata> {
  const { sport: raw } = await params;
  const category = resolveSportCategory(raw);
  // Checked here so unknown slugs skip straight to the not-found UI.
  if (!category || category.slug === "all") notFound();

  const label = category.label;
  const url = siteUrl(`/sports/${category.slug}`);

  return {
    title: `${label} Schedule & Scores`,
    description: `Live ${label.toLowerCase()} scores, upcoming fixtures and the leagues that matter. Follow every match and discover where to watch.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} Schedule & Scores | ${siteConfig.name}`,
      description: `Live ${label.toLowerCase()} scores, upcoming fixtures and the leagues that matter.`,
      url,
      images: [{ url: siteConfig.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} Schedule & Scores`,
      description: `Live ${label.toLowerCase()} scores, upcoming fixtures and the leagues that matter.`,
    },
  };
}

export default async function SportPage({ params }: SportPageProps) {
  const { sport: raw } = await params;
  const category = resolveSportCategory(raw);
  if (!category || category.slug === "all") notFound();

  const label = category.label;

  // Warm every section query in one parallel batch - sections below then
  // resolve from React cache() with zero sequential lookups. Unsupported
  // sports are detected first so no upstream calls are made for them.
  let eventsJsonLd: object | null = null;
  const supported = await isSportSupported(category.slug);
  if (isSportsDataConfigured() && supported) {
    try {
      const [upcoming] = await Promise.all([
        getUpcomingEventsWithStatus({ limit: 12 }),
        getLiveEventsWithStatus({ limit: 9 }),
      ]);
      if (upcoming.status === "ok") {
        eventsJsonLd = sportsEventsJsonLd(upcoming.data);
      }
    } catch {
      // Structured data is additive - never block rendering on it.
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="text-foreground/80">{label}</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              {label}
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {label}{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                schedule &amp; scores
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Live {label.toLowerCase()} scores, upcoming fixtures and the
              leagues that matter - all in one place.
            </p>
          </div>

          <div className="mt-10">
            <SportCategories active={category.slug} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 pb-16 sm:px-6 lg:px-8">
        <LiveEvents limit={9} sport={category.slug} />
        <UpcomingEvents limit={12} sport={category.slug} />
        <PopularLeagues sport={category.slug} title={`${label} leagues`} />
        <ConversionSection />
        <RelatedSportsArticles terms={[category.label.toLowerCase()]} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteUrl("/") },
              { name: "Sports", url: siteUrl("/sports") },
              { name: label, url: siteUrl(`/sports/${category.slug}`) },
            ])
          ),
        }}
      />
      {eventsJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }}
        />
      ) : null}
    </>
  );
}
