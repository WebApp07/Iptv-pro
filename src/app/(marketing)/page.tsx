import { Hero } from "@/components/home/hero";
import { Streaming } from "@/components/home/streaming";
import { Sports } from "@/components/home/sports";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Pricing } from "@/components/home/pricing";
import { CustomerFeedback } from "@/components/customer-feedback";
import { Faq } from "@/components/faq";
import { Cta } from "@/components/home/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Streaming />
      <Sports />
      <HowItWorks />
      <WhyChooseUs />
      <Pricing />
      <CustomerFeedback />
      <Faq />
      <Cta />
    </>
  );
}