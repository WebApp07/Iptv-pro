import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Cta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#046bd2]/25 blur-[120px] animate-[hero-orb_16s_ease-in-out_infinite]" />
        <div className="absolute right-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#ffd166]/20 blur-[120px] animate-[hero-orb_20s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Ready to watch your favorite shows in{" "}
          <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
            4K Ultra HD?
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted">
          Join thousands of happy subscribers today. Try it free for 24 hours —
          no credit card required.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#ffd166] text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 hover:bg-[#f4c255]"
            )}
          >
            Buy Subscription
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10"
            )}
          >
            Request Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}