import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Your channels, front and center",
    description:
      "The live channels you actually watch, plus the international sports and entertainment you follow. Your lineup, not a list of channels you'll never open.",
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
  },
  {
    title: "Streaming you can count on",
    description:
      "Live matches are what break most IPTV services. We keep dedicated servers for sport so the picture holds steady when the game is on.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Crisp HD and 4K",
    description:
      "Full HD on everyday channels, 4K on big matches and new releases. The kind of picture that looks good on a large TV, not just a phone.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="m12 9 .9 2.1 2.1.9-2.1.9L12 15l-.9-2.1L9 12l2.1-.9L12 9Z" />
      </svg>
    ),
  },
  {
    title: "Watch on any screen",
    description:
      "Smart TV, phone, tablet or laptop, all under one subscription. Start on one device, pick up on another without extra setup.",
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
  },
  {
    title: "A subscription that stays simple",
    description:
      "Signing up takes a couple of clicks. Your login arrives on WhatsApp within minutes, with no contracts and no surprise renewals.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="m9 15 1.5 1.5L14 13" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Support that answers",
    description:
      "Setup help over WhatsApp and email, in your language. When you're stuck, a real person replies.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
        <rect x="2" y="14" width="5" height="6" rx="2" />
        <rect x="17" y="14" width="5" height="6" rx="2" />
        <path d="M20 20a4 4 0 0 1-4 3h-2" />
      </svg>
    ),
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Why IPTV Pro
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Why choose us?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Choosing an IPTV provider comes down to two things: whether the
            channels you actually watch work, and whether you get help when
            they don&apos;t. We built the service around both.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border bg-card transition-colors hover:border-[#ffd166]/40"
            >
              <CardContent className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166] transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}