"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FREE_TRIAL_COUNTRIES,
  FREE_TRIAL_DEFAULT_COUNTRY,
  findFreeTrialCountry,
  normalizeWhatsAppNumber,
  validateFreeTrialInput,
  type FreeTrialFieldErrors,
} from "@/lib/free-trial";

const BENEFITS = [
  "Instant activation",
  "20,000+ channels",
  "Movies & Series",
  "All live sports",
  "24-hour access",
  "No commitment",
] as const;

type Status = "idle" | "submitting" | "success" | "error";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  whatsappCountry: FREE_TRIAL_DEFAULT_COUNTRY,
  whatsappNumber: "",
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd166]"
      aria-hidden="true"
    >
      <path
        d="m5 13 4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FreeTrialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FreeTrialFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const succeededRef = useRef(false);

  const titleId = useId();
  const subtitleId = useId();
  const supportingId = useId();

  const selectedCountry = findFreeTrialCountry(form.whatsappCountry);

  const handleClose = useCallback(() => {
    if (status === "submitting") return;
    onClose();
  }, [onClose, status]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open && status === "success") {
      doneButtonRef.current?.focus();
    }
  }, [open, status]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, handleClose]);

  useEffect(() => {
    if (open || !succeededRef.current) return;

    succeededRef.current = false;
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setServerError(false);
    setStatus("idle");
  }, [open]);

  function update(field: keyof typeof INITIAL_FORM, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFieldErrors(
      (previous) => ({ ...previous, [field]: undefined }) as FreeTrialFieldErrors,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || status === "success") return;

    const honeypot = new FormData(event.currentTarget).get("website");
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      setStatus("success");
      return;
    }

    const errors = validateFreeTrialInput(form);
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      const firstInvalid = (
        ["firstName", "lastName", "email", "whatsappNumber"] as const
      ).find((field) => errors[field]);
      if (firstInvalid) {
        panelRef.current
          ?.querySelector<HTMLInputElement>(`#free-trial-${firstInvalid}`)
          ?.focus();
      }
      return;
    }

    setStatus("submitting");
    setServerError(false);

    try {
      const response = await fetch("/api/free-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          whatsappCountry: form.whatsappCountry,
          whatsappNumber: normalizeWhatsAppNumber(
            form.whatsappNumber,
            selectedCountry.dial,
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      succeededRef.current = true;
      setStatus("success");
    } catch {
      setServerError(true);
      setStatus("error");
    }
  }

  if (!open) return null;

  const inputClassName = (invalid: boolean) =>
    cn(
      "h-11 w-full rounded-md border bg-background/60 px-3.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-[#ffd166]/60 focus:outline-none focus:ring-2 focus:ring-[#ffd166]/25",
      invalid ? "border-red-500/70" : "border-border",
    );

  const labelClassName =
    "block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/75 backdrop-blur-sm sm:items-center sm:p-6 animate-[modal-overlay-in_0.2s_ease-out_both]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={supportingId}
        className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] animate-[modal-panel-in_0.28s_cubic-bezier(0.16,1,0.3,1)_both]"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd166]/60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4.5 w-4.5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#ffd166]/40 bg-[#ffd166]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-[#ffd166]"
                aria-hidden="true"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
            </div>
            <h2
              id={titleId}
              className="font-display mt-6 text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Your Free Trial Is Ready!
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Check your email for your IPTV login details. You can start
              enjoying your trial right away.
            </p>
            <Button
              ref={doneButtonRef}
              onClick={handleClose}
              size="lg"
              className="mt-8 w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="text-center">
              <Badge
                variant="outline"
                className="border-[#ffd166]/40 bg-[#ffd166]/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]"
              >
                Free Trial
              </Badge>
              <h2
                id={titleId}
                className="font-display mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
              >
                Start Your{" "}
                <span className="bg-gradient-to-r from-[#ffd166] via-[#f4c255] to-[#ffb547] bg-clip-text text-transparent">
                  24-Hour Free Trial
                </span>
              </h2>
              <p
                id={subtitleId}
                className="mt-2 text-sm font-semibold text-[#ffd166]"
              >
                No credit card required
              </p>
              <p
                id={supportingId}
                className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted"
              >
                Get instant access to your IPTV trial and explore the
                experience for yourself.
              </p>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-border bg-background/40 p-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-foreground/85"
                >
                  <CheckIcon />
                  {benefit}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="free-trial-firstName"
                    className={labelClassName}
                  >
                    First Name
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="free-trial-firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={(event) =>
                      update("firstName", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    aria-describedby={
                      fieldErrors.firstName
                        ? "free-trial-firstName-error"
                        : undefined
                    }
                    className={cn(
                      inputClassName(Boolean(fieldErrors.firstName)),
                      "mt-1.5",
                    )}
                  />
                  {fieldErrors.firstName ? (
                    <p
                      id="free-trial-firstName-error"
                      role="alert"
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {fieldErrors.firstName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="free-trial-lastName" className={labelClassName}>
                    Last Name
                  </label>
                  <input
                    id="free-trial-lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    aria-describedby={
                      fieldErrors.lastName
                        ? "free-trial-lastName-error"
                        : undefined
                    }
                    className={cn(
                      inputClassName(Boolean(fieldErrors.lastName)),
                      "mt-1.5",
                    )}
                  />
                  {fieldErrors.lastName ? (
                    <p
                      id="free-trial-lastName-error"
                      role="alert"
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {fieldErrors.lastName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="free-trial-email" className={labelClassName}>
                  Email
                </label>
                <input
                  id="free-trial-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "free-trial-email-error" : undefined
                  }
                  className={cn(
                    inputClassName(Boolean(fieldErrors.email)),
                    "mt-1.5",
                  )}
                />
                {fieldErrors.email ? (
                  <p
                    id="free-trial-email-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-400"
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="free-trial-whatsappNumber" className={labelClassName}>
                  WhatsApp Number
                </label>
                <div className="mt-1.5 flex gap-2">
                  <select
                    aria-label="Country code"
                    value={form.whatsappCountry}
                    onChange={(event) =>
                      update("whatsappCountry", event.target.value)
                    }
                    className="h-11 min-w-0 shrink basis-2/5 rounded-md border border-border bg-background/60 px-2 text-sm text-foreground transition-colors focus:border-[#ffd166]/60 focus:outline-none focus:ring-2 focus:ring-[#ffd166]/25 sm:basis-auto sm:max-w-[190px]"
                  >
                    {FREE_TRIAL_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.dial})
                      </option>
                    ))}
                  </select>
                  <input
                    id="free-trial-whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={`${selectedCountry.dial} 4XX XX XX XX`}
                    value={form.whatsappNumber}
                    onChange={(event) =>
                      update("whatsappNumber", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.whatsappNumber)}
                    aria-describedby="free-trial-whatsappNumber-hint free-trial-whatsappNumber-error"
                    className={inputClassName(Boolean(fieldErrors.whatsappNumber))}
                  />
                </div>
                <p
                  id="free-trial-whatsappNumber-hint"
                  className="mt-1.5 text-xs text-muted"
                >
                  We&apos;ll only contact you on WhatsApp regarding your free
                  trial.
                </p>
                {fieldErrors.whatsappNumber ? (
                  <p
                    id="free-trial-whatsappNumber-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-400"
                  >
                    {fieldErrors.whatsappNumber}
                  </p>
                ) : null}
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="free-trial-website">Website</label>
                <input
                  id="free-trial-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {serverError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  Something went wrong. Please try again.
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="w-full bg-[#ffd166] font-btn font-semibold text-black shadow-[0_12px_48px_-12px] shadow-[#ffd166]/60 transition-colors hover:bg-[#f4c255]"
              >
                {status === "submitting" ? (
                  <>
                    <SpinnerIcon />
                    Submitting...
                  </>
                ) : (
                  "Start My 24-Hour Free Trial"
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
