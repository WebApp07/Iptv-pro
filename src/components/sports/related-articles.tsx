import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { getSportsRelatedPosts } from "@/sanity/lib/queries";

/**
 * "Related Sports Guides" - real Sanity articles related to the current
 * sports surface. Matching runs through getSportsRelatedPosts: post tags,
 * SEO keywords, focus keyword and category titles are intersected with the
 * page context terms plus the default sports vocabulary.
 *
 * Rendered only when qualifying posts exist; the section omits itself
 * otherwise (no filler, no fake articles).
 */
export async function RelatedSportsArticles({
  terms,
}: {
  /** Page-context keywords, e.g. ["nba", "basketball"] on the NBA page. */
  terms?: string[];
}) {
  let posts: Awaited<ReturnType<typeof getSportsRelatedPosts>> = [];
  try {
    posts = await getSportsRelatedPosts(terms);
  } catch {
    return null;
  }
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-sports-heading">
      <Badge
        variant="outline"
        className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
      >
        From the blog
      </Badge>
      <h2 id="related-sports-heading" className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Related Sports Guides
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      <Link
        href="/blog"
        className="group mt-8 inline-block text-sm font-medium text-[#ffd166] transition-colors hover:text-[#f4c255]"
      >
        View all articles
        <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </section>
  );
}
