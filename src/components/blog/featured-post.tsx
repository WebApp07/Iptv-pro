import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { urlFor } from "@/sanity/lib/image";
import type { PostCard as PostCardType } from "@/sanity/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function FeaturedPost({ post }: { post: PostCardType }) {
  const category = post.categories?.[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd166]/40 hover:shadow-[0_24px_80px_-24px] hover:shadow-[#ffd166]/25 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
        {post.featuredImage ? (
          <Image
            src={urlFor(post.featuredImage).auto("format").url()}
            alt={post.featuredImage.alt || post.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-[#ffd166]/50 bg-[#ffd166] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black">
            Featured
          </span>
          {category ? (
            <Badge
              variant="outline"
              className="border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]"
            >
              {category.title}
            </Badge>
          ) : null}
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-[#ffd166] sm:text-3xl">
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

        <span
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 w-fit bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors group-hover:bg-[#f4c255]"
          )}
        >
          Read article
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}