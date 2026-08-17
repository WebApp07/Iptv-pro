import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImage } from "@/sanity/lib/types";

function InlineImage({ value }: { value: SanityImage }) {
  const alt = value.alt || "Image inside the article";
  return (
    <figure className="my-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border">
        <Image
          src={urlFor(value).auto("format").url()}
          alt={alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      {value.caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function CodeBlock({
  value,
}: {
  value: { code?: string; language?: string; filename?: string };
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-[#0d1017]">
      {value.filename ? (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs text-muted">{value.filename}</span>
          {value.language ? (
            <span className="text-xs uppercase tracking-wide text-muted">
              {value.language}
            </span>
          ) : null}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground/90">{value.code}</code>
      </pre>
    </div>
  );
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 scroll-mt-24 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 scroll-mt-24 font-display text-xl font-bold tracking-tight sm:text-2xl">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 scroll-mt-24 font-heading text-lg font-semibold">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary bg-card/60 px-5 py-4 text-lg text-foreground/85 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="my-4 leading-relaxed text-foreground/85">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-accent">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href as string | undefined;
      if (!href) return <>{children}</>;
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-primary underline underline-offset-4 transition-colors hover:text-accent"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 list-disc space-y-2 pl-6 text-foreground/85">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 list-decimal space-y-2 pl-6 text-foreground/85">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  types: {
    image: ({ value }: { value: SanityImage }) => <InlineImage value={value} />,
    code: ({
      value,
    }: {
      value: { code?: string; language?: string; filename?: string };
    }) => <CodeBlock value={value} />,
  },
};

export function PortableTextContent({
  value,
}: {
  value: Parameters<typeof PortableText>[0]["value"];
}) {
  return (
    <div className="text-base sm:text-lg">
      <PortableText value={value} components={components} />
    </div>
  );
}