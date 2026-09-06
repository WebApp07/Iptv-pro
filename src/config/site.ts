export const siteConfig = {
  name: "IPTV Pro",
  description:
    "Live TV, international sport and a big movie library, all under one subscription.",
  url: "https://iptv-pro.example.com",
  ogImage: "/og-image.png",
  whatsappUrl: "https://wa.me/44697948866",
  supportEmail: "support@tv96.uk",
  paymentMethods: ["PayPal", "Visa", "Mastercard"] as readonly string[],
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