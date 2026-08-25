import Link from "next/link";
import { MatchGridWithDetails, SportsNotice, formatKickoff, formatKickoffTime } from "@/components/sports/match-card";
import {
  getUpcomingEventsWithStatus,
  isSportsDataConfigured,
  isSportSupported,
  type SportsResult,
} from "@/lib/sports";
import type { Match, SportSlug } from "@/lib/sports";

const NOT_CONFIGURED: SportsResult<Match[]> = {
  data: [],
  status: "not-configured",
};

function DetailsCta({ match }: { match: Match }) {
  const rows: Array<[string, string]> = [];
  if (match.startTime) {
    rows.push(["Date", formatKickoff(match.startTime)]);
    rows.push(["Kick-off", `${formatKickoffTime(match.startTime)} UTC`]);
  }
  if (match.leagueName) rows.push(["League", match.leagueName]);
  if (match.round) rows.push(["Round", match.round]);
  if (match.venue?.name) {
    rows.push([
      "Venue",
      match.venue.city ? `${match.venue.name}, ${match.venue.city}` : match.venue.name,
    ]);
  }
  if (rows.length === 0) return null;

  return (
    <details className="group mt-3">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-[#ffd166] transition-colors hover:text-[#f4c255] [&::-webkit-details-marker]:hidden">
        Match details
        <span
          className="transition-transform duration-200 group-open:rotate-90"
          aria-hidden="true"
        >
          →
        </span>
      </summary>
      <dl className="mt-3 space-y-1.5 rounded-lg bg-secondary/30 p-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 text-xs">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-foreground/90">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export async function UpcomingEvents({
  limit = 12,
  date,
  sport,
  leagueId,
}: {
  limit?: number;
  date?: string;
  sport?: SportSlug;
  leagueId?: string;
}) {
  const supported =
    !sport || sport === "all" ? true : await isSportSupported(sport);
  const result = !isSportsDataConfigured()
    ? NOT_CONFIGURED
    : !supported
      ? ({ data: [], status: "ok" } as SportsResult<Match[]>)
      : await getUpcomingEventsWithStatus({
          limit,
          date,
          leagueId,
          ...(sport && sport !== "all" ? { sport } : {}),
        });

  const heading =
    date && result.status === "ok" && result.data.length > 0
      ? `Upcoming fixtures · ${date}`
      : "Upcoming fixtures";

  return (
    <section aria-labelledby="upcoming-events-heading">
      <h2 id="upcoming-events-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {heading}
      </h2>

      <div className="mt-6">
        {result.status === "not-configured" ? (
          <SportsNotice
            title="Fixtures coming soon"
            body="We're wiring up the match schedule for this section."
          />
        ) : result.status === "unavailable" ? (
          <SportsNotice
            title="Schedule unavailable"
            body="We couldn't reach the sports service just now. Please check back shortly."
          />
        ) : result.data.length === 0 ? (
          sport && sport !== "all" ? (
              <SportsNotice
                title={`${sport.charAt(0).toUpperCase()}${sport.slice(1)} coverage coming soon`}
                body="We don't have schedules for this sport yet. Check back soon."
              >
              <Link
                href="/sports"
                className="text-sm font-medium text-[#ffd166] transition-colors hover:text-[#f4c255]"
              >
                Back to all sports
              </Link>
            </SportsNotice>
          ) : (
            <SportsNotice
              title="No fixtures found"
              body={
                date
                  ? `No matches were found for ${date}.`
                  : "No upcoming matches are scheduled yet."
              }
            />
          )
        ) : (
          <MatchGridWithDetails
            matches={result.data}
            renderDetails={(match) => <DetailsCta match={match} />}
          />
        )}
      </div>
    </section>
  );
}
