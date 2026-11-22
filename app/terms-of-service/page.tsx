import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you use GTA Wiki: acceptable use, intellectual property, third-party links, advertising, disclaimers and limits of liability.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      path="/terms-of-service"
      intro={`By using ${siteConfig.domain} you agree to these terms. If you do not agree, please do not use the site.`}
    >
      <h2>1. About the site</h2>
      <p>
        {siteConfig.name} is an unofficial fan website about Grand Theft Auto VI. It is not affiliated
        with Rockstar Games or Take-Two Interactive. See the <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>2. Using the site</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site for anything unlawful or to harm others;</li>
        <li>attempt to disrupt, scrape at abusive rates, or gain unauthorized access to the site or its systems;</li>
        <li>click on ads artificially or encourage others to do so;</li>
        <li>submit false, defamatory, infringing or malicious content through our contact form.</li>
      </ul>

      <h2>3. Intellectual property</h2>
      <p>
        Original text, layout, code and graphics on this site are owned by {siteConfig.name} unless
        stated otherwise. You may quote short excerpts with a clear link back to the source page. You
        may not republish full guides, or copy our content in bulk, without written permission.
        Game-related names, images and trademarks belong to their owners (see the Disclaimer).
      </p>

      <h2>4. Advertising and third parties</h2>
      <p>
        The site may display advertising from third parties, including Google AdSense, and may link to
        external websites. We are not responsible for third-party content, products or practices. Your
        dealings with advertisers are solely between you and them. See our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>5. No warranty</h2>
      <p>
        The site and its content are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
        without warranties of any kind, express or implied. We do not guarantee that information is
        complete, current or error-free, or that the site will be uninterrupted.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {siteConfig.name} and its operators are not liable for
        any indirect, incidental, special or consequential damages, or for loss of data, progress or
        profits, arising from your use of the site or reliance on its content.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms from time to time. The date at the top shows the latest version.
        Continued use of the site after a change means you accept the updated terms.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of the United States and the state in which the site
        operator is established, without regard to conflict-of-law rules.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>
    </LegalPage>
  );
}
