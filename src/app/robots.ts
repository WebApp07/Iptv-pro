import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/dashboard", "/register", "/blog/search"],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}