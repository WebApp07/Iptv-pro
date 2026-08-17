import { Hero } from "@/components/home/hero";
import { PopularChannels } from "@/components/popular-channels";
import { Streaming } from "@/components/home/streaming";
import { Sports } from "@/components/home/sports";
import { GetStarted } from "@/components/get-started";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Pricing } from "@/components/home/pricing";
import { CustomerFeedback } from "@/components/customer-feedback";
import { Faq } from "@/components/faq";
import { Cta } from "@/components/home/cta";
import { LatestFromBlog } from "@/components/home/latest-from-blog";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularChannels />
      <Streaming />
      <Sports />
      <GetStarted />
      <WhyChooseUs />
      <Pricing />
      <CustomerFeedback />
      <Faq />
      <LatestFromBlog />
      <Cta />
    </>
  );
}