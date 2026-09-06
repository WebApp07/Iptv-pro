import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FreeTrialButton } from "@/components/free-trial/free-trial-button";
import { siteConfig, siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About TV96",
  description:
    "TV96 is an IPTV subscription service: live TV channels from around the world, international sport, and a movie and series library on the devices you already own.",
  alternates: { canonical: siteUrl("/about") },
};

const offers = [
  {
    title: "Live TV channels",
    description:
      "20,000+ live channels from countries around the world, including dedicated Arabic lineups, all under one subscription.",
  },
  {
    title: "International sport",
    description:
      "Schedules, live scores and fixtures for football, basketball, tennis and cricket, with league pages for the competitions that matter.",
  },
  {
    title: "Movies & series",
    description:
      "A discovery library with ratings, cast and release info so you can find what to watch next, then watch it on your plan.",
  },
];

const features = [
  "One subscription for live TV, sport, movies and series",
  "Channels from all over the world, plus Arabic channels",
  "Live scores and fixtures for the sports you follow",
  "Full HD, with 4K where the source and your screen support it",
  "EPG TV guide so you always know what is on",
  "Anti-freeze technology tuned for live matches",
  "Fast activation - your login arrives within minutes",
  "No contracts - pick a term and stop whenever you like",
];

const devices = [
  "Smart TVs (Samsung, LG)",
  "Android TV boxes",
  "Amazon Fire TV Stick",
  "Apple TV",
  "Android phones & tablets",
  "iPhone & iPad",
  "Windows & macOS computers",
];

const faqs = [
  {
    question: "What is TV96?",
    answer:
      "TV96 is an IPTV subscription service. A single subscription gives you live TV channels from around the world, schedules and live scores for the sports you follow, and a movie and series library.",
  },
  {
    question: "Which channels can I watch?",
    answer:
      "TV96 streams 20,000+ live channels from countries worldwide, including dedicated Arabic channel groups. Every channel that is listed is included in every plan.",
  },
  {
    question: "Which sports does TV96 cover?",
    answer:
      "Football, basketball, tennis and cricket today, with live scores, upcoming fixtures and pages for the top leagues in each sport.",
  },
  {
    question: "What devices does TV96 work on?",
    answer:
      "Smart TVs from Samsung and LG, Android TV boxes, Amazon Fire TV Stick, Apple TV, Android phones and tablets, iPhone and iPad, and Windows and macOS computers.",
  },
  {
    question: "How does activation work?",
    answer:
      "Pick a plan, complete checkout, and your login details arrive by email and WhatsApp, usually within minutes. Then open the app or web player on any supported device and start watching.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. TV96 offers a free 24-hour trial so you can check the channel lineup and picture quality before you commit to a plan.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Plans run from one month up to twelve months with no contracts, so you can stop whenever you like without a surprise renewal.",
  },
  {
    question: "How do I get help if something is not working?",
    answer:
      "Support is available around the clock by WhatsApp and email. Message us with your device and we will walk you through the setup step by step - most questions get a reply within minutes.",
  },
];

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TV96",
    url: siteUrl("/"),
    description: siteConfig.description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.supportEmail,
      availableLanguage: ["English"],
    },
  };
}

function breadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "About", item: siteUrl("/about") },
    ],
  };
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
    >
      {children}
    </Badge>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd166]"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <SectionHeading>About TV96</SectionHeading>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Live TV, sport, movies and series -{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                one subscription
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              TV96 is an IPTV subscription service. One subscription
              gives you live TV channels from around the world, live sport
              schedules and scores, and a movie and series library - all on
              the devices you already own. No contracts, and your login
              arrives within minutes on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card
              key={offer.title}
              className="group border-border bg-card transition-colors hover:border-[#ffd166]/40"
            >
              <CardContent className="p-7">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {offer.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {offer.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading>Who it is for</SectionHeading>
            <SectionTitle>Built around what you actually watch</SectionTitle>
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                TV96 is for anyone who wants more than what their local
                cable package offers:
              </p>
              <ul className="space-y-3">
                {[
                  "Expats and international viewers who want channels from home",
                  "Sports fans who follow leagues and live matches across countries",
                  "Households that want one subscription shared across TVs, phones and tablets",
                  "Viewers who want a bigger channel lineup and a movie library without long-term contracts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionHeading>Main features</SectionHeading>
            <SectionTitle>Everything in every plan</SectionTitle>
            <ul className="mt-5 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80">
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading>Supported devices</SectionHeading>
          <SectionTitle>Watch on the screens you already own</SectionTitle>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            TV96 works across the devices most households already have, all
            under one subscription. Start watching on one screen and pick up
            on another without extra setup.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {devices.map((device) => (
              <span
                key={device}
                className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80"
              >
                {device}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading>Customer support</SectionHeading>
          <SectionTitle>Help that actually answers</SectionTitle>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Setup is done over WhatsApp or email, in your language. When a
            channel stutters or a device won&apos;t connect, a real person
            replies - around the clock, usually within minutes.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              )}
            >
              Message us on WhatsApp
            </a>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-[42px]"
              )}
            >
              Email {siteConfig.supportEmail}
            </a>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading>Free trial & subscriptions</SectionHeading>
          <SectionTitle>Try it before you pay</SectionTitle>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Every new viewer can take a free 24-hour trial and check the
            lineup and picture quality first. Plans start at €14.99 a month,
            for one or two devices, from 1 to 12 months, with HD and 4K where
            the source supports it. No contracts - stop whenever you like.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <FreeTrialButton
              size="lg"
              className="bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            >
              Start Your 24-Hour Free Trial
            </FreeTrialButton>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-[42px]"
              )}
            >
              See plans &amp; pricing
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading>Why TV96</SectionHeading>
          <SectionTitle>Why customers choose TV96</SectionTitle>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Live sport that holds up",
                description:
                  "Live matches are what break most IPTV services. TV96 keeps dedicated servers for sport so the picture holds steady when the game is on.",
              },
              {
                title: "A lineup that matches you",
                description:
                  "The international channels and sports you actually follow - not a list you will never open.",
              },
              {
                title: "One subscription, every screen",
                description:
                  "Smart TV, phone, tablet or laptop under a single plan. Switch screens without extra setup.",
              },
              {
                title: "Crisp HD and 4K",
                description:
                  "Full HD on everyday channels, 4K on big matches and new releases, wherever the source supports it.",
              },
              {
                title: "Fast, simple activation",
                description:
                  "A couple of clicks and your login lands on WhatsApp within minutes - no contracts, no surprise renewals.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-border bg-card transition-colors hover:border-[#ffd166]/40"
              >
                <CardContent className="p-7">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <section aria-labelledby="faq-section-heading" className="mt-16">
          <SectionHeading>FAQ</SectionHeading>
          <SectionTitle>Questions people ask</SectionTitle>
          <div className="mt-8 space-y-3 max-w-3xl">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card/60 transition-colors open:border-[#ffd166]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
                  <h3 id={`about-faq-${index}`} className="text-sm font-semibold sm:text-base">
                    {faq.question}
                  </h3>
                  <span
                    className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 transition-colors group-open:border-[#ffd166]/60 group-open:bg-[#ffd166]/15"
                    aria-hidden="true"
                  >
                    <span className="absolute h-px w-3.5 bg-[#ffd166]" />
                    <span className="absolute h-3.5 w-px bg-[#ffd166] transition-transform duration-300 ease-out group-open:rotate-90" />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#ffd166]/20 bg-gradient-to-br from-[#ffd166]/5 to-transparent p-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold tracking-tight">
              Ready to start watching?
            </p>
            <p className="mt-1 text-sm text-muted">
              Live TV, sport, movies and series in one subscription. Setup
              takes a few minutes and support is around the clock.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <FreeTrialButton
              size="lg"
              className="bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            >
              Start Your 24-Hour Free Trial
            </FreeTrialButton>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-[42px] border-[#ffd166]/40 text-[#ffd166] hover:border-[#ffd166] hover:bg-[#ffd166]/10"
              )}
            >
              See plans &amp; pricing
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
    </>
  );
}