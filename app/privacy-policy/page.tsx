import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GTA Wiki collects and uses data, including cookies, Google AdSense and the DoubleClick DART cookie, plus your GDPR and CCPA/CPRA privacy rights and choices.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro={`This policy explains what information ${siteConfig.domain} collects, how it is used, and the choices you have, including under the GDPR and California's CCPA/CPRA.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates {siteConfig.url}, an unofficial
        fan website about Grand Theft Auto VI. You can reach us at{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li>
          <strong>Automatically collected data:</strong> IP address, browser and device type, operating
          system, pages viewed, referring page, approximate location derived from IP, and date and time
          of visit. This is collected through our hosting provider&rsquo;s server logs and, where
          enabled, analytics tools.
        </li>
        <li>
          <strong>Information you send us:</strong> your name, email address and message if you contact
          us. We use it only to reply and to handle your request.
        </li>
        <li>
          <strong>Cookies and similar technologies:</strong> small files or identifiers stored on your
          device, described in section 4.
        </li>
      </ul>
      <p>We do not require an account, and we do not knowingly collect sensitive personal information.</p>

      <h2>3. How we use information</h2>
      <ul>
        <li>to operate, secure and improve the site and its content;</li>
        <li>to understand which guides are useful and fix technical problems;</li>
        <li>to respond to messages, corrections and legal requests;</li>
        <li>to show advertising that supports the site (see section 4);</li>
        <li>to comply with legal obligations and enforce our terms.</li>
      </ul>

      <h2>4. Cookies, advertising and Google AdSense</h2>
      <p>
        We may use Google AdSense to display ads. Third-party vendors, including Google, use cookies to
        serve ads based on a user&rsquo;s prior visits to this website or other websites.
      </p>
      <ul>
        <li>
          Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you
          based on your visit to this site and/or other sites on the internet.
        </li>
        <li>
          Google uses the <strong>DoubleClick DART cookie</strong> as part of this advertising. You may
          opt out of the DART cookie by visiting the{" "}
          <a href="https://policies.google.com/technologies/ads">Google advertising policies page</a>.
        </li>
        <li>
          You can opt out of personalized advertising by visiting{" "}
          <a href="https://adssettings.google.com">Google Ads Settings</a>, or opt out of some
          third-party vendors&rsquo; use of cookies for personalized advertising at{" "}
          <a href="https://www.aboutads.info/choices/">aboutads.info</a>.
        </li>
        <li>
          Learn how Google uses information from sites that use its services at{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            policies.google.com/technologies/partner-sites
          </a>
          .
        </li>
      </ul>
      <p>
        Advertising partners may collect your IP address, device identifiers and browsing activity
        through cookies, pixels or similar technologies. We do not control those cookies. You can also
        block or delete cookies in your browser settings; some site features or ads may then work
        differently.
      </p>
      <p>
        Visitors from the European Economic Area, the United Kingdom and Switzerland are shown a consent
        message where required, and personalized ads are only used with consent.
      </p>

      <h2>5. Other service providers</h2>
      <ul>
        <li><strong>Hosting and delivery:</strong> Vercel Inc. hosts the site and processes request data such as IP address.</li>
        <li><strong>Images:</strong> some images are delivered by Cloudinary, which may receive your IP address and browser details when an image loads.</li>
        <li><strong>Analytics:</strong> if we enable an analytics service, it will collect usage statistics such as pages viewed, and we will keep this policy up to date.</li>
        <li><strong>Email:</strong> messages you send us are handled through our email provider.</li>
      </ul>
      <p>These providers process data on our behalf or under their own privacy policies.</p>

      <h2>6. Your California privacy rights (CCPA/CPRA)</h2>
      <p>
        If you are a California resident, you have the right to: know what personal information we
        collect, use and disclose; request deletion; request correction of inaccurate information;
        opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information for
        cross-context behavioral advertising; limit the use of sensitive personal information; and not
        be discriminated against for exercising these rights.
      </p>
      <p>
        We do not sell personal information in exchange for money. Advertising cookies set by Google
        and other partners may be considered &ldquo;sharing&rdquo; under California law. To opt out, use{" "}
        <a href="https://adssettings.google.com">Google Ads Settings</a>, the{" "}
        <a href="https://www.aboutads.info/choices/">DAA opt-out tool</a>, or enable the Global Privacy
        Control signal in your browser. To make any other request, email{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. We may need to verify your
        identity, and you may use an authorized agent. Residents of other US states with privacy laws
        (such as Virginia, Colorado, Connecticut and Texas) may have similar rights and can use the same
        contact.
      </p>

      <h2>7. Your GDPR rights (EEA, UK and Switzerland)</h2>
      <p>
        Where the GDPR or UK GDPR applies, our legal bases are your consent (for personalized
        advertising cookies), our legitimate interests (running, securing and improving the site), and
        compliance with legal obligations. You have the right to access, correct, delete, restrict or
        object to processing of your data, to data portability, and to withdraw consent at any time
        without affecting earlier processing. You can also lodge a complaint with your local data
        protection authority. Data may be processed in the United States by our providers under
        appropriate safeguards.
      </p>

      <h2>8. Data retention and security</h2>
      <p>
        We keep server logs for a short period for security and troubleshooting, and keep emails only as
        long as needed to handle your request or meet legal duties. We use reasonable technical
        measures such as HTTPS, but no method of transmission or storage is completely secure.
      </p>

      <h2>9. Children&rsquo;s privacy</h2>
      <p>
        The site is not directed to children under 13, and we do not knowingly collect personal
        information from them. If you believe a child has sent us information, contact us and we will
        delete it.
      </p>

      <h2>10. External links</h2>
      <p>
        Our guides link to other websites. We are not responsible for their privacy practices, so please
        read their policies.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy as the site or the law changes. The date at the top shows the latest
        version. See also our <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions or requests: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>
    </LegalPage>
  );
}
