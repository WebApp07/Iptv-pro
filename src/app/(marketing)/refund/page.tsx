import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  Placeholder,
  LegalContactLine,
} from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `When and how you can request a refund for ${siteConfig.name}.`,
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="How refunds work, and how to request one."
      updated="[DATE]"
    >
      <LegalSection title="1. Try it free first">
        <p>
          We offer a 24-hour free trial so you can test the service before
          paying. We recommend using the trial before purchasing, because it
          shows you exactly what to expect from your plan.
        </p>
      </LegalSection>

      <LegalSection title="2. When refunds are available">
        <p>
          If the service does not work for you and our support team cannot
          resolve the issue, you can request a refund within{" "}
          <Placeholder>number of days</Placeholder> days of your purchase.
        </p>
        <p>Refunds may not be available in the following cases:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The problem is caused by your device or internet connection.</li>
          <li>Your account was suspended for breach of our Terms of Service.</li>
          <li>
            The request is made after the refund window has passed.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How to request a refund">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Contact us by email or WhatsApp (details below).</li>
          <li>
            Include your account email, order reference and a short
            description of the issue.
          </li>
          <li>
            Give our support team a reasonable chance to fix the problem
            first.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Processing">
        <p>
          Approved refunds are returned to the original payment method within{" "}
          <Placeholder>number of business days</Placeholder> business days.
          Your bank or card provider may take extra time to post the amount.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}
