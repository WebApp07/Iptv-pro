import type { PortableTextBlock } from "@portabletext/types";

export interface SanityImage {
  _type: "image";
  _key?: string;
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface AuthorSummary {
  _id: string;
  name: string;
  slug: string;
  image?: SanityImage;
}

export interface Author extends AuthorSummary {
  bio?: string;
  twitter?: string;
}

export interface PostCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: SanityImage;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  status: "draft" | "published";
  author?: AuthorSummary;
  categories?: Category[];
}

export interface Post extends PostCard {
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  openGraphImage?: SanityImage;
}

export interface PostSlug {
  slug: string;
  publishedAt?: string;
}