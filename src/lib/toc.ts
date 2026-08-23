import type { PortableTextBlock } from "@portabletext/types";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "section";
}

function blockText(block: PortableTextBlock): string {
  if (block._type !== "block") return "";
  return (block.children ?? [])
    .map((child) => (typeof child.text === "string" ? child.text : ""))
    .join("")
    .trim();
}

/**
 * Extracts H2/H3 headings from portable text and assigns each one a stable,
 * de-duplicated anchor id. Returns both the TOC entries and a map of block
 * key -> id so the renderer can attach matching ids to the actual headings.
 */
export function extractHeadings(
  blocks: PortableTextBlock[] | undefined
): {
  headings: TocHeading[];
  headingIds: Record<string, string>;
} {
  const headings: TocHeading[] = [];
  const headingIds: Record<string, string> = {};
  const usedIds = new Set<string>();

  for (const block of blocks ?? []) {
    if (block._type !== "block") continue;
    const style = block.style;
    if (style !== "h2" && style !== "h3") continue;
    const text = blockText(block);
    if (!text) continue;

    let id = slugify(text);
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${slugify(text)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    if (block._key) headingIds[block._key] = id;
    headings.push({ id, text, level: style === "h2" ? 2 : 3 });
  }

  return { headings, headingIds };
}
