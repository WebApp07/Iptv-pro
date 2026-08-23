import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MatchGrid } from "@/components/sports/match-card";
import {
  getLiveEventsWithStatus,
  getUpcomingEventsWithStatus,
  isSportsDataConfigured,
} from "@/lib/sports";
import { cn } from "@/lib/utils";

const MAX_EVENTS = 6;

/**
 * Compact homepage strip: a handful of live or soonest kick-offs.
 *
 * Renders nothing unless the sports provider is configured AND returns
 * events - the homepage must never show placeholder fixtures. Data comes
 * from the shared cached data layer (live window 30s).
 */
export async function LiveSportsToday() {
  if (!isSportsDataConfigured()) return null;

  let events: Awaited<ReturnType<typeof getLiveEventsWithStatus>>["data"] = [];
  try {
    const [live, upcoming] = await Promise.all([
      getLiveEventsWithStatus({ limit: 3 }),
      getUpcomingEventsWithStatus({ limit: MAX_EVENTS }),
    ]);
    // Provider outage on both -> omit silently; single outage still shows
    // whatever succeeded.
    if (live.status === "unavailable" && upcoming.status === "unavailable") {
      return null;
    }
    events = [
      ...(live.status === "ok" ? live.data : []),
      ...(upcoming.status === "ok" ? upcoming.data : []),
    ].slice(0, MAX_EVENTS);
  } catch {
    return null;
  }

  if (events.length === 0) return null;

  return (
    <section aria-labelledby="live-sports-today-heading" className="relative pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              Live scores
            </Badge>
            <h2
              id="live-sports-today-heading"
              className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Live Sports Today
            </h2>
          </div>
          <Link
            href="/sports"
            className="group shrink-0 text-sm font-medium text-[#ffd166] transition-colors hover:text-[#f4c255]"
          >
            View All Sports
            <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="mt-10">
          <MatchGrid matches={events} />
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to Watch More?
          </h3>
          <p className="mt-3 leading-relaxed text-muted">
            Explore our IPTV plans and enjoy live TV entertainment across your
            favorite devices.
          </p>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-7 bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            )}
          >
            View IPTV Plans
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
