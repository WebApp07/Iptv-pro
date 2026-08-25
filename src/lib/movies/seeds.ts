/**
 * Curated IMDb id seeds for the discovery shelves (/movies, /series,
 * homepage sections). OMDb has no "trending" endpoint, so the service
 * fetches these ids' real records - the SELECTION is editorial, every
 * displayed field comes from the provider.
 */

/** Critically acclaimed films. */
export const TOP_RATED_MOVIE_IDS = [
  "tt0111161", // The Shawshank Redemption
  "tt0068646", // The Godfather
  "tt0468569", // The Dark Knight
  "tt0110912", // Pulp Fiction
  "tt1375666", // Inception
  "tt0816692", // Interstellar
  "tt0167260", // The Lord of the Rings: The Return of the King
  "tt0120737", // The Lord of the Rings: The Fellowship of the Ring
  "tt0109830", // Forrest Gump
  "tt0137523", // Fight Club
] as const;

/** Recent wide-appeal releases. */
export const TRENDING_MOVIE_IDS = [
  "tt15398776", // Oppenheimer
  "tt1517268", // Barbie
  "tt1745960", // Top Gun: Maverick
  "tt1630029", // Avatar: The Way of Water
  "tt6710474", // Everything Everywhere All at Once
  "tt9362722", // Spider-Man: Across the Spider-Verse
  "tt4154796", // Avengers: Endgame
  "tt9114286", // Black Panther: Wakanda Forever
] as const;

/** Additional crowd-pleasers for the /movies library grid. */
export const POPULAR_MOVIE_IDS = [
  "tt0325980", // Pirates of the Caribbean: The Curse of the Black Pearl
  "tt2380307", // Coco
  "tt0382932", // Ratatouille
  "tt0435761", // Toy Story 3
  "tt0317705", // The Incredibles
  "tt0910970", // WALL·E
  "tt0198781", // Monsters, Inc.
  "tt0088763", // Back to the Future
  "tt0102926", // The Silence of the Lambs
  "tt0114814", // The Usual Suspects
] as const;

/** Acclaimed series. */
export const POPULAR_SERIES_IDS = [
  "tt0903747", // Breaking Bad
  "tt0944947", // Game of Thrones
  "tt4574334", // Stranger Things
  "tt7366338", // Chernobyl
  "tt2861424", // Rick and Morty
  "tt1475582", // Sherlock
  "tt11126994", // Arcane
  "tt10919420", // Squid Game
  "tt2442560", // Peaky Blinders
  "tt0386676", // The Office
] as const;

/** Extra series for the /series library grid. */
export const MORE_SERIES_IDS = [
  "tt1520211", // The Walking Dead
  "tt0411008", // Lost
  "tt0417299", // Avatar: The Last Airbender
  "tt2306299", // Vikings
  "tt0795176", // Planet Earth
  "tt6468322", // Money Heist
  "tt5491994", // Planet Earth II
  "tt2707408", // Narcos
] as const;
