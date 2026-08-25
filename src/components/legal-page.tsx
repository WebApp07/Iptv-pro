import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

interface LegalPageProps {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}

export function LegalPage({
  title,
  description,
  updated,
  children,
}: LegalPageProps) {
  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-muted">{description}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/50">
        Last updated: {updated}
      </p>
      <div className="mt-12 space-y-10 border-t border-border pt-10">
        {children}
      </div>
    </section>
  );
}

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <div className="scroll-mt-24">
      <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </div>
  );
}

/**
 * Marks a value that must be replaced with real business information
 * before publishing.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-[#ffd166]">
      [{children}]
    </strong>
  );
}

export function LegalContactLine() {
  return (
    <p>
      Questions about this policy? Contact us at{" "}
      <a
        href={`mailto:${siteConfig.supportEmail}`}
        className="font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
      >
        {siteConfig.supportEmail}
      </a>{" "}
      or through our{" "}
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#ffd166] transition-colors hover:text-[#f4c255]"
      >
        WhatsApp support
      </a>
      .
    </p>
  );
}
