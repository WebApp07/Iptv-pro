import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  Placeholder,
  LegalContactLine,
} from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${siteConfig.name} and its streaming services.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms govern your access to and use of our service. By subscribing, you agree to them."
      updated="[DATE]"
    >
      <LegalSection title="1. About these terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) form an agreement
          between you and IPTV Pro (the
          &ldquo;Service&rdquo;). They apply to every plan, free trial and
          feature we offer through this website.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          We provide subscription-based access to live television channels,
          movies and series on the supported devices listed on this website.
          Channel and catalogue availability can vary by region, device and
          plan, and may change over time.
        </p>
      </LegalSection>

      <LegalSection title="3. Free trial">
        <p>
          A 24-hour free trial may be offered so you can evaluate the service
          before purchasing. Trials are limited to one per customer unless we
          state otherwise, and we may withdraw or modify the trial at any
          time.
        </p>
      </LegalSection>

      <LegalSection title="4. Accounts and fair use">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Your subscription covers the number of simultaneous streams shown
            at checkout.
          </li>
          <li>
            Do not share, resell or redistribute your credentials or the
            stream.
          </li>
          <li>
            Do not use the service for any unlawful purpose or in a way that
            harms the service, our suppliers or other customers.
          </li>
        </ul>
        <p>
          We may suspend or terminate accounts that breach these rules, with
          or without notice where required.
        </p>
      </LegalSection>

      <LegalSection title="5. Billing and renewal">
        <p>
          Prices, durations and what is included are shown on the pricing page
          before you pay. Payments are handled by our payment provider
          (<Placeholder>payment provider</Placeholder>) and{" "}
          <Placeholder>billing / renewal terms</Placeholder> apply as
          presented at checkout. Unless stated otherwise, plans do not
          auto-renew and there are no contracts.
        </p>
      </LegalSection>

      <LegalSection title="6. Service availability">
        <p>
          We aim for high uptime but do not guarantee uninterrupted or
          error-free access. Quality depends on factors outside our control,
          including your internet connection and third-party networks.
          Specific channels, events or titles are not guaranteed.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The website, its design and its content are protected by
          intellectual property laws. You are responsible for ensuring your
          use of any content accessed through the service complies with the
          copyright laws of your country.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the Service is provided
          &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, and we are not
          liable for indirect, incidental or consequential damages arising
          from your use of, or inability to use, the service.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these terms">
        <p>
          We may update these Terms from time to time. The date above shows
          when they were last revised. Continued use of the service after a
          change means you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <p>
          These Terms are governed by the laws of{" "}
          <Placeholder>jurisdiction</Placeholder>, without regard to conflict
          of law principles.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}
