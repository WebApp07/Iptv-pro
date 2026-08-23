import Link from "next/link";
import { cn } from "@/lib/utils";

export const SPORT_CATEGORIES = [
  { slug: "all", label: "All Sports" },
  { slug: "football", label: "Football" },
  { slug: "basketball", label: "Basketball" },
  { slug: "tennis", label: "Tennis" },
  { slug: "hockey", label: "Hockey" },
  { slug: "baseball", label: "Baseball" },
  { slug: "mma", label: "MMA" },
] as const;

export type SportCategorySlug = (typeof SPORT_CATEGORIES)[number]["slug"];

export function isValidSportCategory(value: string): value is SportCategorySlug {
  return SPORT_CATEGORIES.some((category) => category.slug === value);
}

/** Case-insensitive lookup; "all" is a valid category. Null when unknown. */
export function resolveSportCategory(
  raw: string
): (typeof SPORT_CATEGORIES)[number] | null {
  return (
    SPORT_CATEGORIES.find(
      (category) => category.slug === raw.toLowerCase()
    ) ?? null
  );
}

/**
 * Category navigation for the hub. Clean routes per sport - no query params.
 * Server-rendered links - no client JS. "More" points at the live TV page
 * where additional sports content lives.
 */
export function SportCategories({ active }: { active: SportCategorySlug }) {
  return (
    <nav aria-label="Sport categories" className="flex flex-wrap gap-2">
      {SPORT_CATEGORIES.map((category) => {
        const isActive = category.slug === active;
        const href =
          category.slug === "all"
            ? "/sports"
            : `/sports/${category.slug}`;
        return (
          <Link
            key={category.slug}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[#ffd166] bg-[#ffd166] text-black"
                : "border-border text-muted hover:border-[#ffd166]/40 hover:text-foreground"
            )}
          >
            {category.label}
          </Link>
        );
      })}
      <Link
        href="/channels"
        className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
      >
        More
      </Link>
    </nav>
  );
}
