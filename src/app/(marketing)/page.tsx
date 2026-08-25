import { Hero } from "@/components/home/hero";
import { PopularChannels } from "@/components/popular-channels";
import { MoviesHomeSections } from "@/components/movies/home-sections";
import { Streaming } from "@/components/home/streaming";
import { Sports } from "@/components/home/sports";
import { LiveSportsToday } from "@/components/home/live-sports-today";
import { GetStarted } from "@/components/get-started";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Pricing } from "@/components/home/pricing";
import { CustomerFeedback } from "@/components/customer-feedback";
import { Faq } from "@/components/faq";
import { Cta } from "@/components/home/cta";
import { LatestFromBlog } from "@/components/home/latest-from-blog";

/**
 * The sports strip revalidates on its own data windows (live 30s); the page
 * itself refreshes hourly so scores never go fully stale in cached HTML.
 */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularChannels />
      <MoviesHomeSections />
      <Streaming />
      <Sports />
      <LiveSportsToday />
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
