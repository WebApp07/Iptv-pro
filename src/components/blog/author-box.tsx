import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Author } from "@/sanity/lib/types";

export function AuthorBox({ author }: { author?: Author }) {
  if (!author?.name) return null;

  return (
    <div className="mt-12 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:p-8">
      {author.image ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#ffd166]/40">
          <Image
            src={urlFor(author.image).width(112).height(112).fit("crop").auto("format").url()}
            alt={author.image.alt || author.name}
            width={56}
            height={56}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ffd166] text-xl font-bold text-black">
          {author.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]">
          Written by
        </p>
        <h3 className="mt-1 font-display text-lg font-bold">{author.name}</h3>
        {author.bio ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{author.bio}</p>
        ) : null}
        {author.twitter ? (
          <a
            href={`https://twitter.com/${author.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#ffd166] transition-colors hover:text-[#f4c255]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
            @{author.twitter}
          </a>
        ) : null}
      </div>
    </div>
  );
}