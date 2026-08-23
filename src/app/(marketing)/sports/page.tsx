import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { LiveEvents } from "@/components/sports/live-events";
import { UpcomingEvents } from "@/components/sports/upcoming-events";
import { siteConfig, siteUrl } from "@/config/site";

/**
 * Live and upcoming fixtures are intentionally time-sensitive, so this route
 * revalidates frequently. Data-level windows are set per query in
 * src/lib/sports/cache.ts (live 30s, upcoming 5min).
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sports Schedule",
  description:
    "Live scores and upcoming fixtures for the leagues that matter - football and more. Never miss a match.",
  alternates: {
    canonical: siteUrl("/sports"),
  },
  openGraph: {
    title: `Sports Schedule | ${siteConfig.name}`,
    description:
      "Live scores and upcoming fixtures for the leagues that matter.",
    url: siteUrl("/sports"),
    images: [{ url: siteConfig.ogImage }],
  },
};

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

export default function SportsPage() {
  // Sections are async Server Components that fetch their own data through
  // src/lib/sports - no client-side fetching anywhere on this page.
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              Sports Hub
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Live scores{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                &amp; fixtures
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Follow the matches that matter, then watch them on any device
              with your IPTV Pro subscription.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-16 px-4 pb-24 sm:px-6 lg:px-8">
        <LiveEvents limit={9} />
        <UpcomingEvents limit={12} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
    </>
  );
}
