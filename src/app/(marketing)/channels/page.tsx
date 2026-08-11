import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Channels",
  description: "Browse our full channel lineup.",
};

export default function ChannelsPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Channels
      </h1>
      <p className="mt-4 text-lg text-muted">
        20,000+ live channels from around the world.
      </p>
    </section>
  );
}