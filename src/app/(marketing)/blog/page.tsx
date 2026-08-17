import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { FeaturedPost } from "@/components/blog/featured-post";
import { siteConfig, siteUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { getCategories, getPosts, getPostsByCategory } from "@/sanity/lib/queries";

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const categorySlugs = categories.map((category) => category.slug);
  const activeCategory =
    category && categorySlugs.includes(category) ? category : undefined;

  const posts = activeCategory
    ? await getPostsByCategory(activeCategory)
    : await getPosts();

  const [featured, ...rest] = posts;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Blog</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Guides, tips and fixes for streaming
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Real answers about IPTV, streaming apps and devices, written for
            people who just want to watch. New articles land regularly.
          </p>
        </div>

        <nav
          aria-label="Blog categories"
          className="mt-8 flex flex-wrap gap-2"
        >
          <Link
            href="/blog"
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              !activeCategory
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            All posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog?category=${encodeURIComponent(category.slug)}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                activeCategory === category.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              {category.title}
            </Link>
          ))}
        </nav>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold">No articles here yet</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              {activeCategory
                ? `There are no published posts in ${activeCategory} right now.`
                : "The first post is on its way. Check back soon."}
            </p>
            {activeCategory ? (
              <Link
                href="/blog"
                className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
              >
                Show all posts
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {!activeCategory && featured ? (
              <FeaturedPost post={featured} />
            ) : null}

            {!activeCategory && rest.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            ) : null}

            {activeCategory ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd()) }}
      />
    </>
  );
}