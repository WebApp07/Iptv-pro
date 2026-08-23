import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/sanity/lib/types";

export function PostFaq({
  faqs,
  jsonLd,
}: {
  faqs: FaqItem[];
  jsonLd?: object;
}) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-section-heading" className="mt-16">
      <Badge
        variant="outline"
        className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
      >
        FAQ
      </Badge>
      <h2
        id="faq-section-heading"
        className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Frequently asked questions
      </h2>

      <div className="mt-8 space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={faq._key ?? index}
            className={cn(
              "group rounded-xl border border-border bg-card/60 transition-colors",
              "open:border-[#ffd166]/40"
            )}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
              <h3 className="text-sm font-semibold sm:text-base">
                {faq.question}
              </h3>
              <span
                className={cn(
                  "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 transition-colors",
                  "group-open:border-[#ffd166]/60 group-open:bg-[#ffd166]/15"
                )}
                aria-hidden="true"
              >
                <span className="absolute h-px w-3.5 bg-[#ffd166]" />
                <span className="absolute h-3.5 w-px bg-[#ffd166] transition-transform duration-300 ease-out group-open:rotate-90" />
              </span>
            </summary>
            <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </section>
  );
}
