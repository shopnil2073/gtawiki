import type { MetadataRoute } from "next";
import { siteConfig, categories, legalLinks } from "@/lib/site";
import { getAllPosts, getCategoryCounts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.updated ?? "2026-11-21";
  const counts = getCategoryCounts();

  return [
    { url: siteConfig.url, lastModified: newest, changeFrequency: "daily", priority: 1 },
    ...categories
      .filter((c) => (counts[c.slug] ?? 0) >= 3) // thin category pages stay out of the sitemap
      .map((c) => ({
      url: `${siteConfig.url}/category/${c.slug}`,
      lastModified: newest,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${siteConfig.url}/guides/${p.slug}`,
      lastModified: p.updated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...legalLinks.map((l) => ({
      url: `${siteConfig.url}${l.href}`,
      lastModified: "2026-11-21",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
