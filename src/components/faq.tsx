"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does the subscription work?",
    answer:
      "Pick a plan, complete checkout, and your login arrives by email and WhatsApp. Then open the app or web player on any supported device, sign in, and start watching.",
  },
  {
    question: "Which devices can I watch on?",
    answer:
      "Smart TVs from Samsung and LG, Android TV boxes, Fire Stick, Apple TV, phones, tablets and computers. One subscription covers all of them, so you can switch screens whenever you like.",
  },
  {
    question: "How long does activation take?",
    answer:
      "Most accounts are ready within minutes. Once your payment clears, the login details land in your WhatsApp or email and work right away.",
  },
  {
    question: "How long can I subscribe for?",
    answer:
      "Plans run from one month up to twelve months, on one or two devices. Longer terms cost less per month, and there are no contracts, so you can stop whenever you like.",
  },
  {
    question: "What streaming quality should I expect?",
    answer:
      "Channels stream in HD, with 4K where the source and your screen support it. The quality you get also depends on your internet connection.",
  },
  {
    question: "What internet speed do I need?",
    answer:
      "A stable connection of around 15-25 Mbps is usually enough for smooth HD streaming. 4K needs a bit more. If a live match keeps stuttering, a wired connection helps.",
  },
  {
    question: "Do you help with setup?",
    answer:
      "Yes. Message us on WhatsApp and we'll walk you through any device, step by step. Most setups are sorted in a few minutes.",
  },
  {
    question: "What about support after I subscribe?",
    answer:
      "Support is available around the clock by WhatsApp and email. Most questions get a reply within minutes.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            Related questions
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Questions People Ask
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Straight answers to the things people want to know before they
            subscribe.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className={cn(
                  "rounded-xl border border-border bg-card/60 backdrop-blur transition-colors",
                  open && "border-[#ffd166]/40"
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-button-${index}`}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold sm:text-base"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={cn(
                        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ffd166]/30 bg-[#ffd166]/10 transition-colors",
                        open && "border-[#ffd166]/60 bg-[#ffd166]/15"
                      )}
                      aria-hidden="true"
                    >
                      <span className="absolute h-px w-3.5 bg-[#ffd166]" />
                      <span
                        className={cn(
                          "absolute h-3.5 w-px bg-[#ffd166] transition-transform duration-300 ease-out",
                          open && "rotate-90"
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  aria-hidden={!open}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}