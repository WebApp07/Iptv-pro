"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getChannelLogoUrl } from "@/lib/channels";

/**
 * Client island for the /channels/list directory. The server page renders
 * this component with the full grouped dataset once; search and country
 * filtering happen here with zero extra network requests.
 */

function ChannelRow({ name }: { name: string }) {
  const logoUrl = getChannelLogoUrl(name);
  return (
    <li>
      <Link
        href="/pricing"
        className="flex min-h-[44px] items-center gap-3 px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-[#ffd166]/[0.06] hover:text-[#ffd166]"
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={48}
            height={16}
            className="h-4 w-auto shrink-0 object-contain"
          />
        ) : null}
        <span className="min-w-0 truncate">{name}</span>
      </Link>
    </li>
  );
}

export function ChannelDirectory({
  groups,
  initialCountry = "all",
}: {
  groups: readonly {
    country: string;
    channels: readonly string[];
  }[];
  /** Pre-selected country filter (e.g. from /channels/list?country=UK). */
  initialCountry?: string;
}) {
  const validInitial = groups.some((group) => group.country === initialCountry)
    ? initialCountry
    : "all";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>(validInitial);

  // Data arrives pre-grouped; filtering is a pure local pass.
  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .filter((group) => country === "all" || group.country === country)
      .map((group) => ({
        ...group,
        channels: group.channels.filter(
          (channel) =>
            !needle ||
            channel.toLowerCase().includes(needle) ||
            group.country.toLowerCase().includes(needle)
        ),
      }))
      .filter((group) => group.channels.length > 0);
  }, [groups, query, country]);

  const totalVisible = visibleGroups.reduce(
    (sum, group) => sum + group.channels.length,
    0
  );

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-xl">
        <label htmlFor="channel-search" className="sr-only">
          Search channels or countries
        </label>
        <input
          id="channel-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search channels or countries..."
          autoComplete="off"
          className="min-h-[46px] w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-[#ffd166]/60 focus:outline-none"
        />
      </div>

      {/* Country filter pills */}
      <nav
        aria-label="Filter by country"
        className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {["all", ...groups.map((group) => group.country)].map((option) => {
            const isActive = country === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setCountry(option)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex min-h-[38px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#ffd166] bg-[#ffd166] text-black"
                    : "border-border text-muted hover:border-[#ffd166]/40 hover:text-foreground"
                )}
              >
                {option === "all" ? "All" : option}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Results */}
      {totalVisible === 0 ? (
        <p className="mt-10 rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted">
          No channels match your search. Try a different name or country.
        </p>
      ) : (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.15em] text-muted" role="status">
            {totalVisible} channel{totalVisible === 1 ? "" : "s"}
            {country !== "all" ? ` in ${country}` : ""}
          </p>
          <div className="mt-4 space-y-10">
            {visibleGroups.map((group) => (
              <section key={group.country} aria-labelledby={`country-${group.country}`}>
                <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                  <h2
                    id={`country-${group.country}`}
                    className="font-display text-xl font-bold uppercase tracking-wide text-foreground"
                  >
                    {group.country}
                  </h2>
                  <span className="text-xs font-medium text-muted">
                    {group.channels.length}
                  </span>
                </div>
                <ul className="mt-2 divide-y divide-border/60 overflow-hidden rounded-lg">
                  {group.channels.map((channel) => (
                    <ChannelRow key={channel} name={channel} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
