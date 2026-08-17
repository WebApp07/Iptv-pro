import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Author } from "@/sanity/lib/types";

export function AuthorBox({ author }: { author?: Author }) {
  if (!author?.name) return null;

  return (
    <div className="mt-10 flex items-start gap-4 rounded-xl border border-border bg-card p-6">
      {author.image ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
          <Image
            src={urlFor(author.image).width(112).height(112).fit("crop").auto("format").url()}
            alt={author.image.alt || author.name}
            width={56}
            height={56}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
          {author.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Written by</p>
        <h3 className="mt-1 font-display text-lg font-bold">{author.name}</h3>
        {author.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{author.bio}</p>
        ) : null}
        {author.twitter ? (
          <a
            href={`https://twitter.com/${author.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            @{author.twitter}
          </a>
        ) : null}
      </div>
    </div>
  );
}