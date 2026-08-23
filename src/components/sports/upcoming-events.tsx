import { MatchCard, SportsNotice } from "@/components/sports/match-card";
import {
  getUpcomingEventsWithStatus,
  isSportsDataConfigured,
  type SportsResult,
} from "@/lib/sports";
import type { Match } from "@/lib/sports";

const NOT_CONFIGURED: SportsResult<Match[]> = {
  data: [],
  status: "not-configured",
};

export async function UpcomingEvents({
  limit = 12,
  date,
}: {
  limit?: number;
  date?: string;
}) {
  const result = isSportsDataConfigured()
    ? await getUpcomingEventsWithStatus({ limit, date })
    : NOT_CONFIGURED;

  return (
    <section aria-labelledby="upcoming-events-heading">
      <h2 id="upcoming-events-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Upcoming fixtures
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
          <SportsNotice
            title="No fixtures found"
            body={date ? `No matches were found for ${date}.` : "No upcoming matches are scheduled yet."}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
