import { groq, type QueryParams } from "next-sanity";
import { sanityFetch } from "./client";
import type {
  Author,
  Category,
  CategoryDetail,
  CategorySlug,
  Post,
  PostCard,
  PostSlug,
  RssPost,
} from "./types";

const postsProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  featuredImage,
  publishedAt,
  updatedAt,
  readingTime,
  status,
  "tags": coalesce(tags, []),
  author->{
    _id,
    name,
    "slug": slug.current,
    image
  },
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`;

const postProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  featuredImage,
  body,
  publishedAt,
  updatedAt,
  readingTime,
  status,
  seoTitle,
  seoDescription,
  seoKeywords,
  focusKeyword,
  secondaryKeywords,
  canonicalUrl,
  noIndex,
  openGraphImage,
  tags,
  faq,
  author->{
    _id,
    name,
    "slug": slug.current,
    image,
    bio,
    twitter
  },
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  "relatedPosts": relatedPosts[]->${postsProjection}
}`;

const PUBLISHED_FILTER = `_type == "post" && status == "published" && defined(slug.current)`;

const POSTS_QUERY = groq`*[${PUBLISHED_FILTER}] | order(publishedAt desc) ${postsProjection}`;

const POSTS_PAGE_QUERY = groq`*[${PUBLISHED_FILTER}] | order(publishedAt desc)[$offset...$limit] ${postsProjection}`;

const POSTS_COUNT_QUERY = groq`count(*[${PUBLISHED_FILTER}])`;

const LATEST_POSTS_QUERY = groq`*[${PUBLISHED_FILTER}] | order(publishedAt desc)[0...$limit] ${postsProjection}`;

const FEATURED_POST_QUERY = groq`*[${PUBLISHED_FILTER}] | order(publishedAt desc)[0] ${postsProjection}`;

const POSTS_BY_CATEGORY_PAGE_QUERY = groq`*[${PUBLISHED_FILTER} && $category in categories[]->slug.current] | order(publishedAt desc)[$offset...$limit] ${postsProjection}`;

const POSTS_BY_CATEGORY_COUNT_QUERY = groq`count(*[${PUBLISHED_FILTER} && $category in categories[]->slug.current])`;

const RELATED_POSTS_QUERY = groq`*[
  ${PUBLISHED_FILTER}
  && slug.current != $slug
  && (
    count(categories[@->slug.current in $categories]) > 0
    || count(tags[@ in $tags]) > 0
  )
] | order(publishedAt desc)[0...$limit] ${postsProjection}`;

const POST_BY_SLUG_QUERY = groq`*[_type == "post" && status == "published" && slug.current == $slug][0] ${postProjection}`;

// Posts that ask not to be indexed must stay out of the sitemap and RSS too.
const INDEXABLE_FILTER = `${PUBLISHED_FILTER} && noIndex != true`;

const POST_SLUGS_QUERY = groq`*[${INDEXABLE_FILTER}] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt,
  updatedAt
}`;

const SEARCH_POSTS_QUERY = groq`*[
  ${PUBLISHED_FILTER}
  && (title match $term + "*" || excerpt match $term + "*" || (defined(focusKeyword) && focusKeyword match $term + "*") || count(seoKeywords[@ match $term + "*"]) > 0 || count(coalesce(tags, [])[@ match $term + "*"]) > 0)
] | order(publishedAt desc)[0...$limit] ${postsProjection}`;

const CATEGORIES_QUERY = groq`*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description
}`;

const CATEGORY_BY_SLUG_QUERY = groq`*[_type == "category" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  seoTitle,
  seoDescription,
  image
}`;

const CATEGORY_SLUGS_QUERY = groq`*[_type == "category" && defined(slug.current)] | order(title asc) {
  "slug": slug.current
}`;

const RSS_POSTS_QUERY = groq`*[${INDEXABLE_FILTER}] | order(publishedAt desc)[0...$limit] {
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  updatedAt
}`;

/**
 * Blog articles related to sports topics, for the Sports Hub's
 * "related content" section. Matches on editor tags/keywords or sporty
 * titles; returns [] when nothing qualifies so the section can be omitted.
 */
/**
 * Default sports vocabulary used to relate blog posts to sports surfaces.
 * Editors extend reach simply by tagging posts with any of these words -
 * no schema or code change required per article.
 */
/**
 * Default sports vocabulary used to relate blog posts to sports surfaces.
 * Editors extend reach simply by tagging posts with any of these words -
 * no schema or code change required per article.
 */
const SPORTS_TERM_FALLBACK_TITLES = [
  'title match "football*"',
  'title match "soccer*"',
  'title match "sport*"',
  'title match "nba*"',
  'title match "basketball*"',
  'title match "champions league*"',
  'title match "premier league*"',
  'title match "watch *"',
];

/**
 * One match condition per requested term. Uses the match operator so a
 * term like "nba" also hits longer tags/keywords such as "nba streaming",
 * case-insensitively across tags, SEO keywords, focus keyword and category
 * titles. Params are pre-sanitized - see getSportsRelatedPosts.
 */
