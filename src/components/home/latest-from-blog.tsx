import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { getLatestPosts } from "@/sanity/lib/queries";

export async function LatestFromBlog() {
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET
  ) {
    return null;
  }

  let posts;
  try {
    posts = await getLatestPosts(3);
  } catch {
    return null;
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
            >
              Latest from the blog
            </Badge>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Guides and tips for smarter streaming
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Practical articles about IPTV, apps and devices, written so you
              can get back to watching faster.
            </p>
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            View all articles →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}