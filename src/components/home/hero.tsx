import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative min-h-[900px] overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-4 pt-32 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:gap-24 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="font-heading max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-[55px]">
            Fast &amp; Reliable IPTV Service at an Affordable Price
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Experience breathtaking 4K visuals on any device, at any place, at
            any time. Discover an expansive library with over 20,000 channels
            and more than 10,000 VOD options, all backed by a reliable 100%
            uptime guarantee.
          </p>

          <Link
            href="#pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-10 bg-[#ffd166] px-8 font-btn text-base font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-black hover:text-white"
            )}
          >
            Buy Subscription
            <svg
              viewBox="0 0 640 512"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48Zm-16 352H64V64h512v288Z" />
            </svg>
          </Link>

          <Image
            src="/images/devices-4.webp"
            alt="Stream on all your devices"
            width={366}
            height={63}
            className="mt-16 h-auto w-full max-w-md drop-shadow-2xl"
          />
        </div>

        <div className="flex flex-col items-center justify-center text-center lg:items-start lg:justify-center">
          <h2 className="font-heading text-3xl font-medium text-white">
            Request Free Trial
          </h2>
          <a
            href="https://wa.me/+100000000"
            className="group mt-5 flex flex-col items-center gap-4 text-[#ffd166] transition-colors hover:text-[#f4c255]"
          >
            <svg
              viewBox="0 0 512 512"
              className="h-32 w-32"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8Zm115.7 272-176 101c-15.8 8.8-35.7-2.5-35.7-21V152c0-18.5 19.9-29.8 35.7-21l176 107c16.4 9.8 16.4 32.2 0 42Z" />
            </svg>
            <span className="font-heading text-2xl font-semibold text-white underline-offset-4 group-hover:underline">
              Contact Us
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}