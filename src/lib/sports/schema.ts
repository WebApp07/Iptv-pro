import type { Match } from "./types";

export interface JsonLdBreadcrumbItem {
  name: string;
  url: string;
}

/** BreadcrumbList built from an ordered trail (Home first). */
export function breadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * SportsEvent ItemList built strictly from real provider fixtures.
 * Returns null when there is nothing to describe - never fabricates events.
 */
export function sportsEventsJsonLd(events: Match[]): object | null {
  const scheduled = events.filter((event) => event.startTime);
  if (scheduled.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: scheduled.map((match, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsEvent",
        name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        startDate: match.startTime,
        eventStatus:
          match.status === "postponed"
            ? "https://schema.org/EventPostponed"
            : match.status === "canceled"
              ? "https://schema.org/EventCancelled"
              : "https://schema.org/EventScheduled",
        sport: match.sportId,
        ...(match.venue?.name
          ? {
              location: {
                "@type": "Place",
                name: match.venue.name,
                address: match.venue.city,
              },
            }
          : {}),
        competitor: [
          { "@type": "SportsTeam", name: match.homeTeam.name },
          { "@type": "SportsTeam", name: match.awayTeam.name },
        ],
      },
    })),
  };
}
