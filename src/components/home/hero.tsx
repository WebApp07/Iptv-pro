import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FreeTrialButton } from "@/components/free-trial/free-trial-button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

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

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-4 pb-32 pt-32 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-20 lg:px-8 lg:pb-40 lg:pt-40">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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

        <div className="flex justify-center lg:justify-end">
          <aside className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.06] p-8 shadow-[0_24px_60px_-20px] shadow-black/60 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffd166] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ffd166]" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
                Service online
              </span>
            </div>

            <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-xl border border-[#25d366]/40 bg-[#25d366]/15 text-[#25d366]">
              <WhatsAppIcon className="h-6 w-6" />
            </div>

            <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight text-white">
              Free Trial Available
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Message us on WhatsApp and we&apos;ll set up your free trial. No
              card required, and we&apos;ll send the login details over as soon
              as it&apos;s ready.
            </p>

            <Link
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-7 w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/50 transition-colors hover:bg-[#f4c255]",
              )}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Request Free Trial
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
