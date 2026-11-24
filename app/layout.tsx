import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";
import AdSenseScript from "@/components/shell/AdSenseScript";
import { siteConfig, getCategory, postPath } from "@/lib/site";
import { searchIndex, type SearchItem } from "@/lib/search-index";
import { getAllPosts } from "@/lib/posts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb", display: "swap" });

const defaultTitle = `${siteConfig.name}: GTA 6 Guides, Map, Cheats & Q&A`;
const ogImage = { url: siteConfig.assets.ogDefault, width: 1200, height: 630, alt: siteConfig.name };

// No canonical here on purpose: child pages would inherit it. Each page sets its own.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: defaultTitle, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: siteConfig.assets.favicon,
    shortcut: siteConfig.assets.favicon,
    apple: siteConfig.assets.appleTouchIcon,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: defaultTitle,
    description: siteConfig.description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.assets.ogDefault],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.assets.publisherLogo}`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const guideItems: SearchItem[] = getAllPosts().map((p) => ({
    title: p.title,
    href: postPath(p.slug),
    section: getCategory(p.category)?.label ?? "Guide",
    keywords: `${p.keyword} ${p.secondaryKeywords.join(" ")} ${p.description}`,
  }));
  const searchItems = [...guideItems, ...searchIndex];

  return (
    <html lang="en-US" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <AdSenseScript />
        <AppShell searchItems={searchItems}>{children}</AppShell>
      </body>
    </html>
  );
}
