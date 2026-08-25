import type { Metadata } from "next";
import { Pricing } from "@/components/home/pricing";

export const metadata: Metadata = {
  title: "Pricing | IPTV Pro Plans",
  description:
    "Flexible IPTV plans for every viewer - 1 or 2 devices, from 1 to 12 months. Full channel lineup in HD/4K, no contracts, cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <Pricing />;
}