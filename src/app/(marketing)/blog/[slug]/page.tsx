import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox } from "@/components/blog/author-box";
import { BlogCard } from "@/components/blog/blog-card";
import { PostFaq } from "@/components/blog/post-faq";
import { PortableTextContent } from "@/components/blog/portable-text";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig, siteUrl } from "@/config/site";
import { cn, estimateReadingTime, formatDate } from "@/lib/utils";
import { extractHeadings } from "@/lib/toc";
import { urlFor } from "@/sanity/lib/image";
import {
  getLatestPosts,
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
} from "@/sanity/lib/queries";
import type { Post, PostCard } from "@/sanity/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await getPostSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

function ogImageUrl(image: Post["openGraphImage"] | Post["featuredImage"]) {
  return image
    ? urlFor(image).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;
}

/**
 * A Sanity editor can override the canonical URL (e.g. for syndicated
 * content). Respect that choice, but never let an internal or insecure URL -
 * localhost, LAN addresses, dev ports - leak into production metadata.
 */
function resolveCanonical(post: Post): string {
  const fallback = siteUrl(`/blog/${post.slug}`);
  const custom = post.canonicalUrl;
  if (!custom) return fallback;
  try {
    const parsed = new URL(custom);
    if (parsed.protocol !== "https:") return fallback;
    if (parsed.port) return fallback;
    if (
      /^(localhost|127\.|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i.test(
        parsed.hostname
      )
    ) {
      return fallback;
    }
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // Checked here rather than in the page body so unknown slugs get a real
  // 404 status - metadata resolves before the response starts streaming.
  // The fetch is deduplicated with the page's own request.
  if (!post) notFound();

  const url = siteUrl(`/blog/${post.slug}`);
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const imageUrl = ogImageUrl(post.openGraphImage || post.featuredImage);
  const images = imageUrl
    ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt:
            post.openGraphImage?.alt ||
            post.featuredImage?.alt ||
            post.title,
        },
      ]
    : [];

  return {
    title,
    description,
    keywords: [
      ...(post.focusKeyword ? [post.focusKeyword] : []),
      ...(post.secondaryKeywords ?? []),
      ...(post.seoKeywords ?? []),
    ],
    // Respect the editor's noindex decision; drafts never reach this page.
    robots: post.noIndex ? { index: false, follow: false } : undefined,
    alternates: { canonical: resolveCanonical(post) },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: siteConfig.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
      ...(images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images.length > 0
        ? { images: images.map((image) => image.url) }
        : {}),
    },
  };
}

function articleJsonLd(post: Post, url: string) {
  const imageUrl = ogImageUrl(post.openGraphImage || post.featuredImage);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    ...(post.focusKeyword ? { keywords: [post.focusKeyword, ...(post.secondaryKeywords ?? []), ...(post.seoKeywords ?? [])].join(", ") } : {}),
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

function breadcrumbJsonLd(post: Post, url: string) {
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.categories?.[0]?.title ?? "Articles",
        item: post.categories?.[0]
          ? siteUrl(`/blog/category/${post.categories[0].slug}`)
          : undefined,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: url,
      },
    ].filter((item) => item.item),
  };
}

function faqJsonLd(post: Post) {
  if (!post.faq || post.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

async function resolveRelatedPosts(post: Post): Promise<PostCard[]> {
  // Editor-curated picks win, then category/tag matches, then latest.
  if (post.relatedPosts && post.relatedPosts.length > 0) {
    return post.relatedPosts.filter((item) => item.slug !== post.slug);
  }
  const related = await getRelatedPosts(
    post.slug,
    post.categories?.map((category) => category.slug) ?? [],
    post.tags ?? [],
    3
  );
  if (related.length > 0) {
    return related.slice(0, 3);
  }
  const latest = await getLatestPosts(4);
  return latest
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = siteUrl(`/blog/${post.slug}`);
  const readingTime = post.readingTime ?? estimateReadingTime(post.body);
  const category = post.categories?.[0];
  const { headings, headingIds } = extractHeadings(post.body);
  const related = await resolveRelatedPosts(post);
  const faqLd = faqJsonLd(post);

  return (
    <>
      <article className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96">
          <div className="absolute -top-24 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-[#ffd166]/[0.07] blur-[140px]" />
        </div>

        <header className="relative mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Home
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
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            {category ? (
              <>
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
                <Link
                  href={`/blog/category/${category.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {category.title}
                </Link>
              </>
            ) : null}
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
            <span className="truncate text-foreground/80">{post.title}</span>
          </nav>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {category ? (
              <Badge
                variant="outline"
                className="border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]"
              >
                {category.title}
              </Badge>
            ) : null}
            {readingTime ? (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {readingTime} min read
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-8 text-sm text-muted">
            {post.author?.name ? (
              <span className="font-medium text-foreground/80">
                {post.author.name}
              </span>
            ) : null}
            {post.author?.name && post.publishedAt ? <span>·</span> : null}
            {post.publishedAt ? (
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            ) : null}
            {post.updatedAt ? (
              <>
                <span>·</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            ) : null}
          </div>
        </header>

        {post.featuredImage ? (
          <figure className="relative mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8 m-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Image
                src={urlFor(post.featuredImage)
                  .width(1600)
                  .height(900)
                  .fit("crop")
                  .auto("format")
                  .url()}
                alt={post.featuredImage.alt || post.title}
                width={1600}
                height={900}
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
            {post.featuredImage.caption ? (
              <figcaption className="mt-3 text-center text-sm text-muted">
                {post.featuredImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <TableOfContents headings={headings} />
          <PortableTextContent value={post.body} headingIds={headingIds} />

          {post.tags && post.tags.length > 0 ? (
            <div className="mt-12 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted">Topics:</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/search?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-[#ffd166]/40 hover:text-foreground"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}

          <ShareButtons slug={post.slug} title={post.title} />

          <AuthorBox author={post.author} />

          {faqLd ? <PostFaq faqs={post.faq!} jsonLd={faqLd} /> : null}

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#ffd166]/20 bg-gradient-to-br from-[#ffd166]/5 to-transparent p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-xl font-bold tracking-tight">
                Ready to start watching?
              </p>
              <p className="mt-1 text-sm text-muted">
                Live TV, sport and movies in one subscription. Setup takes a few
                minutes and support is around the clock.
              </p>
            </div>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shrink-0 bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              )}
            >
              See plans &amp; pricing
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
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="relative mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Badge
                variant="outline"
                className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
              >
                Keep reading
              </Badge>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                More from the blog
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <BlogCard key={item._id} post={item} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post, url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(post, url)) }}
      />
    </>
  );
}
