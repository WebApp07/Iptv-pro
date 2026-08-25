import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  Placeholder,
  LegalContactLine,
} from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What information we collect, how we use it, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what personal data we collect and how we use it."
      updated="[DATE]"
    >
      <LegalSection title="1. Who we are">
        <p>
          This website is operated by <Placeholder>Company Legal Name</Placeholder>{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the controller of the
          personal data described in this policy.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Contact details</strong> you
            give us, such as your name and email address when requesting a
            trial or contacting support.
          </li>
          <li>
            <strong className="text-foreground">WhatsApp number</strong> if
            you choose to receive support or credentials over WhatsApp.
          </li>
          <li>
            <strong className="text-foreground">Account data</strong> needed
            to activate your subscription, such as plan and device count.
          </li>
          <li>
            <strong className="text-foreground">Technical data</strong> such
            as IP address and device type, collected for security and to keep
            the service working.{" "}
            <Placeholder>list analytics tools if any are used</Placeholder>
          </li>
        </ul>
        <p>We do not collect payment card numbers on this website.</p>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To create, activate and manage your subscription.</li>
          <li>To deliver login details and provide support.</li>
          <li>To respond to questions sent by email or WhatsApp.</li>
          <li>To detect abuse and keep the service secure.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Sharing">
        <p>
          We do not sell your personal data. We share it only with providers
          who help us operate the service (<Placeholder>e.g. hosting, payment
          processor, messaging provider</Placeholder>), each under their own
          confidentiality obligations, or where the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention">
        <p>
          We keep your data only as long as needed to provide the service,{" "}
          <Placeholder>retention period</Placeholder> for accounting records,
          or until you ask us to delete it, whichever applies.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          Depending on where you live (<Placeholder>applicable law, e.g.
          GDPR</Placeholder>) you may have the right to access, correct,
          export or delete your personal data, and to object to certain
          processing. Contact us to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We apply reasonable technical and organisational measures to
          protect your data. No method of transmission is completely secure,
          so please never send passwords by email or chat.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update this policy as the service evolves. The date at the
          top shows the latest revision.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}
