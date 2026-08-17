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
  getPostsByCategoryCount,
  getPostsByCategoryPage,
  getPostsCount,
  getPostsPage,
} from "@/sanity/lib/queries";

const POSTS_PER_PAGE = 6;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Plain-language guides on IPTV, streaming devices, troubleshooting and entertainment. No jargon, just answers that actually help.",
  alternates: {
    canonical: siteUrl("/blog"),
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const categories = await getCategories();
  const categorySlugs = categories.map((category) => category.slug);
  const activeCategory =
    category && categorySlugs.includes(category) ? category : undefined;
  const requestedPage = Math.max(1, Number(pageParam) || 1);

  let featured;
  let posts;
  let totalCount;
  let totalPages;

  if (activeCategory) {
    totalCount = await getPostsByCategoryCount(activeCategory);
    totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
    const currentPage = Math.min(requestedPage, totalPages);
    posts = await getPostsByCategoryPage(
      activeCategory,
      (currentPage - 1) * POSTS_PER_PAGE,
      POSTS_PER_PAGE
    );
  } else {
    totalCount = await getPostsCount();
    // The newest post is the featured card on the first page.
    totalPages = Math.max(1, Math.ceil((totalCount - 1) / POSTS_PER_PAGE));
    const currentPage = Math.min(requestedPage, totalPages);
    const offset =
      currentPage === 1 ? 0 : 1 + (currentPage - 1) * POSTS_PER_PAGE;
    const limit = currentPage === 1 ? POSTS_PER_PAGE + 1 : POSTS_PER_PAGE;
    const pagePosts = await getPostsPage(offset, limit);
    if (currentPage === 1 && pagePosts.length > 0) {
      [featured, ...posts] = pagePosts;
    } else {
      posts = pagePosts;
    }
  }

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
              className={cn(
                "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !activeCategory
                  ? "border-[#ffd166] bg-[#ffd166] text-black"
                  : "border-border text-muted hover:border-[#ffd166]/40 hover:text-foreground"
              )}
            >
              All posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog?category=${encodeURIComponent(category.slug)}`}
                className={cn(
                  "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === category.slug
                    ? "border-[#ffd166] bg-[#ffd166] text-black"
                    : "border-border text-muted hover:border-[#ffd166]/40 hover:text-foreground"
                )}
              >
                {category.title}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {posts.length === 0 && !featured ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-bold">
              No articles here yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              {activeCategory
                ? `There are no published posts in ${activeCategory} right now.`
                : "The first post is on its way. Check back soon."}
            </p>
            {activeCategory ? (
              <Link
                href="/blog"
                className="mt-6 inline-block text-sm font-medium text-[#ffd166] hover:text-[#f4c255]"
              >
                Show all posts
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {!activeCategory && featured ? <FeaturedPost post={featured} /> : null}

            {posts.length > 0 ? (
              <div
                className={cn(
                  "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  !activeCategory && featured ? "mt-10" : ""
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
              href={
                activeCategory
                  ? `/blog?category=${encodeURIComponent(activeCategory)}&page=${currentPage - 1}`
                  : `/blog?page=${currentPage - 1}`
              }
              aria-disabled={!hasPrevious}
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
                href={
                  activeCategory
                    ? `/blog?category=${encodeURIComponent(activeCategory)}&page=${page}`
                    : `/blog?page=${page}`
                }
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
              href={
                activeCategory
                  ? `/blog?category=${encodeURIComponent(activeCategory)}&page=${currentPage + 1}`
                  : `/blog?page=${currentPage + 1}`
              }
              aria-disabled={!hasNext}
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