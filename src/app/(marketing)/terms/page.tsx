import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
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
      updated="6 September 2026"
    >
      <LegalSection title="1. About these terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are an agreement
          between you and IPTV Pro (&ldquo;the Service&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;), the operator of this website.
          They cover every plan, free trial and feature we offer through this
          site.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          We provide subscription access to live television channels, movies
          and series on the supported devices listed on this website. Which
          channels and titles are available can vary by region, device and
          plan, and may change over time.
        </p>
      </LegalSection>

      <LegalSection title="3. Free trial">
        <p>
          When we offer a 24-hour free trial, it lets you try the service
          before you pay. Trials are limited to one per customer unless we
          say otherwise, and we may change or withdraw them at any time.
        </p>
      </LegalSection>

      <LegalSection title="4. Accounts and fair use">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Your subscription allows the number of simultaneous streams shown
            at checkout.
          </li>
          <li>
            Do not share, resell or redistribute your login details or the
            stream.
          </li>
          <li>
            Do not use the service for anything unlawful, or in a way that
            harms us, our suppliers or other customers.
          </li>
        </ul>
        <p>
          We may suspend or end accounts that break these rules.
        </p>
      </LegalSection>

      <LegalSection title="5. Billing and renewal">
        <p>
          Prices, terms and what is included are shown on the pricing page
          before you pay. Payments are handled securely by third-party
          providers - PayPal, and card payments via Visa and Mastercard.
        </p>
        <p>
          Plans run for the term you choose (1, 3, 6 or 12 months) and do not
          auto-renew. There are no contracts, so you can stop whenever you
          like.
        </p>
      </LegalSection>

      <LegalSection title="6. Service availability">
        <p>
          We aim to keep the service running, but we do not guarantee it will
          be uninterrupted or error-free. Quality depends on things outside
          our control, such as your internet connection and third-party
          networks. Specific channels, events or titles are not guaranteed.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The website, its design and its content are protected by
          intellectual property laws. You are responsible for making sure how
          you use the content on the service follows the copyright laws of
          your country.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the fullest extent allowed by law, the Service is provided
          &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, and we are not
          liable for indirect, incidental or consequential damages from using
          the service, or from being unable to use it.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these terms">
        <p>
          We may update these Terms as the service evolves. The date at the
          top shows the latest version. If you keep using the service after a
          change, you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <p>
          These Terms are governed by applicable law. If any part of these
          Terms is found unenforceable, the rest still applies.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}