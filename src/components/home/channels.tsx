import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const marqueeChannels = [
  "Sky Sports",
  "ESPN",
  "HBO",
  "BBC One",
  "CNN",
  "Discovery",
  "National Geographic",
  "Cartoon Network",
  "MTV",
  "Eurosport",
  "FX",
  "Paramount",
  "Disney",
  "Netflix",
  "Fox News",
  "TNT Sports",
];

const categories = [
  { label: "Sports", count: "3,000+", className: "text-[#ffd166]" },
  { label: "Movies", count: "2,500+", className: "text-[#046bd2]" },
  { label: "Kids", count: "1,200+", className: "text-[#22d3ee]" },
  { label: "News", count: "1,800+", className: "text-[#f4c255]" },
  { label: "Music", count: "1,000+", className: "text-[#a78bfa]" },
  { label: "Documentaries", count: "900+", className: "text-[#34d399]" },
];

export function Channels() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Channel Lineup
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Channels from around the globe, all in one place
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            From live sports to the latest blockbusters, watch premium channels
            the moment they air.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-[hero-marquee_40s_linear_infinite] gap-4 pr-4">
            {[...marqueeChannels, ...marqueeChannels].map((channel, index) => (
              <span
                key={`${channel}-${index}`}
                className="whitespace-nowrap rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <div
              key={category.label}
              className="group rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-[#ffd166]/40"
            >
              <p
                className={cn(
                  "font-display text-2xl font-bold tracking-tight",
                  category.className
                )}
              >
                {category.count}
              </p>
              <p className="mt-1 text-sm text-muted">{category.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}