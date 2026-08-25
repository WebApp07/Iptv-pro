import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { FreeTrialButton } from "@/components/free-trial/free-trial-button";

const quickLinks = [
  { title: "Home", href: "/" },
  { title: "Movies", href: "/movies" },
  { title: "Series", href: "/series" },
  { title: "Sports", href: "/sports" },
  { title: "Live TV", href: "/live-tv" },
  { title: "Channels", href: "/channels" },
  { title: "Pricing", href: "/pricing" },
  { title: "Blog", href: "/blog" },
];

const legalLinks = [
  { title: "Terms of Service", href: "/terms" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Refund Policy", href: "/refund" },
  { title: "DMCA / Copyright Policy", href: "/dmca" },
  { title: "Contact Us", href: "/contact" },
];

const exploreLinks = [
  { title: "IPTV Plans", href: "/pricing" },
  { title: "Movies", href: "/movies" },
  { title: "Series", href: "/series" },
  { title: "Sports", href: "/sports" },
];

function DeviceIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-[#ffd166]/80"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const devices = [
  {
    label: "Smart TV",
    icon: (
      <DeviceIcon>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </DeviceIcon>
    ),
  },
  {
    label: "Android TV",
    icon: (
      <DeviceIcon>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <circle cx="8" cy="12" r="1" />
        <path d="M12 11v2M15 11v2" />
      </DeviceIcon>
    ),
  },
  {
    label: "Fire TV Stick",
    icon: (
      <DeviceIcon>
        <rect x="9" y="3" width="6" height="18" rx="1.5" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </DeviceIcon>
    ),
  },
  {
    label: "Apple TV",
    icon: (
      <DeviceIcon>
        <rect x="3" y="8" width="13" height="9" rx="2" />
        <rect x="18" y="9" width="3.5" height="7" rx="1" />
        <circle cx="19.75" cy="11" r="0.5" fill="currentColor" />
      </DeviceIcon>
    ),
  },
  {
    label: "Android",
    icon: (
      <DeviceIcon>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </DeviceIcon>
    ),
  },
  {
    label: "iPhone & iPad",
    icon: (
      <DeviceIcon>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M10 17.5h4" />
      </DeviceIcon>
    ),
  },
  {
    label: "Windows",
    icon: (
      <DeviceIcon>
        <rect x="2" y="5" width="20" height="12" rx="2" />
        <path d="M9 21h6" />
      </DeviceIcon>
    ),
  },
  {
    label: "macOS",
    icon: (
      <DeviceIcon>
        <rect x="4" y="4" width="16" height="11" rx="1.5" />
        <path d="M2 19h20" />
      </DeviceIcon>
    ),
  },
];

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
      {children}
    </h2>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-5 sm:col-span-2 lg:col-span-1 lg:pr-8">
            <Link
              href="/"
              className="inline-block rounded font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {siteConfig.name}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.description} No contracts, and your login arrives
              within minutes on WhatsApp.
            </p>
            <FreeTrialButton
              size="lg"
              className="w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/50 transition-colors hover:bg-[#f4c255] sm:w-auto sm:max-w-full"
            >
              Start Your 24-Hour Free Trial
            </FreeTrialButton>
          </div>

          <nav aria-label="Quick links">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.title}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <FooterHeading>Legal</FooterHeading>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.title}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Customer support">
            <FooterHeading>Customer Support</FooterHeading>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="/contact">Contact Us</FooterLink>
              </li>
              <li>
                <FooterLink href="/#faq">Support Center</FooterLink>
              </li>
              <li>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                {/* PLACEHOLDER address - replace supportEmail in src/config/site.ts */}
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="rounded text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Explore">
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-2.5">
              <li>
                <FreeTrialButton
                  variant="ghost"
                  className="-ml-px h-auto justify-start px-0 py-0.5 text-left text-sm font-normal text-muted hover:bg-transparent hover:text-foreground"
                >
                  Free Trial
                </FreeTrialButton>
              </li>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.title}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-10">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Compatible With Your Favorite Devices
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {devices.map((device) => (
              <li
                key={device.label}
                className="flex items-center gap-2.5 text-sm text-muted"
              >
                {device.icon}
                {device.label}
              </li>
            ))}
          </ul>
        </div>

        {siteConfig.paymentMethods.length > 0 && (
          <div className="mt-10 border-t border-border pt-10">
            <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Secure Payment Methods
            </h2>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {siteConfig.paymentMethods.map((method) => (
                <li
                  key={method}
                  className="rounded-md border border-border bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-muted"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PLACEHOLDER - review this disclaimer with the real business details before publishing */}
        <p className="mx-auto mt-10 max-w-4xl text-center text-xs leading-relaxed text-white/50">
          {siteConfig.name} is an IPTV subscription service operated by
          [Company Legal Name]. Channel, movie and series availability may
          vary by region and plan and is subject to change. All product
          names, logos, brands and devices mentioned on this website are the
          property of their respective owners and do not imply endorsement
          or partnership. For copyright enquiries, see our{" "}
          <Link
            href="/dmca"
            className="font-semibold text-[#ffd166]/90 transition-colors hover:text-[#ffd166]"
          >
            DMCA / Copyright Policy
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>

          <nav aria-label="Legal shortcuts" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/refund">Refund Policy</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Twitter
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
