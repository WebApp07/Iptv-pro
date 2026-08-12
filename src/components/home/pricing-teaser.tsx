import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Perfect for casual viewers.",
    features: [
      "5,000+ live channels",
      "2,000+ VOD titles",
      "1 device at a time",
      "HD quality",
    ],
    featured: false,
  },
  {
    name: "Standard",
    price: "$14.99",
    period: "/month",
    description: "Our most popular plan.",
    features: [
      "20,000+ live channels",
      "10,000+ VOD titles",
      "2 devices at a time",
      "4K Ultra HD quality",
      "Anti-freeze technology",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "/month",
    description: "For the ultimate streamer.",
    features: [
      "Everything in Standard",
      "4 devices at a time",
      "Priority support",
      "All sports packages",
      "Early movie releases",
    ],
    featured: false,
  },
];

export function PricingTeaser() {
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
            Simple, affordable plans for every viewer
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            No hidden fees, no contracts. Start with a free trial today.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative border-border bg-card/60",
                plan.featured &&
                  "border-[#ffd166]/60 shadow-[0_0_60px_-20px] shadow-[#ffd166]/40"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ffd166] px-4 py-1 text-xs font-semibold text-black">
                  Most Popular
                </span>
              )}
              <CardContent className="p-8">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>
                <p className="mt-6">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted">{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd166]"
                        aria-hidden="true"
                      >
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
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
                      "bg-[#ffd166] text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 hover:bg-[#f4c255]"
                  )}
                >
                  Choose {plan.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}