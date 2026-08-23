import { getRssPosts } from "@/sanity/lib/queries";
import { siteConfig, siteUrl } from "@/config/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  let items = "";
  try {
    const posts = await getRssPosts();
    items = posts
      .map((post) => {
        const url = siteUrl(`/blog/${post.slug}`);
        return [
          "    <item>",
          `      <title>${escapeXml(post.title)}</title>`,
          `      <link>${url}</link>`,
          `      <guid isPermaLink="true">${url}</guid>`,
          `      <description>${escapeXml(post.excerpt)}</description>`,
          `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
          post.updatedAt
            ? `      <atom:updated>${new Date(post.updatedAt).toISOString()}</atom:updated>`
            : null,
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");
  } catch {
    // An unreachable CMS should still return a valid (empty) feed.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} Blog`)}</title>
    <link>${siteUrl("/blog")}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <atom:link href="${siteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