function termCondition(index: number): string {
  const p = `$t${index}`;
  return [
    `count(tags[lower(@) match ${p}]) > 0`,
    `count(seoKeywords[lower(@) match ${p}]) > 0`,
    `count(categories[lower(@->title) match ${p}]) > 0`,
    `(defined(focusKeyword) && lower(focusKeyword) match ${p})`,
  ].join(" || ");
}

/** Strips characters that could alter GROQ pattern literals. */
function sanitizeTerm(term: string): string {
  return term.replace(/["'*\\\s]+/g, " ").trim();
}

/**
 * Blog articles related to sports, for the Sports Hub surfaces.
 *
 * Matching is driven entirely by real Sanity content: post tags, SEO
 * keywords, focus keyword and category titles are match-compared against
 * the requested terms (e.g. ["nba", "basketball"] on the NBA page) plus a
 * static set of sporty title patterns. Terms are sanitized before being
 * bound as parameters - no raw strings enter the query text.
 *
 * Returns [] when nothing qualifies - callers omit the section instead of
 * padding with unrelated posts.
 */
export async function getSportsRelatedPosts(
  terms?: string[]
): Promise<PostCard[]> {
  const cleaned = [
    ...new Set((terms ?? []).map(sanitizeTerm).filter(Boolean)),
  ].slice(0, 8);

  const params: QueryParams = {};
  const conds = cleaned.map((term, index) => {
    params[`t${index}`] = `${term}*`;
    return termCondition(index);
  });
  const termBlock = conds.length ? `${conds.join(" || ")} || ` : "";

  const query = groq`*[
    ${INDEXABLE_FILTER}
    && (${termBlock}${SPORTS_TERM_FALLBACK_TITLES.join(" || ")})
  ] | order(publishedAt desc)[0...3] ${postsProjection}`;

  return sanityFetch({ query, params, revalidate: 300 });
}

export async function getPosts(): Promise<PostCard[]> {
  return sanityFetch({ query: POSTS_QUERY, revalidate: 60 });
}

export async function getPostsPage(
  offset: number,
  limit: number
): Promise<PostCard[]> {
  return sanityFetch({
    query: POSTS_PAGE_QUERY,
    params: { offset, limit },
    revalidate: 60,
  });
}

export async function getPostsCount(): Promise<number> {
  return sanityFetch({ query: POSTS_COUNT_QUERY, revalidate: 60 });
}

export async function getFeaturedPost(): Promise<PostCard | null> {
  return sanityFetch({ query: FEATURED_POST_QUERY, revalidate: 60 });
}

export async function getLatestPosts(limit = 3): Promise<PostCard[]> {
  return sanityFetch({
    query: LATEST_POSTS_QUERY,
    params: { limit },
    revalidate: 60,
  });
}

export async function getPostsByCategoryPage(
  category: string,
  offset: number,
  limit: number
): Promise<PostCard[]> {
  return sanityFetch({
    query: POSTS_BY_CATEGORY_PAGE_QUERY,
    params: { category, offset, limit },
    revalidate: 60,
  });
}

export async function getPostsByCategoryCount(
  category: string
): Promise<number> {
  return sanityFetch({
    query: POSTS_BY_CATEGORY_COUNT_QUERY,
    params: { category },
    revalidate: 60,
  });
}

export async function getRelatedPosts(
  slug: string,
  categories: string[],
  tags: string[],
  limit = 3
): Promise<PostCard[]> {
  if (categories.length === 0 && tags.length === 0) {
    return [];
  }
  return sanityFetch({
    query: RELATED_POSTS_QUERY,
    params: { slug, categories, tags, limit },
    revalidate: 60,
  });
}

export async function searchPosts(query: string, limit = 12): Promise<PostCard[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }
  const params: QueryParams = {
    term: trimmed.replace(/["*\\]/g, " ").trim(),
    limit,
  };
  return sanityFetch({
    query: SEARCH_POSTS_QUERY,
    params,
    revalidate: 60,
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityFetch({
    query: POST_BY_SLUG_QUERY,
    params: { slug },
    revalidate: 60,
  });
}

export async function getPostSlugs(): Promise<PostSlug[]> {
  return sanityFetch({ query: POST_SLUGS_QUERY, revalidate: 60 });
}

export async function getCategories(): Promise<Category[]> {
  return sanityFetch({ query: CATEGORIES_QUERY, revalidate: 60 });
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDetail | null> {
  return sanityFetch({
    query: CATEGORY_BY_SLUG_QUERY,
    params: { slug },
    revalidate: 60,
  });
}

export async function getCategorySlugs(): Promise<CategorySlug[]> {
  return sanityFetch({ query: CATEGORY_SLUGS_QUERY, revalidate: 60 });
}

export async function getRssPosts(limit = 50): Promise<RssPost[]> {
    return sanityFetch({
      query: RSS_POSTS_QUERY,
      params: { limit },
      revalidate: 3600,
    });
}

export type { Author };
