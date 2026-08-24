import type { SportSlug } from "./types";

/**
 * Curated registry of popular competitions.
 *
 * The registry only CANDIDATES leagues - an entry is ever displayed or
 * linked when the configured provider actually resolves it, so unsupported
 * sports/leagues never render fake data or indexable empty pages.
 *
 * `knownIds` maps provider id -> verified league id, shortcutting the
 * name lookup for that provider. Entries without an id for the active
 * provider resolve by exact name match against its league listing instead
 * (or not at all, if the provider does not cover the sport).
 */
export interface LeagueRegistryEntry {
  /** URL slug under /sports/<sport>/ */
  slug: string;
  label: string;
  sport: SportSlug;
  /** Provider names that identify this competition (normalized compare). */
  nameMatch: string[];
  knownIds?: Record<string, string>;
}

export const LEAGUE_REGISTRY: LeagueRegistryEntry[] = [
  // Football (covered by api-sports today).
  {
    slug: "premier-league",
    label: "Premier League",
    sport: "football",
    nameMatch: ["premier league"],
    knownIds: { "api-sports": "39", allsports: "152" },
  },
  {
    slug: "champions-league",
    label: "Champions League",
    sport: "football",
    nameMatch: ["uefa champions league", "champions league"],
    knownIds: { "api-sports": "2", allsports: "3" },
  },
  {
    slug: "la-liga",
    label: "La Liga",
    sport: "football",
    nameMatch: ["la liga", "laliga", "primera"],
    knownIds: { "api-sports": "140", allsports: "302" },
  },
  {
    slug: "serie-a",
    label: "Serie A",
    sport: "football",
    nameMatch: ["serie a"],
    knownIds: { "api-sports": "135", allsports: "207" },
  },
  {
    slug: "bundesliga",
    label: "Bundesliga",
    sport: "football",
    nameMatch: ["bundesliga"],
    knownIds: { "api-sports": "78", allsports: "175" },
  },
  {
    slug: "ligue-1",
    label: "Ligue 1",
    sport: "football",
    nameMatch: ["ligue 1"],
    knownIds: { "api-sports": "61", allsports: "168" },
  },
  // Basketball - resolved automatically once a basketball product is
  // configured in the provider adapter; filtered out until then.
  { slug: "nba", label: "NBA", sport: "basketball", nameMatch: ["nba"] },
  {
    slug: "euroleague",
    label: "EuroLeague",
    sport: "basketball",
    nameMatch: ["euroleague"],
  },
  { slug: "wnba", label: "WNBA", sport: "basketball", nameMatch: ["wnba"] },
  { slug: "ncaa", label: "NCAA", sport: "basketball", nameMatch: ["ncaa"] },
  {
    slug: "acb",
    label: "ACB",
    sport: "basketball",
    nameMatch: ["acb", "liga endesa"],
  },
];

/** Lowercase, diacritic-free comparison key. */
export function normalizeLeagueName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findRegistryEntry(
  sport: SportSlug,
  leagueSlug: string
): LeagueRegistryEntry | null {
  return (
    LEAGUE_REGISTRY.find(
      (entry) => entry.sport === sport && entry.slug === leagueSlug.toLowerCase()
    ) ?? null
  );
}

export function matchesEntryName(
  entry: LeagueRegistryEntry,
  providerName: string
): boolean {
  const normalized = normalizeLeagueName(providerName);
  return entry.nameMatch.some(
    (candidate) => normalizeLeagueName(candidate) === normalized
  );
}
