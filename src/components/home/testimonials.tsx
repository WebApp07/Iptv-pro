import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Switched from cable and never looked back. The 4K quality is stunning and I've had zero freezing during big matches.",
    name: "Marcus T.",
    role: "Sports fan",
    initials: "MT",
  },
  {
    quote:
      "Setup took literally two minutes. Full access to every channel I watch plus a huge movie library. Unbeatable value.",
    name: "Sofia L.",
    role: "Premium subscriber",
    initials: "SL",
  },
  {
    quote:
      "Support team replied on WhatsApp in minutes and helped me configure all my devices. Best IPTV service I've tried.",
    name: "David K.",
    role: "Family plan",
    initials: "DK",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Testimonials
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by thousands of streamers worldwide
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border-border bg-card/60 backdrop-blur transition-colors hover:border-[#ffd166]/40"
            >
              <CardContent className="flex h-full flex-col p-7">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-[#ffd166]/60"
                  aria-hidden="true"
                >
                  <path d="M10 7v6a5 5 0 0 1-5 5v-2a3 3 0 0 0 3-3H4V7h6Zm10 0v6a5 5 0 0 1-5 5v-2a3 3 0 0 0 3-3h-4V7h6Z" />
                </svg>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  {testimonial.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 font-display text-sm font-bold text-[#ffd166]">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}