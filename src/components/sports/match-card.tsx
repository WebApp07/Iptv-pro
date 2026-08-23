import Image from "next/image";
import type { Match } from "@/lib/sports";

function formatKickoff(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // Rendered deterministically in UTC so every visitor sees the same time;
  // swap for locale-aware formatting once a timezone preference exists.
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function StatusPill({ match }: { match: Match }) {
  if (match.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd166]/40 bg-[#ffd166]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ffd166]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffd166]" aria-hidden="true" />
        Live{match.score?.minute != null ? ` ${match.score.minute}′` : ""}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
        Full time
      </span>
    );
  }
  if (match.status === "postponed" || match.status === "canceled" || match.status === "suspended") {
    return (
      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-muted">
        {match.status}
      </span>
    );
  }
  return (
    <time dateTime={match.startTime} className="text-xs font-medium text-muted">
      {formatKickoff(match.startTime)}
    </time>
  );
}

function TeamRow({
  team,
  score,
  bold,
}: {
  team: Match["homeTeam"];
  score?: number | null;
  bold?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      {team.logoUrl ? (
        <Image
          src={team.logoUrl}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0 object-contain"
        />
      ) : (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-[10px] font-bold text-muted"
          aria-hidden="true"
        >
          {team.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span
        className={
          bold ? "truncate text-sm font-semibold text-foreground" : "truncate text-sm text-muted"
        }
      >
        {team.name}
      </span>
      {score != null ? (
        <span className="ml-auto pr-1 text-sm font-bold tabular-nums text-foreground">
          {score}
        </span>
      ) : null}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const hasScore = match.score && (match.score.home != null || match.score.away != null);
  const showScore = match.status !== "scheduled" && hasScore;

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#ffd166]/40 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        {match.leagueName ? (
          <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted">
            {match.leagueName}
          </span>
        ) : (
          <span />
        )}
        <StatusPill match={match} />
      </div>

      <div className="mt-4 space-y-3">
        <TeamRow team={match.homeTeam} score={showScore ? match.score?.home : undefined} bold={match.score?.home != null && match.score.home > (match.score.away ?? 0)} />
        <TeamRow team={match.awayTeam} score={showScore ? match.score?.away : undefined} bold={match.score?.away != null && match.score.away > (match.score.home ?? 0)} />
      </div>

      {match.venue?.name ? (
        <p className="mt-4 truncate border-t border-border pt-3 text-xs text-muted">
          {match.venue.name}
          {match.venue.city ? `, ${match.venue.city}` : ""}
        </p>
      ) : null}
    </article>
  );
}

/** Shared notice styles for the section states below. */
export function SportsNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
