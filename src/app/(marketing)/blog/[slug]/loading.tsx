export default function PostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 lg:px-8">
      <div className="h-4 w-28 animate-pulse rounded bg-border" />
      <div className="mt-6 h-6 w-24 animate-pulse rounded-full bg-border" />
      <div className="mt-4 space-y-3">
        <div className="h-10 w-full animate-pulse rounded bg-card sm:h-14" />
        <div className="h-10 w-4/5 animate-pulse rounded bg-card sm:h-14" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
      </div>
      <div className="mt-6 h-px w-full animate-pulse bg-border" />

      <div className="mt-8 aspect-[16/9] w-full animate-pulse rounded-2xl bg-card" />

      <div className="mt-10 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded bg-border ${
              index % 3 === 0 ? "w-full" : index % 3 === 1 ? "w-11/12" : "w-5/6"
            }`}
          />
        ))}
      </div>
    </div>
  );
}