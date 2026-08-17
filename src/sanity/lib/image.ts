import imageUrlBuilder from "@sanity/image-url";
import { getClient } from "./client";
import type { SanityImage } from "./types";

let builder: ReturnType<typeof createImageBuilder> | null = null;

function createImageBuilder() {
  return imageUrlBuilder(getClient());
}

export function urlFor(source: SanityImage) {
  if (!builder) {
    builder = createImageBuilder();
  }
  return builder.image(source);
}