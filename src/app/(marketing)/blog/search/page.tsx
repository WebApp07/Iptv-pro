import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { searchPosts } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Search articles",
  description: "Search the IPTV Pro blog for guides, tips and fixes.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: siteUrl("/blog/search"),
  },
};

export default async function BlogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchPosts(query) : [];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <Badge
          variant="outline"
          className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
        >
          Search
        </Badge>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Search the blog
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Find guides on IPTV, streaming apps, devices and fixes.
        </p>

        <form action="/blog/search" method="get" role="search" className="mt-8">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="e.g. buffering, firestick, smart tv"
              aria-label="Search articles"
              maxLength={100}
              className="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted/60 focus:border-[#ffd166]/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shrink-0 bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              )}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        {query ? (
          results.length > 0 ? (
            <>
              <p className="mb-8 text-sm text-muted">
                {results.length}{" "}
                {results.length === 1 ? "article matches" : "articles match"}{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
              <h2 className="font-display text-2xl font-bold">
                Nothing found for &ldquo;{query}&rdquo;
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Try a shorter phrase, or browse everything on the blog.
              </p>
              <Link
                href="/blog"
                className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              >
                Browse all articles
              </Link>
            </div>
          )
        ) : null}

        {query ? (
          <Link
            href="/blog"
            className="mt-10 inline-block text-sm font-medium text-[#ffd166] hover:text-[#f4c255]"
          >
            Back to all articles
          </Link>
        ) : null}
      </div>
    </section>
  );
}
