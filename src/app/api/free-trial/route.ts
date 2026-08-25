import { NextResponse } from "next/server";
import {
  findFreeTrialCountry,
  normalizeWhatsAppNumber,
  validateFreeTrialInput,
} from "@/lib/free-trial";

export const revalidate = 0;

const GENERIC_ERROR = { ok: false as const };

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(GENERIC_ERROR, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (typeof data.website === "string" && data.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const input = {
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    email: String(data.email ?? ""),
    whatsappCountry: String(data.whatsappCountry ?? ""),
    whatsappNumber: String(data.whatsappNumber ?? ""),
  };

  const errors = validateFreeTrialInput(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const webhookUrl = process.env.FREE_TRIAL_WEBHOOK_URL;
  if (webhookUrl) {
    const country = findFreeTrialCountry(input.whatsappCountry);
    const national = normalizeWhatsAppNumber(
      input.whatsappNumber,
      country.dial,
    );

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim(),
          whatsapp: `${country.dial}${national}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return NextResponse.json(GENERIC_ERROR, { status: 502 });
      }
    } catch {
      return NextResponse.json(GENERIC_ERROR, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
