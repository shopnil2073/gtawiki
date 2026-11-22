import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About GTA Wiki",
  description:
    "GTA Wiki is an independent, fan-run guide to Grand Theft Auto VI. Learn who we are, how we write our guides, and how to reach the editorial team.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalPage
      title="About GTA Wiki"
      path="/about"
      intro="An independent, fan-run reference for Grand Theft Auto VI, built for players in the United States."
    >
      <h2>What GTA Wiki is</h2>
      <p>
        GTA Wiki ({siteConfig.domain}) is an unofficial fan resource that covers Grand Theft Auto VI:
        step-by-step how-to guides, answers to common questions, the Leonida map and locations,
        characters, vehicles, weapons, cheats, editions, and technical information such as file size and
        performance.
      </p>
      <p>
        We are not Rockstar Games, Take-Two Interactive, or any of their partners. We do not have
        access to unreleased builds, and we do not sell game keys or accounts.
      </p>

      <h2>Why we publish</h2>
      <p>
        Big open-world games generate thousands of questions in the first weeks after launch, and many
        answers online are copied, outdated, or wrong. Our goal is simple: publish clear guides that
        are checked against the game or an official source, label anything unconfirmed, and keep every
        page up to date when a patch changes something.
      </p>

      <h2>How a guide gets written</h2>
      <ul>
        <li>We pick topics from real player questions and search demand, not from rumors.</li>
        <li>Gameplay claims are checked in the game itself or against official Rockstar material.</li>
        <li>Screenshots are captured by us or credited to their source.</li>
        <li>Every guide shows its published and last updated dates, and we revise it after patches.</li>
        <li>Leaks, datamines and rumors are labeled as such and never presented as fact.</li>
      </ul>
      <p>
        The full standards are in our <Link href="/editorial-policy">Editorial Policy</Link>.
      </p>

      <h2>How the site is funded</h2>
      <p>
        GTA Wiki is free to read. We may show advertising (for example, Google AdSense) to cover hosting
        and writing costs. Ads never influence what we write. See our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> for how advertising cookies work.
      </p>

      <h2>Contact and corrections</h2>
      <p>
        Spotted a mistake or want to suggest a guide? Use our <Link href="/contact">contact page</Link>{" "}
        or email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. We review corrections
        promptly.
      </p>
    </LegalPage>
  );
}
