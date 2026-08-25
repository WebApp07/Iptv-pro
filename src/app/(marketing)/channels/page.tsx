import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  ARABIC_COUNTRY_CHANNELS,
  CHANNEL_TYPES,
  COUNTRY_CHANNELS,
} from "@/lib/channels";

export const metadata: Metadata = {
  title: "Channels",
  description:
    "Browse 20,000+ live channels from around the world - countries, sports, movies, kids and Arabic channels in one subscription.",
};

/**
 * Channel browse menu (Server Component): three column groups over the dark
 * theme. Country groups expand in place via the isolated client accordion;
 * channels themselves deep-link into the pricing flow - the existing
 * navigation behavior for channel browsing on this site.
 */

function Plus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/**
 * Static menu tile - deliberately NOT a link: tapping a country or type
 * never navigates anywhere. The full lineup lives at /channels/list.
 */
function ChannelTile({ label }: { label: string }) {
  return (
    <div className="flex min-h-[42px] select-none items-center gap-2 rounded-md bg-[#ffd166] px-4 py-2 text-sm font-semibold text-black">
      <Plus className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function ChannelGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
        {title}
      </h2>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  );
}

// Countries without channel data stay hidden entirely.
const countries = COUNTRY_CHANNELS.filter((group) => group.channels.length > 0);
const arabicCountries = ARABIC_COUNTRY_CHANNELS.filter(
  (group) => group.channels.length > 0
);

export default function ChannelsPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Browse{" "}
            <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
              Channels
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.name} streams 20,000+ live channels worldwide. Pick a
            country to see its lineup, or jump straight to a category.
          </p>
          <Link
            href="/channels/list"
            className="mt-6 inline-flex min-h-[42px] items-center rounded-md border border-[#ffd166]/40 px-5 text-sm font-semibold text-[#ffd166] transition-colors hover:border-[#ffd166] hover:bg-[#ffd166]/10"
          >
            View the full channel list
          </Link>
        </div>

        <div className="mt-10 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ChannelGroup title="Countries">
            {countries.map((group) => (
              <ChannelTile key={group.country} label={group.country} />
            ))}
          </ChannelGroup>

          <ChannelGroup title="Channels Type">
            {CHANNEL_TYPES.map((type) => (
              <ChannelTile key={type} label={type} />
            ))}
          </ChannelGroup>

          <ChannelGroup title="Arabic Channels">
            {arabicCountries.map((group) => (
              <ChannelTile key={group.country} label={group.country} />
            ))}
          </ChannelGroup>
        </div>
      </div>
    </section>
  );
}
