"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
  title: string;
  href: string;
}

function isActive(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (href === "/") return normalized === "/";
  return normalized === href || normalized.startsWith(`${href}/`);
}

/**
 * Desktop navigation links with active-route highlighting. Client component
 * because the active state depends on the live pathname - the smallest
 * possible interactive island inside an otherwise server-rendered header.
 */
export function NavLinks({ links }: { links: readonly NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm transition-colors",
              active
                ? "font-medium text-[#ffd166]"
                : "text-muted hover:text-foreground"
            )}
          >
            {link.title}
          </Link>
        );
      })}
    </nav>
  );
}
