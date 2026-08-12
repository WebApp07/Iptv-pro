import Image from "next/image";

const leagues = [
  { image: "/images/leagues/ten.webp", alt: "UEFA Champions League" },
  { image: "/images/leagues/premier.webp", alt: "Premier League" },
  { image: "/images/leagues/laliga.webp", alt: "LaLiga" },
  { image: "/images/leagues/bundesliga.webp", alt: "Bundesliga" },
  { image: "/images/leagues/melbourne.webp", alt: "Melbourne Grand Prix" },
  { image: "/images/leagues/nba.webp", alt: "NBA" },
  { image: "/images/leagues/ezgif.webp", alt: "Football" },
];

export function Sports() {
  const doubled = [...leagues, ...leagues];

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading mx-auto max-w-3xl text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Never Miss a Single Match
        </h2>
      </div>

      <div className="relative mt-16 overflow-hidden sm:mt-20">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />

        <div className="flex w-max animate-[hero-marquee_55s_linear_infinite] gap-6 pr-6">
          {doubled.map((league, index) => (
            <figure
              key={`${league.alt}-${index}`}
              className="group relative aspect-[410/586] w-[60vw] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl sm:w-[36vw] md:w-[28vw] lg:w-[22vw] xl:w-[384px]"
            >
              <Image
                src={league.image}
                alt={league.alt}
                fill
                sizes="(min-width: 1280px) 384px, (min-width: 1024px) 22vw, (min-width: 640px) 36vw, 60vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
