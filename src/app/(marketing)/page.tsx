import { Hero } from "@/components/home/hero";
import { Streaming } from "@/components/home/streaming";
import { Sports } from "@/components/home/sports";
import { Channels } from "@/components/home/channels";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Streaming />
      <Sports />
      <Channels />
      <Features />
      <HowItWorks />
      <PricingTeaser />
      <Testimonials />
      <Faq />
      <Cta />
    </>
  );
}