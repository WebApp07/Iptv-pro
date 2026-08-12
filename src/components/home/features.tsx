import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "4K Ultra HD",
    description:
      "Crystal-clear picture quality with vivid colors and sharp detail on every channel.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8Z" />
        <path d="m7 10 3 2-3 2M13 14h3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "20,000+ Live Channels",
    description:
      "Sports, news, entertainment and more from every corner of the world.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7a5 5 0 0 1 5 5M12 7a5 5 0 0 0-5 5M12 7v10M8 10h8M8 14h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Massive VOD Library",
    description:
      "10,000+ movies and series on demand, updated daily with the latest releases.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M10 9.5v5l4-2.5-4-2.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Watch on Any Device",
    description:
      "Smart TVs, phones, tablets and computers — your subscription follows you everywhere.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Anti-Freeze Technology",
    description:
      "Reliable streams with 100% uptime, so you never miss a moment of the action.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description:
      "Our friendly team is here around the clock to help you with anything you need.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6" aria-hidden="true">
        <path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10Z" />
        <path d="M10.5 9.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" strokeLinecap="round" />
        <circle cx="12" cy="15" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-[#046bd2]/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Why IPTV Pro
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for a premium streaming experience
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Built for speed, quality and reliability — so you can just sit back
            and watch.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border bg-card/60 backdrop-blur transition-colors hover:border-[#ffd166]/40"
            >
              <CardContent className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffd166]/30 bg-[#ffd166]/10 text-[#ffd166]">
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