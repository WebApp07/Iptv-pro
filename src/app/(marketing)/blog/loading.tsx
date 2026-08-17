export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
      <div className="h-4 w-16 animate-pulse rounded bg-border" />
      <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-card sm:h-14 sm:w-1/2" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-border" />
      <div className="mt-8 h-8 w-40 animate-pulse rounded-full bg-card" />

      <div className="mt-12 grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
        <div className="aspect-[16/10] animate-pulse bg-card lg:aspect-auto" />
        <div className="space-y-4 p-8">
          <div className="h-6 w-28 animate-pulse rounded-full bg-border" />
          <div className="h-8 w-4/5 animate-pulse rounded bg-border" />
          <div className="h-4 w-full animate-pulse rounded bg-border" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
          <div className="h-4 w-40 animate-pulse rounded bg-border" />
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-[16/9] animate-pulse bg-card" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-24 animate-pulse rounded-full bg-border" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-border" />
              <div className="h-4 w-full animate-pulse rounded bg-border" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}