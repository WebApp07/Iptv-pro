import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { urlFor } from "@/sanity/lib/image";
import type { PostCard as PostCardType } from "@/sanity/lib/types";
import { formatDate } from "@/lib/utils";

export function FeaturedPost({ post }: { post: PostCardType }) {
  const category = post.categories?.[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
        {post.featuredImage ? (
          <Image
            src={urlFor(post.featuredImage).auto("format").url()}
            alt={post.featuredImage.alt || post.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <Badge variant="outline" className="border-primary/30 text-primary">
              {category.title}
            </Badge>
          ) : null}
          {post.readingTime ? (
            <span className="text-xs text-muted">{post.readingTime} min read</span>
          ) : null}
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
          {post.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted sm:text-base">
          {post.excerpt}
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted">
          {post.author?.name ? (
            <span className="font-medium text-foreground/80">
              {post.author.name}
            </span>
          ) : null}
          {post.author?.name && post.publishedAt ? <span>·</span> : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          ) : null}
        </div>
      </div>
    </Link>
  );
}