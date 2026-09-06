import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  LegalContactLine,
} from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `When you can get your money back for ${siteConfig.name}, and how to ask for it.`,
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="When you can get your money back, and how to ask for it."
      updated="6 September 2026"
    >
      <LegalSection title="1. Try it free first">
        <p>
          We offer a 24-hour free trial so you can see how the service runs
          before you pay for anything. It&apos;s worth trying first - it shows
          you the lineup and picture quality, and how the stream behaves on
          your own connection.
        </p>
      </LegalSection>

      <LegalSection title="2. When refunds are available">
        <p>
          If the service doesn&apos;t work for you and our support team
          can&apos;t fix it, you can request a refund within 14 days of your
          purchase.
        </p>
        <p>We can&apos;t usually refund when:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The problem comes from your device or internet connection.</li>
          <li>
            Your account was suspended for breaking our Terms of Service.
          </li>
          <li>You ask after the 14-day window has passed.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How to request a refund">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Message us by email or WhatsApp (details below).</li>
          <li>
            Include the email on your account, your order reference and a
            short description of the problem.
          </li>
          <li>
            Give our support team a fair chance to fix it first - most issues
            are sorted in a few minutes.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Processing">
        <p>
          Approved refunds go back to the original payment method within 5
          business days. Your bank or card provider may take a few extra days
          to show the money.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}