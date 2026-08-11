import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about IPTV Pro.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        About Us
      </h1>
      <p className="mt-4 text-lg text-muted">
        We bring the world&apos;s television to your screen.
      </p>
    </section>
  );
}