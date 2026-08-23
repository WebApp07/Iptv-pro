import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  LocalDateTime,
} from "@/components/sports/local-date-time";
import { SportsNotice } from "@/components/sports/match-card";
import { ConversionSection } from "@/components/sports/conversion-section";
import { LeaguePageContent } from "@/components/sports/league-page";
import {
  resolveSportCategory,
} from "@/components/sports/sport-categories";
import {
  deriveTeamForm,
  extractEventId,
  makeMatchSlug,
} from "@/lib/sports/slug";
import {
  getEventByIdWithStatus,
  getEventStatisticsWithStatus,
  getHeadToHeadWithStatus,
  getLeagueRoute,
  getTeamRecentEventsWithStatus,
  isSportsDataConfigured,
} from "@/lib/sports";
import type { Match } from "@/lib/sports";
import { breadcrumbJsonLd } from "@/lib/sports/schema";
import { cn, formatDate } from "@/lib/utils";
import { siteConfig, siteUrl } from "@/config/site";

/**
 * Level-3 routes under /sports/<sport>/ serve two content types:
 *
 * 1. League schedule pages (/sports/football/premier-league) - resolved
 *    against the curated registry + live provider metadata. A league page is
 *    only indexable when the provider actually covers it.
 * 2. Match detail pages (/sports/<sport>/<home>-vs-<away>-<id>) - the
 *    provider fixture id embedded in the slug resolves to exactly one real
 *    event; nothing is invented when the provider is silent.
 */
export const revalidate = 60;

type MatchPageProps = {
  params: Promise<{ sport: string; "match-slug": string }>;
};

