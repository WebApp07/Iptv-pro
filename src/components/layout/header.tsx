import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NavLinks } from "@/components/layout/nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FreeTrialButton } from "@/components/free-trial/free-trial-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <NavLinks links={siteConfig.navLinks} />

        <div className="flex items-center gap-3">
          <FreeTrialButton size="sm">Free Trial</FreeTrialButton>
          <MobileNav links={siteConfig.navLinks} />
        </div>
      </div>
    </header>
  );
}