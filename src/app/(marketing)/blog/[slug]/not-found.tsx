import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PostNotFound() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-28 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Article not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        This article doesn&apos;t exist, or it has been moved. The blog is the
        best place to find what you&apos;re looking for.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/blog" className={cn(buttonVariants({ size: "lg" }))}>
          Browse the blog
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}