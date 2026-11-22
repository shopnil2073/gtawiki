import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "GTA Wiki is an unofficial fan site. It is not affiliated with Rockstar Games or Take-Two Interactive. Read our trademark, accuracy and external link disclaimer.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      intro="GTA Wiki is an unofficial fan website and is not connected to the companies that make Grand Theft Auto."
    >
      <h2>No affiliation</h2>
      <p>
        GTA Wiki is not affiliated with, endorsed by, sponsored by, or officially connected to Rockstar
        Games, Rockstar North, Take-Two Interactive Software, Inc., Sony Interactive Entertainment,
        Microsoft, or any of their subsidiaries or affiliates.
      </p>

      <h2>Trademarks and copyright</h2>
      <p>
        Grand Theft Auto, GTA, GTA VI, Rockstar Games and related names, logos, characters and artwork
        are trademarks or copyrighted works of Take-Two Interactive Software, Inc. and/or its
        subsidiaries. PlayStation, Xbox and other platform names belong to their respective owners. All
        such names and images are used on this site only for identification, commentary, criticism and
        news reporting, which we believe falls within fair use. No ownership is claimed.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We work hard to keep every guide accurate and current, but games change through patches and
        updates, and details may differ by region, platform or version. Information is provided for
        general informational and entertainment purposes without warranty of any kind. Read our{" "}
        <Link href="/editorial-policy">Editorial Policy</Link> to see how we label unconfirmed
        information.
      </p>

      <h2>Cheats, glitches and account risk</h2>
      <p>
        Some guides discuss cheats, glitches or exploits. Using them may affect your save file,
        trophies or achievements, or violate the publisher&rsquo;s terms of service. You do so at your
        own risk, and we are not responsible for lost progress, penalties or account actions.
      </p>

      <h2>Mature content</h2>
      <p>
        Grand Theft Auto games contain mature themes. Our coverage is intended for a general audience
        but discusses content from a game rated for mature players. Parents should review the official
        rating before allowing minors to play.
      </p>

      <h2>External links</h2>
      <p>
        We link to third-party sites for reference. We do not control them and are not responsible for
        their content, security or privacy practices.
      </p>

      <h2>Copyright concerns</h2>
      <p>
        If you believe material on this site infringes your rights, please tell us via the{" "}
        <Link href="/contact">contact page</Link> with the page URL and details, and we will review it
        promptly.
      </p>
    </LegalPage>
  );
}
