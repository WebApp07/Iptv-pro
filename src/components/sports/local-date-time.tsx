"use client";

import { useMemo, useSyncExternalStore } from "react";

type Mode = "datetime" | "date" | "time";

/** Resolved once per document on the client; "UTC" on the server. */
function getClientTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

let cachedClientTimeZone: string | null = null;
function subscribe(): () => void {
  // The visitor's timezone cannot change mid-session; nothing to observe.
  return () => {};
}
function getClientSnapshot(): string {
  if (cachedClientTimeZone === null) {
    cachedClientTimeZone = getClientTimeZone();
  }
  return cachedClientTimeZone;
}
function getServerSnapshot(): string {
  return "UTC";
}

function format(iso: string, mode: Mode, timeZone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions =
    mode === "date"
      ? { weekday: "short", day: "numeric", month: "short", year: "numeric" }
      : mode === "time"
        ? { hour: "2-digit", minute: "2-digit", hour12: false }
        : {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          };
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone }).format(date);
}

/**
 * Renders a match date/time in the visitor's own timezone.
 *
 * The server render (and first client paint) show the deterministic UTC
 * value; useSyncExternalStore then swaps in the localized value without any
 * hydration mismatch. This is the only client-side piece of the sports UI -
 * everything else stays server-rendered.
 */
export function LocalDateTime({
  iso,
  mode = "datetime",
  className,
}: {
  iso: string;
  mode?: Mode;
  className?: string;
}) {
  const timeZone = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const value = useMemo(() => format(iso, mode, timeZone), [iso, mode, timeZone]);
  const zoneLabel = useMemo(() => {
    if (!value) return "";
    try {
      return (
        new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" })
          .formatToParts(new Date(iso))
          .find((part) => part.type === "timeZoneName")?.value ?? timeZone
      );
    } catch {
      return timeZone;
    }
  }, [iso, timeZone, value]);

  if (!value) return null;

  return (
    <span className={className}>
      <time dateTime={iso}>{value}</time>
      {zoneLabel !== "UTC" ? (
        <span className="ml-1 text-xs text-muted">{zoneLabel}</span>
      ) : (
        <span className="ml-1 text-xs text-muted">UTC</span>
      )}
    </span>
  );
}
