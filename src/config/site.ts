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
  // PLACEHOLDER - replace with your real support email before publishing.
  supportEmail: "support@example.com",
  // PLACEHOLDER - add the payment methods you actually accept at checkout
  // (e.g. "PayPal", "Visa", "Mastercard"). The footer payments strip stays
  // hidden while this array is empty.
  paymentMethods: [] as readonly string[],
  navLinks: [
    { title: "Home", href: "/" },
    { title: "Movies", href: "/movies" },
    { title: "Series", href: "/series" },
    { title: "Sports", href: "/sports" },
    { title: "Channels", href: "/channels" },
    { title: "Blog", href: "/blog" },
    { title: "Pricing", href: "/pricing" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

export function siteUrl(path = ""): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}