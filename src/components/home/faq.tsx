import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "How do I get started?",
    answer:
      "Choose a plan, complete checkout, and we'll send your login credentials instantly by email and WhatsApp. Then just download the app and sign in.",
  },
  {
    question: "What devices are supported?",
    answer:
      "Our service works on Smart TVs (Samsung, LG, Android), Fire Stick, Apple TV, iOS and Android phones, tablets, PCs and Macs. Your subscription covers all of them.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! Request a free 24-hour trial to explore the full channel lineup and VOD library before committing to a plan.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. There are no contracts or cancellation fees. If you stop before the next billing cycle, the subscription simply won't renew.",
  },
  {
    question: "Will the streams freeze during big events?",
    answer:
      "Our anti-freeze technology and redundant servers keep streams stable even during peak traffic, backed by a 100% uptime guarantee.",
  },
];

export function Faq() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            FAQ
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-border bg-card/60 backdrop-blur open:border-[#ffd166]/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold sm:text-base">
                {faq.question}
                <span className="shrink-0 text-[#ffd166] transition-transform group-open:rotate-45">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}