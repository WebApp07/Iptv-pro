import type { Match, TeamForm } from "./types";

/**
 * Match URL slugs embed the provider's fixture id so a slug always resolves
 * to exactly one real event:
 *   {home}-vs-{away}-{id}   e.g. liverpool-vs-arsenal-1035046
 */

export function slugifyTeamName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "team";
}

export function makeMatchSlug(match: Pick<Match, "homeTeam" | "awayTeam" | "id">): string {
  return `${slugifyTeamName(match.homeTeam.name)}-vs-${slugifyTeamName(
    match.awayTeam.name
  )}-${match.id}`;
}

/** Extracts the trailing numeric provider id from a match slug. */
export function extractEventId(matchSlug: string): string | null {
  const match = /(\d+)$/.exec(matchSlug.trim());
  return match ? match[1] : null;
}

/**
 * Derives recent form (W/D/L, oldest first) for one team from that team's
 * recent finished matches. Only finished matches with scores are counted -
 * anything else is ignored rather than guessed.
 */
export function deriveTeamForm(
  teamId: string,
  recentEvents: Match[]
): TeamForm | null {
  const results: TeamForm["results"] = [];

  for (const event of recentEvents) {
    if (event.status !== "finished") continue;
    const score = event.score;
    if (!score || score.home == null || score.away == null) continue;

    if (event.homeTeam.id === teamId) {
      results.push(
        score.home > score.away ? "W" : score.home === score.away ? "D" : "L"
      );
    } else if (event.awayTeam.id === teamId) {
      results.push(
        score.away > score.home ? "W" : score.away === score.home ? "D" : "L"
      );
    }
  }

  if (results.length === 0) return null;
  // Provider returns newest first; present oldest -> newest.
  return { teamId, results: results.reverse() };
}
