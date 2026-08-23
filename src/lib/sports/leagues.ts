import type { SportSlug } from "./types";

/**
 * Curated registry of popular competitions.
 *
 * The registry only CANDIDATES leagues - an entry is ever displayed or
 * linked when the configured provider actually resolves it, so unsupported
 * sports/leagues never render fake data or indexable empty pages.
 *
 * `knownIds` are verified API-Sports football league ids that shortcut the
 * name lookup. Entries without one resolve by exact name match against the
 * provider's league listing for that sport.
 */
export interface LeagueRegistryEntry {
  /** URL slug under /sports/<sport>/ */
  slug: string;
  label: string;
  sport: SportSlug;
  /** Provider names that identify this competition (normalized compare). */
  nameMatch: string[];
  knownId?: string;
}

export const LEAGUE_REGISTRY: LeagueRegistryEntry[] = [
  // Football (API-Sports product currently wired in the adapter).
  { slug: "premier-league", label: "Premier League", sport: "football", nameMatch: ["premier league"], knownId: "39" },
  { slug: "champions-league", label: "Champions League", sport: "football", nameMatch: ["uefa champions league", "champions league"], knownId: "2" },
  { slug: "la-liga", label: "La Liga", sport: "football", nameMatch: ["la liga", "laliga"], knownId: "140" },
  { slug: "serie-a", label: "Serie A", sport: "football", nameMatch: ["serie a"], knownId: "135" },
  { slug: "bundesliga", label: "Bundesliga", sport: "football", nameMatch: ["bundesliga"], knownId: "78" },
  { slug: "ligue-1", label: "Ligue 1", sport: "football", nameMatch: ["ligue 1"], knownId: "61" },
  // Basketball - resolved automatically once a basketball product is
  // configured in the provider adapter; filtered out until then.
  { slug: "nba", label: "NBA", sport: "basketball", nameMatch: ["nba"] },
  { slug: "euroleague", label: "EuroLeague", sport: "basketball", nameMatch: ["euroleague"] },
  { slug: "wnba", label: "WNBA", sport: "basketball", nameMatch: ["wnba"] },
  { slug: "ncaa", label: "NCAA", sport: "basketball", nameMatch: ["ncaa"] },
  { slug: "acb", label: "ACB", sport: "basketball", nameMatch: ["acb", "liga endesa"] },
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
