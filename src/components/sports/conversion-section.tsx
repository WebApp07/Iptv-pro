import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * IPTV conversion block. Copy is deliberately service-level - no specific
 * channels or competitions are claimed.
 */
export function ConversionSection() {
  return (
    <section
      aria-labelledby="watch-iptv-heading"
      className="relative overflow-hidden rounded-2xl border border-[#ffd166]/20 bg-gradient-to-br from-[#ffd166]/5 to-transparent p-8 sm:p-12"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#ffd166]/10 blur-[100px]" />
      <div className="relative max-w-2xl">
        <h2 id="watch-iptv-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Watch More Than Just the Game
        </h2>
        <p className="mt-4 leading-relaxed text-muted sm:text-lg">
          Follow your favorite teams and discover where to watch the action.
          With our IPTV service, enjoy access to a wide selection of live TV
          channels and sports content in one place.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            )}
          >
            View IPTV Plans
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/channels"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-border text-muted transition-colors hover:text-foreground"
            )}
          >
            Explore Live TV
          </Link>
        </div>
      </div>
    </section>
  );
}
