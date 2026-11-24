import {
  HelpCircle,
  ListChecks,
  Lightbulb,
  Map as MapIcon,
  Car,
  Users,
  Crosshair,
  KeyRound,
  Cpu,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const siteConfig = {
  name: "GTA Wiki",
  domain: "gtawiki.xyz",
  url: "https://gtawiki.xyz",
  email: "contact@gtawiki.xyz",
  tagline: "Guides, Map, Cheats & Q&A for Grand Theft Auto VI",
  description:
    "Unofficial Grand Theft Auto VI wiki with step-by-step guides, Leonida map and locations, characters, vehicles, weapons, cheats, and answers to the most asked GTA 6 questions.",
  locale: "en_US",
  defaultAuthor: "GTA Wiki Editorial Team",
  assets: {
    logo: "/logo.jpg",
    logoFull: "/logo-full.jpg",
    favicon: "/favicon.jpg",
    appleTouchIcon: "/apple-touch-icon.jpg",
    ogDefault: "/og-default.jpg",
    publisherLogo: "/publisher-logo.jpg",
  },
  legalUpdated: "November 21, 2026",
} as const;

export type Category = {
  slug: string;
  /** Must match the "Category" column in the SEO sheet exactly */
  label: string;
  /** Short label for the section nav */
  short: string;
  description: string;
  icon: LucideIcon;
  text: string;
};

export const categories: Category[] = [
  { slug: "q-and-a", short: "Q&A", label: "Q&A", description: "Fast answers to the most asked GTA 6 questions.", icon: HelpCircle, text: "text-neon-cyan" },
  { slug: "how-to", short: "How-To", label: "How-To & Tutorials", description: "Step-by-step walkthroughs with screenshots.", icon: ListChecks, text: "text-neon-pink" },
  { slug: "tips-tricks", short: "Tips", label: "Tips & Tricks", description: "Pro tips for money, driving, combat and settings.", icon: Lightbulb, text: "text-sunset" },
  { slug: "map-locations", short: "Map", label: "Map & Locations", description: "Leonida regions, Vice City and hidden spots.", icon: MapIcon, text: "text-neon-purple" },
  { slug: "vehicles", short: "Vehicles", label: "Vehicles & Customization", description: "Cars, bikes, boats, aircraft and mod shops.", icon: Car, text: "text-neon-cyan" },
  { slug: "characters-story", short: "Characters", label: "Characters & Story", description: "Lucia, Jason and the full cast, spoiler-labeled.", icon: Users, text: "text-neon-pink" },
  { slug: "weapons-gear", short: "Weapons", label: "Weapons & Gear", description: "Weapon lists, stats, stores and clothing.", icon: Crosshair, text: "text-sunset" },
  { slug: "cheats-secrets", short: "Cheats", label: "Cheats & Secrets", description: "Cheat codes, Easter eggs and collectibles.", icon: KeyRound, text: "text-neon-purple" },
  { slug: "release-specs", short: "Specs", label: "Editions, Release & Specs", description: "Prices, editions, file size and performance.", icon: Cpu, text: "text-neon-cyan" },
  { slug: "news", short: "News", label: "News & Updates", description: "Patch notes, trailers, soundtrack and industry news.", icon: Newspaper, text: "text-neon-pink" },
];

export const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** Public path of a post. Posts live at the site root: https://gtawiki.xyz/<slug> */
export const postPath = (slug: string) => `/${slug}`;
