import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { FeaturedPost } from "@/components/blog/featured-post";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig, siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  getCategories,
  getFeaturedPost,
  getPostsCount,
  getPostsPage,
} from "@/sanity/lib/queries";
import type { PostCard as PostCardType } from "@/sanity/lib/types";

const POSTS_PER_PAGE = 6;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Plain-language guides on IPTV, streaming devices, troubleshooting and entertainment. No jargon, just answers that actually help.",
  alternates: {
    canonical: siteUrl("/blog"),
    types: {
      "application/rss+xml": siteUrl("/blog/rss.xml"),
    },
  },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description:
      "Plain-language guides on IPTV, streaming devices, troubleshooting and entertainment.",
    url: siteUrl("/blog"),
    images: [{ url: siteConfig.ogImage }],
  },
};

function breadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: siteUrl("/blog"),
      },
    ],
  };
}

function paginationRange(current: number, total: number): number[] {
  const pages: number[] = [];
  const start = Math.max(1, current - 1);
  const end = Math.min(total, current + 1);
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
}

async function loadBlogPage(requestedPage: number): Promise<{
  featured?: PostCardType;
  posts: PostCardType[];
  totalPages: number;
}> {
  const totalCount = await getPostsCount();
  if (totalCount === 0) return { posts: [], totalPages: 1 };

  // The newest post is the featured card on page 1 and is skipped in the grid.
  const totalPages = Math.max(1, Math.ceil((totalCount - 1) / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  if (currentPage > 1) {
    const posts = await getPostsPage(
      1 + (currentPage - 1) * POSTS_PER_PAGE,
      POSTS_PER_PAGE
    );
    return { posts, totalPages };
  }

  const [featured, posts] = await Promise.all([
    getFeaturedPost(),
    getPostsPage(0, POSTS_PER_PAGE + 1),
  ]);

  return {
    featured: featured ?? undefined,
    posts: posts.filter((post) => post.slug !== featured?.slug),
    totalPages,
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  // Note: legacy ?category=<slug> links are redirected server-side to
  // /blog/category/<slug> in src/proxy.ts before this page renders.

  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const [categories, { featured, posts, totalPages }] = await Promise.all([
    getCategories(),
    loadBlogPage(requestedPage),
  ]);
  const currentPage = Math.min(requestedPage, totalPages);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
          <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[#046bd2]/20 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              The Blog
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Guides, tips and fixes{" "}
              <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                for streaming
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Real answers about IPTV, streaming apps and devices, written for
              people who just want to watch. New articles land regularly.
            </p>
          </div>

          <nav
            aria-label="Blog categories"
            className="mt-10 flex flex-wrap gap-2"
          >
            <Link
              href="/blog"
              aria-current="page"
              className="inline-flex items-center rounded-full border border-[#ffd166] bg-[#ffd166] px-4 py-1.5 text-sm font-medium text-black"
            >
              All posts
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/category/${item.slug}`}
                className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
            <Link
              href="/blog/search"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search
            </Link>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {!featured && posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-bold">
              No articles here yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              The first post is on its way. Check back soon.
            </p>
          </div>
        ) : (
          <>
            {featured ? <FeaturedPost post={featured} /> : null}

            {posts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  featured ? "mt-10" : ""
                )}
              >
                {posts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            ) : null}
          </>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Blog pagination"
            className="mt-14 flex items-center justify-center gap-2"
          >
            <Link
              href={`/blog?page=${currentPage - 1}`}
              aria-disabled={!hasPrevious}
              rel="prev"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1 border-border text-muted hover:text-foreground",
                !hasPrevious && "pointer-events-none opacity-40"
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Newer
            </Link>

            {paginationRange(currentPage, totalPages).map((page) => (
              <Link
                key={page}
                href={page === 1 ? "/blog" : `/blog?page=${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                  page === currentPage
                    ? "border-[#ffd166] bg-[#ffd166] text-black"
                    : "border-border text-muted hover:border-[#ffd166]/40 hover:text-foreground"
                )}
              >
                {page}
              </Link>
            ))}

            <Link
              href={`/blog?page=${currentPage + 1}`}
              aria-disabled={!hasNext}
              rel="next"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1 border-border text-muted hover:text-foreground",
                !hasNext && "pointer-events-none opacity-40"
              )}
            >
              Older
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </nav>
        ) : null}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
    </>
  );
}
