import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live TV",
  description: "Watch live TV channels from around the world.",
};

export default function LiveTvPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Live TV
      </h1>
      <p className="mt-4 text-lg text-muted">
        Thousands of live channels, streaming around the clock.
      </p>
    </section>
  );
}
