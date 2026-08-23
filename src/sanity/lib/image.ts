import { createImageUrlBuilder } from "@sanity/image-url";
import { getClient } from "./client";
import type { SanityImage } from "./types";

let builder: ReturnType<typeof createImageUrlBuilder> | null = null;

function getBuilder() {
  if (!builder) {
    builder = createImageUrlBuilder(getClient());
  }
  return builder;
}

export function urlFor(source: SanityImage) {
  return getBuilder().image(source);
}
