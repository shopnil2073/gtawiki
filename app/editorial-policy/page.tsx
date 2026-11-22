import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How GTA Wiki researches, fact-checks, labels leaks, updates and corrects its GTA 6 guides, and how we keep advertising separate from editorial decisions.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <LegalPage
      title="Editorial Policy"
      path="/editorial-policy"
      intro="The standards every GTA Wiki guide is held to: accuracy, transparency and independence."
    >
      <h2>Accuracy and fact-checking</h2>
      <ul>
        <li>Gameplay guides are verified in the game itself before publication. Where we could not test something, we say so.</li>
        <li>Facts about release dates, editions, prices and platforms come from Rockstar Games, Take-Two Interactive, or platform stores, and we link or name the source.</li>
        <li>Numbers (file size, map size, completion time, frame rate) are labeled with how and where they were measured.</li>
        <li>We update guides after patches and show the last updated date on every page.</li>
      </ul>

      <h2>Leaks, rumors and unconfirmed information</h2>
      <p>We treat unreleased material and rumors with caution:</p>
      <ul>
        <li><strong>Confirmed:</strong> stated by Rockstar or Take-Two, or verified by us in the game.</li>
        <li><strong>Reported:</strong> from a named outlet or source, not independently confirmed. We say who reported it.</li>
        <li><strong>Rumor or leak:</strong> unverified. We label it clearly, never use it as the basis for a how-to, and do not host stolen or leaked game files, source code or development builds.</li>
      </ul>

      <h2>Spoilers</h2>
      <p>
        Guides that reveal story details carry a spoiler notice near the top. Spoiler-free guides
        avoid plot details beyond what Rockstar has shown in official marketing.
      </p>

      <h2>Sources and originality</h2>
      <p>
        We write our own text and use our own screenshots where possible. Third-party images are credited
        and used under a license or fair use principles, and we do not republish other sites&rsquo;
        articles. Quotes are short and attributed.
      </p>

      <h2>Corrections</h2>
      <p>
        If we get something wrong, we fix it quickly. For significant changes we add a correction note
        with the date. To report an error, use our <Link href="/contact">contact page</Link> or email{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>

      <h2>Independence and advertising</h2>
      <p>
        Advertising, including Google AdSense, is separate from editorial decisions. Advertisers do not
        see or approve our content, and we do not accept payment to change a rating, ranking or
        recommendation. If we ever publish sponsored content or use affiliate links, it will be clearly
        labeled.
      </p>

      <h2>Use of AI tools</h2>
      <p>
        Writers may use software tools for research, spell-checking or formatting. Every published fact
        is reviewed by a person, and claims about gameplay are never published without verification
        against the game or an official source.
      </p>

      <h2>No affiliation</h2>
      <p>
        GTA Wiki is an unofficial fan site. See our <Link href="/disclaimer">Disclaimer</Link>.
      </p>
    </LegalPage>
  );
}
