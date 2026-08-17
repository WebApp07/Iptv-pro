import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getPostSlugs } from "@/sanity/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/channels"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/pricing"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: siteUrl("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/blog"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPostSlugs();
    postRoutes = slugs.map(({ slug, publishedAt }) => ({
      url: siteUrl(`/blog/${slug}`),
      lastModified: publishedAt ? new Date(publishedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // The blog should never take down the sitemap if Sanity is unreachable.
  }

  return [...staticRoutes, ...postRoutes];
}