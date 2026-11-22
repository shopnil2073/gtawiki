import type { MetadataRoute } from "next";
import { siteConfig, categories, legalLinks } from "@/lib/site";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.updated ?? "2026-11-21";

  return [
    { url: siteConfig.url, lastModified: newest, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({
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
