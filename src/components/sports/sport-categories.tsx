import Link from "next/link";
import { cn } from "@/lib/utils";

export const SPORT_CATEGORIES = [
  { slug: "all", label: "All Sports" },
  { slug: "football", label: "Football" },
  { slug: "basketball", label: "Basketball" },
  { slug: "tennis", label: "Tennis" },
  { slug: "cricket", label: "Cricket" },
  { slug: "hockey", label: "Hockey" },
  { slug: "baseball", label: "Baseball" },
  { slug: "american-football", label: "American Football" },
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
 * Server-rendered links - no client JS.
 *
 * Mobile: single horizontal scroller that bleeds to the screen edges so
 * pills never wrap or squeeze. Desktop (sm+): static wrapped row.
 * "More" points at the live TV page where additional sports content lives.
 */
export function SportCategories({ active }: { active: SportCategorySlug }) {
  return (
    <nav
      aria-label="Sport categories"
      className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [scrollbar-color:transparent_transparent] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0"
    >
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
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
                "inline-flex min-h-[38px] shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
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
          className="inline-flex min-h-[38px] shrink-0 items-center whitespace-nowrap rounded-full border border-border px-4 text-sm font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
        >
          More
        </Link>
      </div>
    </nav>
  );
}
