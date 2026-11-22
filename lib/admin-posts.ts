import matter from "gray-matter";
import { siteConfig } from "./site";
import { parseRaw, stripMarkdown, type Post } from "./posts";
import { readAll, readFile } from "./content-store";
import type { PostFields } from "./frontmatter";

export type PostSummary = {
  slug: string;
  title: string;
  category: string;
  draft: boolean;
  date: string;
  updated: string;
  words: number;
  keyword: string;
  hasImage: boolean;
  error?: string;
};

export async function listSummaries(): Promise<PostSummary[]> {
  const files = await readAll();
  const out: PostSummary[] = [];
  for (const f of files) {
    try {
      const p = parseRaw(f.slug, f.raw);
      out.push({
        slug: p.slug,
        title: p.title,
        category: p.category,
        draft: p.draft,
        date: p.date,
        updated: p.updated,
        words: p.words,
        keyword: p.keyword,
        hasImage: Boolean(p.image),
      });
    } catch (e) {
      // A broken file should still show up so it can be fixed or deleted.
      const { data, content } = matter(f.raw);
      out.push({
        slug: f.slug,
        title: String(data.title ?? f.slug),
        category: String(data.category ?? ""),
        draft: true,
        date: "",
        updated: "",
        words: stripMarkdown(content).split(" ").filter(Boolean).length,
        keyword: "",
        hasImage: false,
        error: e instanceof Error ? e.message : "Invalid frontmatter",
      });
    }
  }
  return out.sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0));
}

export async function loadPost(slug: string): Promise<Post | null> {
  const f = await readFile(slug);
  return f ? parseRaw(slug, f.raw) : null;
}

export function postToFields(p: Post): PostFields {
  return {
    title: p.title,
    seoTitle: p.seoTitle ?? "",
    description: p.description,
    category: p.category,
    type: p.type,
    keyword: p.keyword,
    secondaryKeywords: p.secondaryKeywords,
    date: p.date,
    updated: p.updated,
    author: p.author === siteConfig.defaultAuthor ? "" : p.author,
    image: p.image ?? "",
    imageAlt: p.imageAlt ?? "",
    draft: p.draft,
    media: p.media,
  };
}

export function emptyFields(): PostFields {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: "",
    seoTitle: "",
    description: "",
    category: "how-to",
    type: "article",
    keyword: "",
    secondaryKeywords: [],
    date: today,
    updated: today,
    author: "",
    image: "",
    imageAlt: "",
    draft: true,
    media: [],
  };
}
