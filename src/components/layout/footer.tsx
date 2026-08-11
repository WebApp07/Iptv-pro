import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinks = {
  Product: [
    { title: "Channels", href: "/channels" },
    { title: "Pricing", href: "/pricing" },
    { title: "VOD Library", href: "/vod" },
  ],
  Company: [
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ],
  Legal: [
    { title: "Terms", href: "/terms" },
    { title: "Privacy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            {siteConfig.name}
          </Link>
          <p className="text-sm text-muted">{siteConfig.description}</p>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{group}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}