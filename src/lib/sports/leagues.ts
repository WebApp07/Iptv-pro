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
  /**
   * Country names (normalized compare) the provider's league must carry for
   * the entry to resolve. Guards against same-name competitions from other
   * countries on region-restricted plans (e.g. Ghana's "Premier League").
   */
  requireCountry?: string[];
  /**
   * Substring candidates (normalized contains-check) for providers whose
   * names carry volatile suffixes - e.g. "Indian Premier League 2026".
   */
  nameIncludes?: string[];
  knownIds?: Record<string, string>;
}

export const LEAGUE_REGISTRY: LeagueRegistryEntry[] = [
  // Football (covered by api-sports today).
  {
    slug: "premier-league",
    label: "Premier League",
    sport: "football",
    nameMatch: ["premier league"],
    // Keeps region-restricted plans from linking same-name competitions
    // (e.g. Ghana's "Premier League").
    requireCountry: ["England"],
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
    requireCountry: ["Spain"],
    knownIds: { "api-sports": "140", allsports: "302" },
  },
  {
    slug: "serie-a",
    label: "Serie A",
    sport: "football",
    nameMatch: ["serie a"],
    requireCountry: ["Italy"],
    knownIds: { "api-sports": "135", allsports: "207" },
  },
  {
    slug: "bundesliga",
    label: "Bundesliga",
    sport: "football",
    nameMatch: ["bundesliga"],
    requireCountry: ["Germany"],
    knownIds: { "api-sports": "78", allsports: "175" },
  },
  {
    slug: "ligue-1",
    label: "Ligue 1",
    sport: "football",
    nameMatch: ["ligue 1"],
    requireCountry: ["France"],
    knownIds: { "api-sports": "61", allsports: "168" },
  },
  // Basketball - resolved by name match against whichever provider covers
  // the sport (TheRundown names the NBA "National Basketball Association").
  {
    slug: "nba",
    label: "NBA",
    sport: "basketball",
    nameMatch: ["nba", "national basketball association"],
  },
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
  // Tennis - grand slam tournaments appear in the tennis product's league
  // listing.
  {
    slug: "wimbledon",
    label: "Wimbledon",
    sport: "tennis",
    nameMatch: ["wimbledon"],
  },
  {
    slug: "us-open",
    label: "US Open",
    sport: "tennis",
    nameMatch: ["us open"],
  },
  {
    slug: "french-open",
    label: "French Open",
    sport: "tennis",
    nameMatch: ["french open", "roland garros"],
  },
  {
    slug: "australian-open",
    label: "Australian Open",
    sport: "tennis",
    nameMatch: ["australian open"],
  },
  // Cricket - series names carry season suffixes ("... 2026"), so these
  // resolve by substring match against the CricAPI series catalogue.
  {
    slug: "ipl",
    label: "Indian Premier League",
    sport: "cricket",
    nameMatch: ["indian premier league", "ipl"],
    nameIncludes: ["indian premier league"],
  },
  {
    slug: "big-bash",
    label: "Big Bash League",
    sport: "cricket",
    nameMatch: ["big bash league", "bbl"],
    nameIncludes: ["big bash"],
  },
  {
    slug: "psl",
    label: "Pakistan Super League",
    sport: "cricket",
    nameMatch: ["pakistan super league", "psl"],
    nameIncludes: ["pakistan super league"],
  },
  // Hockey.
  {
    slug: "nhl",
    label: "NHL",
    sport: "hockey",
    nameMatch: ["nhl", "national hockey league"],
  },
  {
    slug: "khl",
    label: "KHL",
    sport: "hockey",
    nameMatch: ["khl", "kontinental hockey league"],
  },
  // Baseball.
  {
    slug: "mlb",
    label: "MLB",
    sport: "baseball",
    nameMatch: ["mlb", "major league baseball"],
  },
  // American football.
  {
    slug: "nfl",
    label: "NFL",
    sport: "american-football",
    nameMatch: ["nfl", "national football league"],
  },
  {
    slug: "ncaa-football",
    label: "NCAA Football",
    sport: "american-football",
    nameMatch: ["ncaa"],
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
