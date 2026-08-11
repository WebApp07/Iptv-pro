import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-6xl font-bold tracking-tight text-primary">
        404
      </h1>
      <p className="mt-4 text-lg text-muted">
        Oops — this channel doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </section>
  );
}