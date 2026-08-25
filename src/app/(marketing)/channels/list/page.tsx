import type { Metadata } from "next";
import Link from "next/link";
import { ALL_COUNTRY_GROUPS } from "@/lib/channels";
import { ChannelDirectory } from "@/components/channels/channel-directory";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "IPTV Channel List | Countries & Live TV Channels",
  description:
    "Browse our IPTV channel list by country and discover available live TV channels.",
};

/**
 * Full channel directory, grouped by country. Server Component: the grouped
 * dataset is assembled once here and handed to a small client island that
 * owns search/filter state - no per-country requests, no heavy client app.
 * ?country=<name> pre-selects a country filter.
 */
export default async function ChannelListPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const { country } = await searchParams;
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Channel{" "}
            <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
              List
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Browse our lineup country by country. Every channel below is part
            of one subscription.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/channels"
              className={cn(buttonVariants({ variant: "outline" }), "min-h-[42px]")}
            >
              Back to browse menu
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants(), "min-h-[42px] bg-[#ffd166] text-black hover:bg-[#f4c255]")}
            >
              View IPTV Plans
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <ChannelDirectory groups={ALL_COUNTRY_GROUPS} initialCountry={country ?? "all"} />
        </div>

        {/* Conversion */}
        <div className="mt-16 rounded-xl border border-[#ffd166]/30 bg-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to access our IPTV service?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            All channels listed above are included in every plan - pick the
            subscription length that suits you.
          </p>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants(),
              "mt-6 min-h-[46px] bg-[#ffd166] px-8 text-black hover:bg-[#f4c255]"
            )}
          >
            View IPTV Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
