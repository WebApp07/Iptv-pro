import Image from "next/image";

const posters = [
  { image: "/images/posters/poster-1.webp", alt: "Netflix poster" },
  { image: "/images/posters/poster-2.webp", alt: "Disney+ poster" },
  { image: "/images/posters/poster-3.webp", alt: "Apple TV+ poster" },
  { image: "/images/posters/poster-4.webp", alt: "Prime Video poster" },
  { image: "/images/posters/poster-5.webp", alt: "HBO Max poster" },
  { image: "/images/posters/poster-6.webp", alt: "Hulu poster" },
];

export function Streaming() {
  const doubled = [...posters, ...posters];

  return (
    <section className="relative overflow-hidden bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stream All of Your Favorite{" "}
            <span className="text-[#ffd166]">Movies &amp; TV Shows</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60">
            Netflix, Disney+, Prime Video, HBO Max, Hulu and more — unified in a
            single premium experience.
          </p>
        </div>
      </div>

      <div className="relative mt-16 overflow-hidden sm:mt-20">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent sm:w-28" />

        <div className="flex w-max animate-[hero-marquee_55s_linear_infinite] gap-6 pr-6">
          {doubled.map((poster, index) => (
            <figure
              key={`${poster.alt}-${index}`}
              className="group relative aspect-[2/3] w-52 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl sm:w-64 lg:w-72"
            >
              <Image
                src={poster.image}
                alt={poster.alt}
                fill
                sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 208px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}