import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig, siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  getCategoryBySlug,
  getCategorySlugs,
  getPostsByCategoryCount,
  getPostsByCategoryPage,
} from "@/sanity/lib/queries";

export const revalidate = 60;

const POSTS_PER_PAGE = 9;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getCategorySlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  // Checked here rather than in the page body so unknown slugs get a real
  // 404 status - metadata resolves before the response starts streaming.
  if (!category) notFound();

  const currentPage = Math.max(1, Number(page) || 1);
  const url = siteUrl(
    currentPage > 1
      ? `/blog/category/${category.slug}?page=${currentPage}`
      : `/blog/category/${category.slug}`
  );
  const title = category.seoTitle || `${category.title} articles`;
  const description =
    category.seoDescription ||
    category.description ||
    `Guides and tips filed under ${category.title}.`;
  const ogImage = category.image
    ? [
        {
          url: urlFor(category.image)
            .width(1200)
            .height(630)
            .fit("crop")
            .auto("format")
            .url(),
          width: 1200,
          height: 630,
          alt: category.image.alt || category.title,
        },
      ]
    : [{ url: siteConfig.ogImage }];

  return {
    title,
    description,
    // Paginated pages are crawlable but should not outrank the clean URL.
    robots:
      currentPage > 1 ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: siteUrl(`/blog/category/${category.slug}`),
    },
    openGraph: {
      title,
      description,
      url,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage.map((image) => image.url),
    },
  };
}

function breadcrumbJsonLd(categoryTitle: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: siteUrl("/blog"),
      },
      { "@type": "ListItem", position: 3, name: categoryTitle, item: url },
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const totalCount = await getPostsByCategoryCount(category.slug);
  if (totalCount === 0) notFound();

  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const posts = await getPostsByCategoryPage(
    category.slug,
    (currentPage - 1) * POSTS_PER_PAGE,
    POSTS_PER_PAGE
  );

  const baseUrl = `/blog/category/${category.slug}`;
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
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/blog" className="transition-colors hover:text-foreground">
              Blog
            </Link>
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
              <path d="m9 6 6 6-6 6" />
            </svg>
            <span className="text-foreground/80">{category.title}</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <Badge
              variant="outline"
              className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
            >
              Category
            </Badge>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {category.title}
            </h1>
            {category.description ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {category.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted">
              {totalCount} {totalCount === 1 ? "article" : "articles"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>

        {totalPages > 1 ? (
          <nav
            aria-label="Blog pagination"
            className="mt-14 flex items-center justify-center gap-2"
          >
            <Link
              href={`${baseUrl}?page=${currentPage - 1}`}
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
                href={page === 1 ? baseUrl : `${baseUrl}?page=${page}`}
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
              href={`${baseUrl}?page=${currentPage + 1}`}
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(category.title, siteUrl(baseUrl))),
        }}
      />
    </>
  );
}
