"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "billing", label: "Billing & subscription" },
  { value: "trial", label: "Free trial request" },
  { value: "technical", label: "Technical & setup help" },
  { value: "movies", label: "Movies & series" },
  { value: "sports", label: "Sports & live events" },
  { value: "other", label: "Something else" },
] as const;

const INITIAL_FORM = {
  name: "",
  topic: "general",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [messageError, setMessageError] = useState<string | undefined>();

  function update(field: keyof typeof INITIAL_FORM, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (field === "message") setMessageError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const honeypot = new FormData(event.currentTarget).get("website");
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      return;
    }

    const message = form.message.trim();
    if (message.length < 10) {
      setMessageError(
        "Please describe your question in at least a few words.",
      );
      return;
    }

    const topic = TOPICS.find((option) => option.value === form.topic);
    const lines = [
      "Hello TV96, I need some help.",
      form.name.trim() ? `Name: ${form.name.trim()}` : null,
      topic && topic.value !== "general" ? `Topic: ${topic.label}` : null,
      "",
      message,
    ].filter((line) => line !== null);

    window.open(
      `${siteConfig.whatsappUrl}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const inputClassName = (invalid: boolean) =>
    cn(
      "h-11 w-full rounded-md border bg-background/60 px-3.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-[#ffd166]/60 focus:outline-none focus:ring-2 focus:ring-[#ffd166]/25",
      invalid ? "border-red-500/70" : "border-border",
    );

  const labelClassName =
    "block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className={labelClassName}>
          Name{" "}
          <span className="normal-case tracking-normal text-white/40">
            (optional)
          </span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          className={cn(inputClassName(false), "mt-1.5")}
        />
      </div>

      <div>
        <label htmlFor="contact-topic" className={labelClassName}>
          Topic
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={form.topic}
          onChange={(event) => update("topic", event.target.value)}
          className={cn(inputClassName(false), "mt-1.5")}
        >
          {TOPICS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClassName}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us what you need help with..."
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(messageError)}
          aria-describedby={
            messageError ? "contact-message-error" : "contact-message-hint"
          }
          className={cn(
            "mt-1.5 w-full rounded-md border bg-background/60 px-3.5 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-[#ffd166]/60 focus:outline-none focus:ring-2 focus:ring-[#ffd166]/25",
            messageError ? "border-red-500/70" : "border-border",
          )}
        />
        {messageError ? (
          <p
            id="contact-message-error"
            role="alert"
            className="mt-1.5 text-xs text-red-400"
          >
            {messageError}
          </p>
        ) : (
          <p
            id="contact-message-hint"
            className="mt-1.5 text-xs text-muted"
          >
            Submitting opens WhatsApp with your message ready to send. No
            personal data leaves your browser.
          </p>
        )}
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
      >
        Send via WhatsApp
      </Button>
    </form>
  );
}