import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, assertSanityEnv, dataset, projectId } from "../env";

export function getClient() {
  assertSanityEnv();
  return createClient({
    projectId: projectId!,
    dataset: dataset!,
    apiVersion,
    useCdn: true,
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