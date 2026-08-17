export const siteConfig = {
  name: "IPTV Pro",
  description:
    "Live TV, international sport and a big movie library, all under one subscription.",
  url: "https://iptv-pro.example.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/iptvpro",
    github: "https://github.com/iptvpro",
  },
  whatsappUrl: "https://wa.me/+100000000",
  navLinks: [
    { title: "Home", href: "/" },
    { title: "Channels", href: "/channels" },
    { title: "Pricing", href: "/pricing" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Blog", href: "/blog" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

export function siteUrl(path = ""): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}