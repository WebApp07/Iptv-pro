import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Choose Your Plan",
    description:
      "Pick how many devices you need and how long you want to watch. The whole thing takes a couple of minutes.",
  },
  {
    number: "02",
    title: "Get Your Credentials",
    description:
      "Pay for your plan and the login details land in your email and WhatsApp, ready to use straight away.",
  },
  {
    number: "03",
    title: "Start Watching",
    description:
      "Install the app on your TV, phone, tablet or laptop, enter your credentials, and start streaming on any supported screen.",
  },
];

export function GetStarted() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Get Started
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            How to Start Streaming Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Three simple steps to get started.
          </p>
        </div>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative flex flex-col items-center text-center animate-[hero-fade-in_0.7s_ease-out_both]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute left-1/2 top-8 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-[#ffd166]/50 to-[#046bd2]/50 md:left-full md:block" />
              )}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/10 font-display text-xl font-bold text-[#ffd166] transition-transform duration-300 group-hover:scale-110 group-hover:border-[#ffd166]/60">
                {step.number}
              </div>
              <h3 className="font-display mt-6 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/free-trial"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#ffd166] text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            )}
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}