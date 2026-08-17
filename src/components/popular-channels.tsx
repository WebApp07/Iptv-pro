"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";

type Channel = {
  name: string;
  tag: string;
  logo: string;
  width: number;
  height: number;
};

const channels: Channel[] = [
  { name: "beIN Sports", tag: "Football", logo: "/images/channels/bein-sports.webp", width: 150, height: 46 },
  { name: "Nova", tag: "Entertainment", logo: "/images/channels/nova.svg", width: 220, height: 64 },
  { name: "Sky", tag: "Movies & series", logo: "/images/channels/sky.svg", width: 220, height: 64 },
  { name: "Canal+", tag: "Movies", logo: "/images/channels/canalplus.svg", width: 220, height: 64 },
  { name: "Eurosport", tag: "All sports", logo: "/images/channels/eurosport.svg", width: 220, height: 64 },
  { name: "DAZN", tag: "Live sport", logo: "/images/channels/dazn.svg", width: 220, height: 64 },
  { name: "Movistar+", tag: "Series", logo: "/images/channels/movistar.svg", width: 220, height: 64 },
  { name: "TNT Sports", tag: "Football", logo: "/images/channels/tnt-sports.svg", width: 220, height: 64 },
];

const SPEED = 0.6;
const CARD_GAP = 20;

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <div className="group flex w-48 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd166]/40 sm:w-56">
      <Image
        src={channel.logo}
        alt={`${channel.name} logo`}
        width={channel.width}
        height={channel.height}
        className="h-auto w-36 transition-transform duration-300 group-hover:scale-105 sm:w-40"
      />
      <div className="text-center">
        <p className="font-display text-sm font-semibold tracking-tight">
          {channel.name}
        </p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
          {channel.tag}
        </p>
      </div>
    </div>
  );
}

export function PopularChannels() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        const half = track.scrollWidth / 2;
        xRef.current -= SPEED;
        if (xRef.current <= -half) xRef.current += half;
        track.style.transform = `translateX(${xRef.current}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const shift = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);

    const cardWidth = (window.innerWidth < 640 ? 192 : 224) + CARD_GAP;
    const half = track.scrollWidth / 2;
    xRef.current += direction * cardWidth;
    if (xRef.current > 0) xRef.current -= half;
    if (xRef.current <= -half) xRef.current += half;
    track.style.transform = `translateX(${xRef.current}px)`;

    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Popular channels
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            The channels people ask about most
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Sport, movies, series, kids&apos; shows. The networks our customers
            actually ask for, ready to stream on any screen.
          </p>
        </div>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-background to-transparent sm:w-24" />

        <button
          type="button"
          aria-label="Previous channels"
          onClick={() => shift(1)}
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-[#ffd166] hover:text-black sm:left-6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Next channels"
          onClick={() => shift(-1)}
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 backdrop-blur transition-colors hover:bg-[#ffd166] hover:text-black sm:right-6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          ref={viewportRef}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          className="overflow-hidden"
        >
          <div ref={trackRef} className="flex w-max gap-5 pr-5 will-change-transform">
            {channels.map((channel) => (
              <ChannelCard key={channel.name} channel={channel} />
            ))}
            <div aria-hidden="true" className="flex shrink-0 gap-5">
              {channels.map((channel) => (
                <ChannelCard key={`dup-${channel.name}`} channel={channel} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}