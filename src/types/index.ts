export interface Channel {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  streamUrl: string;
  isPremium: boolean;
  isLive?: boolean;
}

export interface VODContent {
  id: string;
  title: string;
  type: "movie" | "series";
  posterUrl?: string;
  duration?: number;
  rating?: number;
  year?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billing: "monthly" | "quarterly" | "yearly";
  features: string[];
  isPopular?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  planId?: string;
  createdAt: string;
}