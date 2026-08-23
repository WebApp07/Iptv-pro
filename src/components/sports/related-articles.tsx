import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { getSportsRelatedPosts } from "@/sanity/lib/queries";

/**
 * Related blog articles for the Sports Hub. Rendered only when the CMS has
 * sports-related content - the section is omitted otherwise.
 */
export async function RelatedSportsArticles() {
  let posts: Awaited<ReturnType<typeof getSportsRelatedPosts>> = [];
  try {
    posts = await getSportsRelatedPosts();
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
        Related sports reading
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
