"use client";

import { Button } from "@/components/ui/button";

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Something went wrong</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        We couldn&apos;t load the articles
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The blog is having trouble reaching the content service. This is
        usually temporary, so try again in a moment.
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </section>
  );
}