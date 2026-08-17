import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  "24,000+ live channels",
  "Anti-freeze technology",
  "4K Ultra HD support",
  "EPG TV guide",
  "Fast activation",
  "24/7 support",
  "No contracts, cancel anytime",
];

const plans = [
  {
    name: "1 Device",
    description: "Watch on one screen at a time.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    prices: [
      { duration: "1 month", price: "€14.99" },
      { duration: "3 months", price: "€38.99" },
      { duration: "6 months", price: "€68.99" },
      { duration: "12 months", price: "€87.99", bestValue: true },
    ],
    features,
  },
  {
    name: "2 Devices",
    description: "Watch on two screens at once.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="11" height="14" rx="2" />
        <rect x="14" y="9" width="8" height="10" rx="1.5" />
      </svg>
    ),
    prices: [
      { duration: "1 month", price: "€25.99" },
      { duration: "3 months", price: "€69.99" },
      { duration: "6 months", price: "€128.99" },
      { duration: "12 months", price: "€168.99", bestValue: true },
    ],
    features,
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-64 max-w-3xl rounded-full bg-[#ffd166]/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Pricing
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Flexible programs that fit your needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Pick the number of devices you need, choose a duration that fits
            your budget, and pay a price that makes sense. Every plan includes
            the full Greek channel lineup with HD and 4K on supported channels.
            No contracts, no surprise renewals.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "group relative border-border bg-card/60 transition-all duration-300 hover:-translate-y-1",
                plan.featured
                  ? "border-[#ffd166]/60 shadow-[0_0_60px_-20px] shadow-[#ffd166]/40"
                  : "hover:border-[#ffd166]/40",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#ffd166] px-4 py-1 text-xs font-semibold text-black">
                  Most Popular
                </span>
              )}
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166] transition-transform duration-300 group-hover:scale-110">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Choose your duration
                </p>
                <ul className="mt-3 space-y-2">
                  {plan.prices.map((option) => (
                    <li
                      key={option.duration}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                        option.bestValue
                          ? "border-[#ffd166]/40 bg-[#ffd166]/5"
                          : "border-border bg-card/60 hover:border-[#ffd166]/40 hover:bg-[#ffd166]/5",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {option.duration}
                        {option.bestValue && (
                          <span className="rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ffd166]">
                            Best value
                          </span>
                        )}
                      </span>
                      <span className="font-display text-base font-bold">
                        {option.price}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Every plan includes
                </p>
                <ul className="mt-3 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd166]"
                        aria-hidden="true"
                      >
                        <path
                          d="m5 13 4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({
                      variant: plan.featured ? "default" : "outline",
                      size: "lg",
                    }),
                    "mt-8 w-full",
                    plan.featured &&
                      "bg-[#ffd166] text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 hover:bg-[#f4c255]",
                  )}
                >
                  Choose {plan.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted">
          Watching on more than two screens?{" "}
          <a
            href="https://wa.me/+100000000"
            className="text-[#ffd166] transition-colors hover:text-[#f4c255]"
          >
            Message us on WhatsApp
          </a>{" "}
          and we&apos;ll put together a custom plan.
        </p>
      </div>
    </section>
  );
}
