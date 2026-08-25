import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getCategorySlugs, getPostSlugs } from "@/sanity/lib/queries";
import { getPopularLeagues as getSportPopularLeagues } from "@/lib/sports";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/channels"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/channels/list"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: siteUrl("/pricing"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/blog"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/sports"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: siteUrl("/sports/football"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: siteUrl("/sports/basketball"), lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: siteUrl("/sports/tennis"), lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: siteUrl("/sports/cricket"), lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPostSlugs();
    postRoutes = slugs.map(({ slug, publishedAt, updatedAt }) => ({
      url: siteUrl(`/blog/${slug}`),
      // Prefer the editor-set revision date so search engines re-crawl updates.
      lastModified: updatedAt
        ? new Date(updatedAt)
        : publishedAt
          ? new Date(publishedAt)
          : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // The blog should never take down the sitemap if Sanity is unreachable.
  }

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getCategorySlugs();
    categoryRoutes = slugs.map(({ slug }) => ({
      url: siteUrl(`/blog/category/${slug}`),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // Same as above - categories are additive, never critical.
  }

  let leagueRoutes: MetadataRoute.Sitemap = [];
  try {
    // Only registry leagues the provider actually resolves get a URL -
    // unresolved entries would be thin, noindex pages.
    const resolved = await getSportPopularLeagues();
    if (resolved.status === "ok") {
      leagueRoutes = resolved.data.map(({ entry }) => ({
        url: siteUrl(`/sports/${entry.sport}/${entry.slug}`),
        changeFrequency: "hourly",
        priority: 0.6,
      }));
    }
  } catch {
    // Sports routes are additive, never critical.
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...leagueRoutes];
}
