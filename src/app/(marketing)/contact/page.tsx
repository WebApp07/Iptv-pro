import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig, siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact TV96",
  description:
    "Get help with billing, setup or anything else. Message TV96 on WhatsApp or email - support is available around the clock and replies usually arrive within minutes.",
  alternates: { canonical: siteUrl("/contact") },
};

const billingTopics = [
  {
    title: "Plans & pricing",
    description: "Compare 1 or 2 device plans, from 1 to 12 months.",
    href: "/pricing",
    label: "See plans",
  },
  {
    title: "Refund policy",
    description: "What to expect if you decide to cancel after paying.",
    href: "/refund",
    label: "Read the policy",
  },
  {
    title: "Free 24-hour trial",
    description: "Try the full service before you commit to a plan.",
    href: "/",
    label: "Start a trial",
  },
  {
    title: "Terms of service",
    description: "The agreement that covers every subscription.",
    href: "/terms",
    label: "Read the terms",
  },
];

const technicalTopics = [
  {
    title: "Device setup",
    description:
      "Message us on WhatsApp with your device model (Smart TV, Fire Stick, Android box...) and we'll walk you through it step by step.",
    href: siteConfig.whatsappUrl,
    label: "Get setup help",
  },
  {
    title: "Channel not working",
    description:
      "A channel stutters or won't play - tell us the channel and device and we'll look into it.",
    href: siteConfig.whatsappUrl,
    label: "Report a problem",
  },
  {
    title: "Sports & movies",
    description: "Schedules, scores and how titles are added to the library.",
    href: "/sports",
    label: "Sports hub",
  },
];

const faqs = [
  {
    question: "How fast will I get a reply?",
    answer:
      "Support is available around the clock. Most messages get a reply within minutes, depending on how many conversations we have open at the time.",
  },
  {
    question: "How do I contact TV96?",
    answer:
      "Message us on WhatsApp or send an email to support@tv96.uk. Both are monitored around the clock.",
  },
  {
    question: "None of my channels are loading - what should I do?",
    answer:
      "First, check your internet connection (15-25 Mbps is usually enough for HD). Restart the app or player, then try again. If channels still don't load, message us on WhatsApp with the channel and device and we'll check for you.",
  },
  {
    question: "Can I change or cancel my plan?",
    answer:
      "Yes. Plans run from one month to twelve months with no contracts, so you can stop whenever you like. For billing or cancellation questions, see the refund policy or message us on WhatsApp.",
  },
  {
    question: "Do I need help setting up on my TV?",
    answer:
      "Not necessarily - most setups only take a few minutes and your login details arrive on WhatsApp and by email. If you get stuck on any device, message us and we'll walk you through it.",
  },
  {
    question: "Can I try the service before paying?",
    answer:
      "Yes. Every new viewer can take a free 24-hour trial to check the channel lineup and picture quality before committing to a plan.",
  },
];

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

function breadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Contact", item: siteUrl("/contact") },
    ],
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

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <SectionHeading>Contact & support</SectionHeading>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              We&apos;re here to{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                help
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Whether it&apos;s a billing question, a device that won&apos;t
              connect or a channel that&apos;s stuttering, get in touch on
              WhatsApp or email. Support is available around the clock and
              most messages get a reply within minutes.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="space-y-6">
            <div>
              <SectionHeading>Send a message</SectionHeading>
              <SectionTitle>Contact form</SectionTitle>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Tell us what you need and the form will open WhatsApp with
                your message ready to send. Prefer email? Write to{" "}
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
                >
                  {siteConfig.supportEmail}
                </a>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <SectionHeading>Get in touch</SectionHeading>
              <SectionTitle>Direct channels</SectionTitle>
            </div>

            <Card className="border-border bg-card transition-colors hover:border-[#ffd166]/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21Z" />
                      <path d="M9 8.5c.4 2.5 3.7 5.7 6.2 6.1l1.6-1.3-1.1-2-1.7.7c-.9-.7-1.9-1.7-2.5-2.5l.7-1.9-1.9-1.4L9 8.5Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      WhatsApp
                    </h3>
                    <p className="text-sm text-muted">
                      Fastest way to reach us - around the clock
                    </p>
                  </div>
                </div>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-5 w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
                  )}
                >
                  Message us on WhatsApp
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-colors hover:border-[#ffd166]/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 6L2 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      Email
                    </h3>
                    <p className="text-sm text-muted">
                      {siteConfig.supportEmail}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-5 w-full min-h-[42px]"
                  )}
                >
                  Send an email
                </a>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Support hours
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Availability</dt>
                  <dd className="font-semibold text-foreground/90">
                    Around the clock, 7 days a week
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Typical reply time</dt>
                  <dd className="font-semibold text-foreground/90">
                    Within minutes
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading>Common support topics</SectionHeading>
          <SectionTitle>Find the answer faster</SectionTitle>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Billing &amp; subscription
              </h3>
              <div className="mt-4 space-y-3">
                {billingTopics.map((topic) => (
                  <div
                    key={topic.title}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {topic.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {topic.description}
                      </p>
                    </div>
                    <Link
                      href={topic.href}
                      className="shrink-0 text-sm font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
                    >
                      {topic.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight">
                Technical &amp; setup
              </h3>
              <div className="mt-4 space-y-3">
                {technicalTopics.map((topic) => (
                  <div
                    key={topic.title}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">
                        {topic.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {topic.description}
                      </p>
                    </div>
                    {topic.href.startsWith("http") ? (
                      <a
                        href={topic.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
                      >
                        {topic.label}
                      </a>
                    ) : (
                      <Link
                        href={topic.href}
                        className="shrink-0 text-sm font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
                      >
                        {topic.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section aria-labelledby="faq-section-heading" className="mt-16">
          <SectionHeading>FAQ</SectionHeading>
          <SectionTitle>Questions people ask</SectionTitle>
          <div className="mt-8 max-w-3xl space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card/60 transition-colors open:border-[#ffd166]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
                  <h3
                    id={`contact-faq-${index}`}
                    className="text-sm font-semibold sm:text-base"
                  >
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
              Need to pick a plan or start a trial?
            </p>
            <p className="mt-1 text-sm text-muted">
              Every plan includes the full channel lineup, and new viewers
              get a free 24-hour trial before paying anything.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              )}
            >
              See plans &amp; pricing
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-[42px] border-[#ffd166]/40 text-[#ffd166] hover:border-[#ffd166] hover:bg-[#ffd166]/10"
              )}
            >
              Start your free trial
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
    </>
  );
}