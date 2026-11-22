import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import ContactForm from "@/components/legal/ContactForm";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact GTA Wiki",
  description:
    "Contact the GTA Wiki editorial team to report a correction, suggest a GTA 6 guide, ask a privacy question, or reach us about press and partnerships.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      path="/contact"
      intro="Corrections, guide ideas, press, privacy requests: we read every message."
    >
      <p>
        Email the editorial team at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or use
        the form below. We aim to reply within a few business days. Factual corrections are reviewed
        first.
      </p>
      <ContactForm />
      <h2>Before you write</h2>
      <ul>
        <li>We cannot provide account recovery or purchase support. Please contact Rockstar Games or your console store.</li>
        <li>We do not sell, trade or share game keys, accounts, or unreleased material.</li>
        <li>For copyright concerns, include the page URL and a description of the material.</li>
      </ul>
    </LegalPage>
  );
}
