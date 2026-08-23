import { MatchCard, SportsNotice } from "@/components/sports/match-card";
import {
  getLiveEventsWithStatus,
  isSportsDataConfigured,
  type SportsResult,
} from "@/lib/sports";
import type { Match } from "@/lib/sports";

const NOT_CONFIGURED: SportsResult<Match[]> = {
  data: [],
  status: "not-configured",
};

export async function LiveEvents({ limit = 10 }: { limit?: number }) {
  // Server component: fetches at the server boundary. The underlying query
  // is cached and deduplicated, so multiple mounts share one lookup.
  const result = isSportsDataConfigured()
    ? await getLiveEventsWithStatus({ limit })
    : NOT_CONFIGURED;

  return (
    <section aria-labelledby="live-events-heading">
      <div className="flex items-center gap-3">
        <h2 id="live-events-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Live now
        </h2>
        {result.status === "ok" && result.data.length > 0 ? (
          <span className="rounded-full border border-[#ffd166]/40 bg-[#ffd166]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ffd166]">
            {result.data.length}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        {result.status === "not-configured" ? (
          <SportsNotice
            title="Sports listings coming soon"
            body="We're wiring up live schedules and scores for this section."
          />
        ) : result.status === "unavailable" ? (
          <SportsNotice
            title="Live data unavailable"
            body="We couldn't reach the sports service just now. It usually recovers within minutes - please check back shortly."
          />
        ) : result.data.length === 0 ? (
          <SportsNotice
            title="No live matches right now"
            body="Nothing is being played at this moment. Upcoming fixtures are listed below."
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
