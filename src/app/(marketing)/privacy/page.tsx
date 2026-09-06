import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
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
      updated="6 September 2026"
    >
      <LegalSection title="1. Interpretation and Definitions">
        <p>
          This privacy policy explains what information we collect when you
          use our live streaming service, why we collect it, and the choices
          you have. By using the service, you agree to the collection and use
          of your information as set out below.
        </p>
        <p>
          Words that start with a capital letter in this policy have a
          specific meaning, listed here.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Account</strong> means a
            unique account created for you to access the service, or parts of
            it.
          </li>
          <li>
            <strong className="text-foreground">Affiliate</strong> means a
            company that controls us, is controlled by us, or is under common
            control with us. Control means owning 50% or more of a
            company&apos;s shares or voting rights.
          </li>
          <li>
            <strong className="text-foreground">Company</strong> (referred
            to as &ldquo;the Company&rdquo;, &ldquo;We&rdquo;,
            &ldquo;Us&rdquo; or &ldquo;Our&rdquo; in this policy) means IPTV
            Pro, the operator of this website.
          </li>
          <li>
            <strong className="text-foreground">Cookies</strong> are small
            files a website places on your computer, phone or other device.
            They store details such as your browsing history on that site.
          </li>
          <li>
            <strong className="text-foreground">Device</strong> means any
            device that can access the service, such as a computer, phone or
            tablet.
          </li>
          <li>
            <strong className="text-foreground">Personal Data</strong> is any
            information that relates to an identified or identifiable person.
          </li>
          <li>
            <strong className="text-foreground">Service</strong> refers to
            the Website.
          </li>
          <li>
            <strong className="text-foreground">Service Provider</strong>{" "}
            means any person or company that processes data on our behalf,
            such as partners that help us host, run or improve the service.
          </li>
          <li>
            <strong className="text-foreground">Usage Data</strong> means data
            collected automatically when the service is used, such as how long
            a page visit lasted.
          </li>
          <li>
            <strong className="text-foreground">Website</strong> refers to
            IPTV Pro&apos;s website, at https://tv96.uk.
          </li>
          <li>
            <strong className="text-foreground">You</strong> means the person
            using the service, or the company on whose behalf they use it,
            whichever applies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Collection and Use of Your Personal Data">
        <h3 className="font-semibold text-foreground">
          Data we collect
        </h3>
        <p>
          When you request a free trial, order a plan or contact support, we
          may ask for details we can use to reach you. This can include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Email address</li>
          <li>First name and last name</li>
          <li>
            Phone number, including your WhatsApp number if you want support
            or login details over WhatsApp
          </li>
        </ul>
        <p>We do not collect payment card numbers on this website.</p>

        <h3 className="mt-6 font-semibold text-foreground">
          How we use your data
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">To run the service:</strong>{" "}
            keep it working, monitor how it&apos;s used and fix problems.
          </li>
          <li>
            <strong className="text-foreground">To manage your
            subscription:</strong> set it up, keep it active and manage its
            features.
          </li>
          <li>
            <strong className="text-foreground">To deal with orders:</strong>{" "}
            process purchases and carry out any agreement you make with us.
          </li>
          <li>
            <strong className="text-foreground">To stay in touch:</strong>{" "}
            send updates, security notices and messages about your
            subscription by email, phone or WhatsApp.
          </li>
          <li>
            <strong className="text-foreground">To send offers:</strong> tell
            you about products and deals similar to ones you&apos;ve already
            bought or asked about. You can stop this whenever you like.
          </li>
          <li>
            <strong className="text-foreground">To answer your
            requests:</strong> respond to what you send us.
          </li>
          <li>
            <strong className="text-foreground">If we are sold:</strong> in a
            merger, sale, reorganisation or transfer of our assets, personal
            data we hold about users may be among the assets transferred.
          </li>
          <li>
            <strong className="text-foreground">Other uses:</strong> analysing
            how the service is used, spotting trends, measuring promotions and
            improving the product.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Deleting Your Data">
        <p>
          You have the right to delete your personal data, or to ask us to
          delete it for you. Email or message us at any time to access,
          correct or delete the information you&apos;ve given us.
        </p>
      </LegalSection>

      <LegalSection title="4. Security">
        <p>
          Keeping your data safe matters to us. That said, no transmission
          over the internet or method of storage is completely secure. We use
          commercially reasonable measures to protect your data, but we
          cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing">
        <p>
          We do not sell your personal data. We share it only with partners
          who help us run the service, each bound by confidentiality
          obligations, or when the law requires it.
        </p>
      </LegalSection>

      <LegalSection title="6. Links to Other Websites">
        <p>
          Our service may link to sites we don&apos;t run. If you click a
          third-party link, you&apos;ll be on their site, so it&apos;s worth
          checking their privacy policy. We have no control over, and accept
          no responsibility for, the content, policies or practices of
          third-party sites or services.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes to This Policy">
        <p>
          We may update this policy as the service changes. We&apos;ll post
          the revised version on this page and, where we can reach you, let
          you know before it takes effect. The date at the top shows the
          latest revision.
        </p>
      </LegalSection>

      <LegalSection title="8. Your Rights">
        <p>
          Where you live affects what rights you have. In many places you may
          be able to access, correct, export or delete your personal data,
          and to object to certain processing. Contact us and we&apos;ll help.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact Us">
        <p>
          If you have any questions about this privacy policy, get in touch:
        </p>
        <LegalContactLine />
      </LegalSection>
    </LegalPage>
  );
}