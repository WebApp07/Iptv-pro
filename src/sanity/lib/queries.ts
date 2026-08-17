import { groq } from "next-sanity";
import { sanityFetch } from "./client";
import type { Author, Category, Post, PostCard, PostSlug } from "./types";

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
  openGraphImage,
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
  }
}`;

const POSTS_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current)] | order(publishedAt desc) ${postsProjection}`;

const POSTS_PAGE_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current)] | order(publishedAt desc)[$offset...$limit] ${postsProjection}`;

const POSTS_COUNT_QUERY = groq`count(*[_type == "post" && status == "published" && defined(slug.current)])`;

const LATEST_POSTS_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current)] | order(publishedAt desc)[0...$limit] ${postsProjection}`;

const POSTS_BY_CATEGORY_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current) && references(*[_type == "category" && slug.current == $category]._id)] | order(publishedAt desc) ${postsProjection}`;

const POSTS_BY_CATEGORY_PAGE_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current) && references(*[_type == "category" && slug.current == $category]._id)] | order(publishedAt desc)[$offset...$limit] ${postsProjection}`;

const POSTS_BY_CATEGORY_COUNT_QUERY = groq`count(*[_type == "post" && status == "published" && defined(slug.current) && references(*[_type == "category" && slug.current == $category]._id)])`;

const RELATED_POSTS_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current) && slug.current != $slug && references(*[_type == "category" && slug.current in $categories]._id)] | order(publishedAt desc)[0...$limit] ${postsProjection}`;

const POST_BY_SLUG_QUERY = groq`*[_type == "post" && status == "published" && slug.current == $slug][0] ${postProjection}`;

const POST_SLUGS_QUERY = groq`*[_type == "post" && status == "published" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt
}`;

const CATEGORIES_QUERY = groq`*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description
}`;

const AUTHORS_QUERY = groq`*[_type == "author"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  image,
  bio,
  twitter
}`;

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

export async function getPostsByCategory(
  category: string
): Promise<PostCard[]> {
  return sanityFetch({
    query: POSTS_BY_CATEGORY_QUERY,
    params: { category },
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

export async function getLatestPosts(limit = 3): Promise<PostCard[]> {
  return sanityFetch({
    query: LATEST_POSTS_QUERY,
    params: { limit },
    revalidate: 60,
  });
}

export async function getRelatedPosts(
  slug: string,
  categories: string[],
  limit = 3
): Promise<PostCard[]> {
  if (categories.length === 0) {
    return [];
  }
  return sanityFetch({
    query: RELATED_POSTS_QUERY,
    params: { slug, categories, limit },
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

export async function getAuthors(): Promise<Author[]> {
  return sanityFetch({ query: AUTHORS_QUERY, revalidate: 60 });
}