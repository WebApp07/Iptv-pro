import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FreeTrialButton } from "@/components/free-trial/free-trial-button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative min-h-[900px] overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
      <div className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-[#ffd166]/[0.08] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ffd166]/[0.06] blur-[160px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-32 pt-32 text-center sm:px-6 lg:px-8 lg:pb-40 lg:pt-40">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-heading mt-7 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-[56px]">
            Your Channels, Movies &amp; Sports
            <span className="block bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
              on Every Screen You Own
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Live channels from all over the world, the sport you follow and a
            big movie library, under one subscription. No contracts, and your
            login arrives within minutes on WhatsApp.
          </p>

          <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full bg-[#ffd166] px-8 font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255] sm:w-auto",
              )}
            >
              View Plans
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <FreeTrialButton
              variant="outline"
              size="lg"
              className="w-full border-white/25 bg-white/10 font-btn font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 sm:w-auto"
            >
              Free Trial
            </FreeTrialButton>
          </div>

          <Image
            src="/images/devices-4.webp"
            alt="Stream on all your devices"
            width={366}
            height={63}
            className="mt-14 h-auto w-full max-w-md drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
