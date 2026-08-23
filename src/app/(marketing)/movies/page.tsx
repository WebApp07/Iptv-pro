import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description: "A large on-demand movie library for every taste.",
};

export default function MoviesPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Movies
      </h1>
      <p className="mt-4 text-lg text-muted">
        A huge on-demand library of blockbusters and classics.
      </p>
    </section>
  );
}
