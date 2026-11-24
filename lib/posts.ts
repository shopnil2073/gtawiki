import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { categories, siteConfig } from "./site";
import { isReservedSlug } from "./text";

const POSTS_DIR = path.join(process.cwd(), "content", "guides");

export type PostType = "article" | "howto" | "qa";

export type MediaItem = { url: string; alt: string; publicId?: string; width?: number; height?: number };

export type PostMeta = {
  slug: string;
  title: string;
  /** Optional <title> override (what Google shows). Falls back to `title`. */
  seoTitle?: string;
  secondaryKeywords: string[];
  media: MediaItem[];
  description: string;
  category: string; // category slug, e.g. "how-to"
  date: string; // YYYY-MM-DD
  updated: string; // YYYY-MM-DD
  author: string;
  image?: string; // absolute https URL (Cloudinary)
  imageAlt?: string;
  keyword: string;
  type: PostType;
  draft: boolean;
  words: number;
  readingMinutes: number;
};

export type Post = PostMeta & { content: string };
export type TocItem = { id: string; text: string; level: 2 | 3 };
export type FaqItem = { question: string; answer: string };
export type HowToStep = { name: string; text: string };

const isProd = process.env.NODE_ENV === "production";

function toDate(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 10);
  return fallback;
}

export function stripMarkdown(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toMedia(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null && typeof (m as Record<string, unknown>).url === "string")
    .map((m) => ({
      url: String(m.url),
      alt: typeof m.alt === "string" ? m.alt : "",
      publicId: typeof m.publicId === "string" ? m.publicId : undefined,
      width: typeof m.width === "number" ? m.width : undefined,
      height: typeof m.height === "number" ? m.height : undefined,
    }));
}

/** Parses the raw text of one .mdx file (frontmatter + body). Used for disk files and for the admin. */
export function parseRaw(slug: string, raw: string, label = `${slug}.mdx`): Post {
  if (isReservedSlug(slug)) {
    throw new Error(`content/guides/${label}: the slug "${slug}" is reserved for the site. Rename the file.`);
  }
  const { data, content } = matter(raw);

  for (const key of ["title", "description", "category", "date"]) {
    if (!data[key]) throw new Error(`content/guides/${label}: missing "${key}" in frontmatter`);
  }
  if (!categories.some((c) => c.slug === data.category)) {
    throw new Error(
      `content/guides/${label}: unknown category "${data.category}". Use one of: ${categories.map((c) => c.slug).join(", ")}`,
    );
  }

  const date = toDate(data.date, "2026-11-21");
  const words = stripMarkdown(content).split(" ").filter(Boolean).length;

  return {
    slug,
    title: String(data.title),
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    secondaryKeywords: Array.isArray(data.secondaryKeywords) ? data.secondaryKeywords.map(String) : [],
    media: toMedia(data.media),
    description: String(data.description),
    category: String(data.category),
    date,
    updated: toDate(data.updated, date),
    author: data.author ? String(data.author) : siteConfig.defaultAuthor,
    image: data.image ? String(data.image) : undefined,
    imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
    keyword: data.keyword ? String(data.keyword) : "",
    type: (data.type as PostType) ?? "article",
    draft: Boolean(data.draft),
    words,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    content,
  };
}

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  return parseRaw(file.replace(/\.mdx?$/, ""), raw, file);
}

let cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (cache && isProd) return cache;
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseFile)
    .filter((p) => !(isProd && p.draft))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = posts;
  return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(post: Post, limit = 4): Post[] {
  const words = new Set(post.keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = p.category === post.category ? 3 : 0;
      for (const w of p.keyword.toLowerCase().split(/\s+/)) if (words.has(w)) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
}

/** Builds the right-hand "On this page" list. Matches rehype-slug ids (github-slugger). */
export function getToc(content: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    const h = /^\s*<h([23])[^>]*>([\s\S]*?)<\/h\1>\s*$/i.exec(line);
    if (!m && !h) continue;
    const level = (m ? m[1].length : Number(h![1])) as 2 | 3;
    const text = stripMarkdown(m ? m[2] : h![2]);
    items.push({ id: slugger.slug(text), text, level });
  }
  return items;
}

/** <QaBlock q="Question?">Answer</QaBlock> -> FAQPage schema */
export function extractFaq(content: string): FaqItem[] {
  const out: FaqItem[] = [];
  const re = /<QaBlock\s+q="([^"]+)"\s*>([\s\S]*?)<\/QaBlock>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) out.push({ question: m[1], answer: stripMarkdown(m[2]) });
  return out;
}

/** <TutorialStep n={1} title="...">text</TutorialStep> -> HowTo schema */
export function extractSteps(content: string): HowToStep[] {
  const out: HowToStep[] = [];
  const re = /<TutorialStep\s+([^>]*?)>([\s\S]*?)<\/TutorialStep>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const title = /title="([^"]+)"/.exec(m[1])?.[1];
    if (title) out.push({ name: title, text: stripMarkdown(m[2]) || title });
  }
  return out;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Oldest post = FILE 001. Used for the "case file" numbering in the editorial design. */
export function getFileNumber(slug: string): number {
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  return idx === -1 ? 0 : all.length - idx;
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getAllPosts()) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return counts;
}
