import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox } from "@/components/blog/author-box";
import { BlogCard } from "@/components/blog/blog-card";
import { PortableTextContent } from "@/components/blog/portable-text";
import { Badge } from "@/components/ui/badge";
import { siteConfig, siteUrl } from "@/config/site";
import { estimateReadingTime, formatDate } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  getLatestPosts,
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
} from "@/sanity/lib/queries";
import type { Post } from "@/sanity/lib/types";

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

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = siteUrl(`/blog/${post.slug}`);
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const ogImage = post.openGraphImage || post.featuredImage;
  const images = ogImage
    ? [
        {
          url: urlFor(ogImage)
            .width(1200)
            .height(630)
            .fit("crop")
            .auto("format")
            .url(),
          width: 1200,
          height: 630,
          alt: ogImage.alt || post.title,
        },
      ]
    : [];

  return {
    title,
    description,
    keywords: post.seoKeywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

function articleJsonLd(post: Post, url: string) {
  const ogImage = post.openGraphImage || post.featuredImage;
  const imageUrl = ogImage
    ? urlFor(ogImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = siteUrl(`/blog/${post.slug}`);
  const readingTime =
    post.readingTime ?? estimateReadingTime(post.body);
  const category = post.categories?.[0];

  let related = await getRelatedPosts(
    post.slug,
    post.categories?.map((category) => category.slug) ?? [],
    3
  );
  if (related.length === 0) {
    const latest = await getLatestPosts(4);
    related = latest.filter((item) => item.slug !== post.slug).slice(0, 3);
  }

  return (
    <>
      <article>
        <header className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← All articles
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {category ? (
              <Badge variant="outline" className="border-primary/30 text-primary">
                {category.title}
              </Badge>
            ) : null}
            {readingTime ? (
              <span className="text-sm text-muted">{readingTime} min read</span>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
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
          <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
              <Image
                src={urlFor(post.featuredImage).auto("format").url()}
                alt={post.featuredImage.alt || post.title}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>
            {post.featuredImage.caption ? (
              <p className="mt-3 text-center text-sm text-muted">
                {post.featuredImage.caption}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <PortableTextContent value={post.body} />
          <AuthorBox author={post.author} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Keep reading
          </h2>
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