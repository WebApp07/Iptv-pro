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

export interface FaqItem {
  _type: "faqItem";
  _key?: string;
  question: string;
  answer: string;
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
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  openGraphImage?: SanityImage;
  tags?: string[];
  faq?: FaqItem[];
  relatedPosts?: PostCard[];
}

export interface PostSlug {
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface CategoryDetail extends Category {
  seoTitle?: string;
  seoDescription?: string;
  image?: SanityImage;
}

export interface CategorySlug {
  slug: string;
}

export interface RssPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
}
