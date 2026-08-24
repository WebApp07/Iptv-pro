import { NextResponse } from "next/server";
import {
  getEventByIdWithStatus,
  getEventsBySportWithStatus,
  getLiveEventsWithStatus,
  getPopularLeagues,
  getUpcomingEventsWithStatus,
  isSportsDataConfigured,
} from "@/lib/sports";

/**
 * Server-side sports provider diagnostics.
 *
 * Disabled unless SPORTS_DEBUG=1 is set in the environment - otherwise this
 * responds 404 so the capability probe is never exposed publicly.
 *
 * Returns only normalized capability statuses plus minimal sample fields;
 * never returns credentials or raw provider payloads.
 */
export const revalidate = 0;

export async function GET(): Promise<Response> {
  if (process.env.SPORTS_DEBUG !== "1") {
    return new Response(null, { status: 404 });
  }

  const configured = isSportsDataConfigured();

  const [live, upcoming] = await Promise.all([
    configured ? getLiveEventsWithStatus({ limit: 3 }) : null,
    configured ? getUpcomingEventsWithStatus({ limit: 3 }) : null,
  ]);

  const firstId = upcoming?.status === "ok" ? upcoming.data[0]?.id : undefined;
  const [byId, bySport, leagues] = await Promise.all([
    firstId ? getEventByIdWithStatus(firstId) : Promise.resolve(null),
    getEventsBySportWithStatus("football", { limit: 1 }),
    getPopularLeagues(),
  ]);

  const sample = upcoming?.status === "ok" ? upcoming.data[0] : undefined;

  return NextResponse.json({
    configured,
    checks: {
      liveEvents: {
        status: live?.status ?? "not-configured",
        count: live?.data.length ?? 0,
        sampleStatuses: [...new Set(live?.data.map((e) => e.status) ?? [])],
        hasScores: live?.data.some((e) => e.score != null) ?? false,
        hasLogos: live?.data.some((e) => e.homeTeam.logoUrl != null) ?? false,
      },
      upcomingEvents: {
        status: upcoming?.status ?? "not-configured",
        count: upcoming?.data.length ?? 0,
        sample: sample
          ? {
              id: sample.id,
              sport: sample.sportId,
              league: sample.leagueName,
              home: sample.homeTeam.name,
              away: sample.awayTeam.name,
              startTimeUtc: sample.startTime,
              venue: sample.venue?.name ?? null,
            }
          : null,
      },
      eventById: {
        status: byId?.status ?? "skipped",
        found: byId?.status === "ok" && byId.data != null,
      },
      eventsBySport: {
        status: bySport.status,
        count: bySport.data.length,
      },
      leagues: {
        status: leagues.status,
        resolved: leagues.data.map((r) => ({
          slug: r.entry.slug,
          sport: r.entry.sport,
          name: r.league.name,
        })),
      },
    },
  });
}
