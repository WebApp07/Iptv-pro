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
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd166]/40 hover:shadow-[0_20px_60px_-20px] hover:shadow-[#ffd166]/20",
        className
      )}
    >
      {post.featuredImage ? (
        <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={urlFor(post.featuredImage).auto("format").url()}
              alt={post.featuredImage.alt || post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>
      ) : (
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-secondary/60 to-card" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          {category ? (
            <Badge
              variant="outline"
              className="border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]"
            >
              {category.title}
            </Badge>
          ) : null}
          {post.readingTime ? (
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {post.readingTime} min
            </span>
          ) : null}
        </div>

        <Link href={`/blog/${post.slug}`} className="mt-4">
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-[#ffd166]">
            {post.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-2 text-xs text-muted">
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
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-[#ffd166] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            Read
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
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}