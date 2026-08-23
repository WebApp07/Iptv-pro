/**
 * Cache windows for sports data, in seconds.
 *
 * Applied at the provider HTTP boundary via `fetch(url, { next: { revalidate }})`
 * so identical requests are served from the Data Cache until their window
 * expires, and deduplicated within a single render pass automatically.
 */

export const SPORTS_CACHE_TTL = {
  /** Scores and statuses change constantly - keep this window very short. */
  live: 30,
  /** Fixtures rarely change once published - safe to serve for a while. */
  upcoming: 300,
  /** League names/logos/countries are effectively static. */
  league: 86_400,
  /** A single event lookup sits between live and upcoming. */
  event: 120,
} as const;
