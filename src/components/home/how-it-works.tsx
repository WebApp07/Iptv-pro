import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    title: "Choose your plan",
    description:
      "Pick a subscription that fits your budget — cancel anytime, no contracts.",
  },
  {
    number: "02",
    title: "Get instant access",
    description:
      "Receive your login credentials within minutes via email or WhatsApp.",
  },
  {
    number: "03",
    title: "Watch anywhere",
    description:
      "Download our app or open the web player and start streaming in 4K.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge
            variant="outline"
            className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
          >
            How It Works
          </Badge>
          <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Up and streaming in three simple steps
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center md:text-left">
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute left-1/2 top-8 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-[#ffd166]/50 to-[#046bd2]/50 md:left-full md:block" />
              )}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/10 font-display text-xl font-bold text-[#ffd166] md:mx-0">
                {step.number}
              </div>
              <h3 className="font-display mt-6 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}