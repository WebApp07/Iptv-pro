export const siteConfig = {
  name: "IPTV Pro",
  description:
    "Premium IPTV streaming platform with thousands of live channels, VOD, and 4K quality.",
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
  ],
} as const;

export type SiteConfig = typeof siteConfig;