import type { TocHeading } from "@/lib/toc";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="mb-10 rounded-2xl border border-border bg-card p-6"
    >
      <p
        id="toc-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
      >
        On this page
      </p>
      <ol className="mt-4 space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "pl-4" : undefined}
          >
            <a
              href={`#${heading.id}`}
              className="block rounded-md px-2 py-1.5 leading-snug text-muted transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
