import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series",
  description: "Binge complete series box sets on demand.",
};

export default function SeriesPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Series
      </h1>
      <p className="mt-4 text-lg text-muted">
        Complete box sets and ongoing seasons, ready when you are.
      </p>
    </section>
  );
}