async function loadMatch(rawSport: string, matchSlug: string) {
  const category = resolveSportCategory(rawSport);
  if (!category || category.slug === "all") return null;

  // Registry league slugs take precedence at this level.
  const leagueRoute = await getLeagueRoute(category.slug, matchSlug);
  if (leagueRoute) return { type: "league" as const, category, leagueRoute };

  if (!isSportsDataConfigured()) return null;

  const eventId = extractEventId(matchSlug);
  if (!eventId) return null;

  // React cache() dedupes this lookup with generateMetadata's.
  const result = await getEventByIdWithStatus(eventId);
  if (result.status !== "ok" || !result.data) return null;

  const match = result.data;
  // A real event must belong to the sport segment it is served under.
  if (match.sportId !== category.slug) return null;

  return { type: "match" as const, category, match };
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { sport, "match-slug": matchSlug } = await params;
  const loaded = await loadMatch(sport, matchSlug);
  if (!loaded) notFound();

  if (loaded.type === "league") {
    const { category, leagueRoute } = loaded;
    const { entry, league } = leagueRoute;
    const url = siteUrl(`/sports/${category.slug}/${entry.slug}`);
    // Indexable only when the provider actually covers this league.
    const indexable = league !== null;
    return {
      title: indexable
        ? `${league!.name} Schedule & Scores`
        : `${entry.label} Schedule`,
      description: indexable
        ? `Live ${league!.name.toLowerCase()} scores, upcoming fixtures and results. Follow every match.`
        : `${entry.label} coverage is coming soon.`,
      robots: indexable ? undefined : { index: false, follow: true },
      alternates: { canonical: url },
      openGraph: {
        title: `${indexable ? league!.name : entry.label} Schedule & Scores | ${siteConfig.name}`,
        description:
          indexable
            ? `Live ${league!.name.toLowerCase()} scores, upcoming fixtures and results.`
            : `${entry.label} coverage is coming soon.`,
        url,
      },
    };
  }

  const { match, category } = loaded;
  const title = `${match.homeTeam.name} vs ${match.awayTeam.name} — Live Score & Schedule`;
  const description = `${match.leagueName ?? category.label}${
    match.startTime ? ` · ${formatDate(match.startTime)}` : ""
  }. See kick-off time, venue${match.status === "finished" ? ", final score" : ""}, stats and head-to-head record.`;
  // Canonical always uses the slug computed from live team names, so any
  // stale inbound link consolidates onto one URL.
  const url = siteUrl(`/sports/${category.slug}/${makeMatchSlug(match)}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: siteConfig.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function ScoreboardHeader({ match }: { match: Match }) {
  const showScore =
    match.status !== "scheduled" &&
    match.score &&
    (match.score.home != null || match.score.away != null);

  // Shared pieces --------------------------------------------------------

  const statusBadge =
    match.status === "live" ? (
      <Badge
        variant="outline"
        className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[#ffd166]"
      >
        Live
        {match.score?.minute != null ? ` · ${match.score.minute}′` : ""}
        {match.score?.period ? ` (${match.score.period})` : ""}
      </Badge>
    ) : (
      <span className="text-xs font-medium capitalize text-muted">
        {match.status}
      </span>
    );

  const crest = (team: Match["homeTeam"], sizeClass: string) =>
    team.logoUrl ? (
      <Image
        src={team.logoUrl}
        alt=""
        width={56}
        height={56}
        className={cn("shrink-0 object-contain", sizeClass)}
      />
    ) : (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-secondary/60 font-display text-xs font-bold text-muted",
          sizeClass
        )}
        aria-hidden="true"
      >
        {team.name.slice(0, 3).toUpperCase()}
      </span>
    );

  // Mobile (<sm): stacked team rows, centered score below. ----------------

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-8">
      <div className="flex items-center justify-between gap-2 sm:hidden">
        {match.leagueName ? (
          <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {match.leagueName}
          </span>
        ) : (
          <span />
        )}
        {statusBadge}
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {([match.homeTeam, match.awayTeam] as const).map((team) => {
          const teamScore =
            showScore && team.id === match.homeTeam.id
              ? match.score?.home
              : showScore && team.id === match.awayTeam.id
                ? match.score?.away
                : null;
          return (
            <div key={team.id} className="flex items-center gap-3">
              {crest(team, "h-9 w-9")}
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                <span className="mr-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                  {team.id === match.homeTeam.id ? "Home" : "Away"}
                </span>
                {team.name}
              </span>
              {showScore ? (
                <span className="font-display text-lg font-bold tabular-nums">
                  {teamScore ?? "–"}
                </span>
              ) : null}
            </div>
          );
        })}
        {!showScore && match.startTime ? (
          <p className="text-center font-display text-lg font-bold tabular-nums">
            <LocalDateTime iso={match.startTime} mode="time" />
          </p>
        ) : null}
      </div>

      {/* Tablet/desktop: home | center | away. -------------------------------- */}

      <div className="hidden sm:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {match.leagueName ? (
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              {match.leagueName}
              {match.round ? ` · ${match.round}` : ""}
            </span>
          ) : (
            <span />
          )}
          {statusBadge}
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-8">
          {[match.homeTeam, match.awayTeam].map((team, index) => (
            <div
              key={team.id}
              className={cn(
                "flex min-w-0 items-center gap-3",
                index === 1 && "flex-row-reverse text-right"
              )}
            >
              {crest(team, "h-14 w-14")}
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-bold">
                  {team.name}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  {index === 0 ? "Home" : "Away"}
                </p>
              </div>
            </div>
          ))}

          <div className="text-center">
            {showScore ? (
              <p className="font-display text-5xl font-bold tabular-nums">
                {match.score?.home ?? 0}
                <span className="mx-1 text-muted">–</span>
                {match.score?.away ?? 0}
              </p>
            ) : (
              <>
                <p className="font-display text-2xl font-bold tabular-nums">
                  <LocalDateTime iso={match.startTime} mode="time" />
                </p>
                <p className="mt-1 text-xs text-muted">Kick-off</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Shared meta line: kickoff (localized), venue. */}
      <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted sm:mt-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-4 sm:space-y-0">
        {match.startTime ? (
          <span className="block sm:hidden">
            <LocalDateTime iso={match.startTime} mode="datetime" />
          </span>
        ) : null}
        {match.startTime ? (
          <span className="hidden sm:inline">
            <LocalDateTime iso={match.startTime} mode="datetime" />
          </span>
        ) : null}
        {match.venue?.name ? (
          <span className="block">
            {match.venue.name}
            {match.venue.city ? `, ${match.venue.city}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: string; away: string }) {
  return (
    <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 py-2 sm:grid-cols-[4rem_1fr_4rem]">
      <span className="text-right text-sm font-semibold tabular-nums">{home}</span>
      <span className="truncate text-center text-xs text-muted">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{away}</span>
    </div>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { sport, "match-slug": matchSlug } = await params;
  const loaded = await loadMatch(sport, matchSlug);
  if (!loaded) notFound();

  // League schedule pages render their own view.
  if (loaded.type === "league") {
    return (
      <LeaguePageContent
        category={{ slug: loaded.category.slug, label: loaded.category.label }}
        resolved={loaded.leagueRoute}
      />
    );
  }

  const { category, match } = loaded;
  // All supplementary lookups fire in one parallel batch - no waterfall
  // between stats, H2H and the two form lookups.
  const [statsResult, h2hResult, homeRecent, awayRecent] = await Promise.all([
    getEventStatisticsWithStatus(match.id),
    getHeadToHeadWithStatus(match.homeTeam.id, match.awayTeam.id, 5),
    getTeamRecentEventsWithStatus(match.homeTeam.id, 5),
    getTeamRecentEventsWithStatus(match.awayTeam.id, 5),
  ]);
  const hasStats =
    statsResult.status === "ok" &&
    statsResult.data != null &&
    statsResult.data.teams.length >= 2 &&
    statsResult.data.teams.some((t) => t.entries.length > 0);

  const hasH2H = h2hResult.status === "ok" && h2hResult.data.length > 0;

  // Recent form per team - only rendered for teams with finished matches.
  const forms = [
    homeRecent.status === "ok"
      ? deriveTeamForm(match.homeTeam.id, homeRecent.data)
      : null,
    awayRecent.status === "ok"
      ? deriveTeamForm(match.awayTeam.id, awayRecent.data)
      : null,
  ];

  const anchorSections: Array<[string, string]> = [];
  if (hasStats) anchorSections.push(["#team-stats", "Team Stats"]);
  if (hasH2H) anchorSections.push(["#h2h", "H2H"]);
  if (forms.some(Boolean)) anchorSections.push(["#form", "Form"]);

  const jsonLd = breadcrumbJsonLd([
    { name: "Home", url: siteUrl("/") },
    { name: "Sports", url: siteUrl("/sports") },
    { name: category.label, url: siteUrl(`/sports/${category.slug}`) },
    {
      name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      url: siteUrl(`/sports/${category.slug}/${makeMatchSlug(match)}`),
    },
  ]);

  const eventJsonLd =
    match.startTime && match.homeTeam.name && match.awayTeam.name
      ? {
          "@context": "https://schema.org",
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
          url: siteUrl(`/sports/${category.slug}/${makeMatchSlug(match)}`),
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
        }
      : null;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96">
          <div className="absolute -top-24 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <Link href="/sports" className="transition-colors hover:text-foreground">
              Sports
            </Link>
            <span aria-hidden="true">›</span>
            <Link
              href={`/sports/${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.label}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="truncate text-foreground/80">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </span>
          </nav>

          <div className="mt-8">
            <ScoreboardHeader match={match} />
          </div>

          {anchorSections.length > 0 ? (
            <nav
              aria-label="Match sections"
              className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            >
              {anchorSections.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex min-h-[38px] shrink-0 items-center whitespace-nowrap rounded-full border border-border px-4 text-sm font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {hasStats && statsResult.data ? (
          <div id="team-stats" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold tracking-tight">Team stats</h2>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              {(() => {
                const teams = statsResult.data!.teams;
                const entryCount = Math.max(
                  ...teams.map((t) => t.entries.length)
                );
                return Array.from({ length: entryCount }, (_, i) => {
                  const label = teams[0]?.entries[i]?.name ?? teams[1]?.entries[i]?.name;
                  if (!label) return null;
                  const values = teams.map((t) => t.entries[i]?.value ?? "–");
                  return (
                    <StatRow
                      key={label + i}
                      label={label}
                      home={values[0]}
                      away={values[values.length - 1]}
                    />
                  );
                });
              })()}
              <p className="mt-4 border-t border-border pt-3 text-center text-xs uppercase tracking-[0.14em] text-muted">
                {match.homeTeam.name} · {match.awayTeam.name}
              </p>
            </div>
          </div>
        ) : null}

        {hasH2H ? (
          <div id="h2h" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Head to head
            </h2>
            <p className="mt-2 text-sm text-muted">
              Previous meetings between these teams (most recent first).
            </p>
            <ul className="mt-6 space-y-3">
              {h2hResult.data.map((event) => (
                <li
                  key={event.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <time
                    dateTime={event.startTime}
                    className="whitespace-nowrap text-xs text-muted"
                  >
                    {formatDate(event.startTime)}
                  </time>
                  <span className="truncate text-sm font-medium">
                    {event.homeTeam.name} <span className="text-muted">vs</span>{" "}
                    {event.awayTeam.name}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {event.score?.home ?? "-"}:{event.score?.away ?? "-"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {forms.some(Boolean) ? (
          <div id="form" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Recent form
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[match.homeTeam, match.awayTeam].map((team, index) => {
                const form = forms[index];
                return (
                  <div
                    key={team.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <p className="truncate text-sm font-semibold">{team.name}</p>
                    {form ? (
                      <div className="mt-3 flex gap-1.5">
                        {form.results.map((result, i) => (
                          <span
                            key={`${team.id}-${i}`}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                              result === "W" && "bg-[#ffd166] text-black",
                              result === "D" && "border border-border text-muted",
                              result === "L" && "border border-border text-muted/60"
                            )}
                            title={result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-muted">No recent results.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!hasStats && !hasH2H && !forms.some(Boolean) ? (
          <SportsNotice
            title="Details coming soon"
            body="Extended statistics and head-to-head history for this match will appear here once available."
          />
        ) : null}

        <div id="where-to-watch" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Where to watch
          </h2>
          <div className="mt-6 rounded-2xl border border-[#ffd166]/20 bg-gradient-to-br from-[#ffd166]/5 to-transparent p-6 sm:p-8">
            <p className="font-display text-lg font-bold">Our IPTV Service</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Follow your favorite teams and discover where to watch the
              action. With our IPTV service, enjoy access to a wide selection
              of live TV channels and sports content in one place.
            </p>
            <p className="mt-3 text-xs text-muted">
              Availability of specific competitions depends on your region and
              chosen package.
            </p>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              )}
            >
              View Plans
            </Link>
          </div>
        </div>

        <ConversionSection />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {eventJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      ) : null}
    </>
  );
}
