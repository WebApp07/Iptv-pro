import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PortableTextBlock } from "@portabletext/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(date));
}

export function estimateReadingTime(
  blocks: PortableTextBlock[] | undefined,
  wordsPerMinute = 200
): number {
  if (!blocks) return 0;
  let words = 0;
  for (const block of blocks) {
    if (block._type !== "block") continue;
    for (const child of block.children ?? []) {
      if (child._type === "span" && typeof child.text === "string") {
        words += child.text.trim().split(/\s+/).filter(Boolean).length;
      }
    }
  }
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}