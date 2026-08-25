import type { Metadata } from "next";
import { LegalPage, LegalSection, Placeholder } from "@/components/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "DMCA / Copyright Policy",
  description:
    "How to submit a copyright notice or counter-notification, and how we handle them.",
};

export default function DmcaPage() {
  return (
    <LegalPage
      title="DMCA / Copyright Policy"
      description="We respect intellectual property rights and respond to clear notices of claimed infringement."
      updated="[DATE]"
    >
      <LegalSection title="1. Copyright agent">
        <p>
          Designated agent for copyright notices:{" "}
          <Placeholder>agent name</Placeholder>,{" "}
          <Placeholder>postal address</Placeholder>, email:{" "}
          <Placeholder>copyright contact email</Placeholder>.
        </p>
      </LegalSection>

      <LegalSection title="2. Filing a notice">
        <p>
          If you believe material accessible on this website infringes your
          copyright, send our agent a notice that includes all of the
          following:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Your physical or electronic signature, as the owner or a person
            authorised to act on the owner&rsquo;s behalf.
          </li>
          <li>
            Identification of the copyrighted work you claim is infringed.
          </li>
          <li>
            Identification of the material you claim is infringing, with
            enough detail for us to locate it (for example, the exact URL).
          </li>
          <li>
            Your name, address, telephone number and email address.
          </li>
          <li>
            A statement that you have a good-faith belief that use of the
            material is not authorised by the copyright owner, its agent, or
            the law.
          </li>
          <li>
            A statement, made under penalty of perjury, that the information
            in your notice is accurate and that you are the owner or
            authorised to act on the owner&rsquo;s behalf.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Counter-notification">
        <p>
          If material you posted was removed following a notice, you may send
          a counter-notification to our agent containing your signature, the
          removed material and its prior location, a statement under penalty
          of perjury that removal resulted from mistake or
          misidentification, and your consent to the jurisdiction of{" "}
          <Placeholder>court district</Placeholder>.
        </p>
      </LegalSection>

      <LegalSection title="4. Repeat infringers">
        <p>
          We reserve the right to terminate access for users who are repeat
          infringers, and to remove material at our discretion upon a valid
          notice.
        </p>
      </LegalSection>

      <LegalSection title="5. Misrepresentation warning">
        <p>
          Under applicable law, any person who knowingly materially
          misrepresents that material is infringing, or that it was removed
          by mistake, may be liable for damages, including costs and legal
          fees.
        </p>
      </LegalSection>

      <LegalSection title="6. General questions">
        <p>
          Questions about this policy that are not copyright notices can be
          sent to {siteConfig.supportEmail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
