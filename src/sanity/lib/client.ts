import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, assertSanityEnv, dataset, projectId } from "../env";

// Read-only token, resolved server-side only. Required when the dataset has
// public access disabled; harmless otherwise. Never use NEXT_PUBLIC_ for
// this - it must never reach the browser.
const READ_TOKEN =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

export function getClient() {
  assertSanityEnv();
  return createClient({
    projectId: projectId!,
    dataset: dataset!,
    apiVersion,
    useCdn: true,
    // Keeps private datasets readable without shipping credentials to the
    // browser: this module is only imported by server components/routes.
    token: READ_TOKEN || undefined,
  });
}

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return getClient().fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
