import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { urlFor } from "@/sanity/lib/image";
import type { PostCard as PostCardType } from "@/sanity/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function BlogCard({
  post,
  className,
}: {
  post: PostCardType;
  className?: string;
}) {
  const category = post.categories?.[0];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50",
        className
      )}
    >
      {post.featuredImage ? (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={urlFor(post.featuredImage).auto("format").url()}
              alt={post.featuredImage.alt || post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          {category ? (
            <Badge variant="outline" className="border-primary/30 text-primary">
              {category.title}
            </Badge>
          ) : null}
          {post.readingTime ? (
            <span className="text-xs text-muted">{post.readingTime} min read</span>
          ) : null}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted">
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
    </article>
  );
}