import { categories, legalLinks } from "./site";

export type SearchItem = {
  title: string;
  href: string;
  section: string;
  keywords: string;
};

/** Static pages + categories. Guides are merged in by app/layout.tsx. */
export const searchIndex: SearchItem[] = [
  { title: "Home", href: "/", section: "Page", keywords: "gta 6 wiki home hub guides" },
  ...categories.map((c) => ({
    title: c.label,
    href: `/category/${c.slug}`,
    section: "Category",
    keywords: c.description,
  })),
  ...legalLinks.map((l) => ({
    title: l.label,
    href: l.href,
    section: "Page",
    keywords: "gta wiki site information",
  })),
];
