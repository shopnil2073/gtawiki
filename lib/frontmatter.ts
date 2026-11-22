import type { MediaItem } from "./posts";

export type PostFields = {
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  type: "article" | "howto" | "qa";
  keyword: string;
  secondaryKeywords: string[];
  date: string;
  updated: string;
  author: string;
  image: string;
  imageAlt: string;
  draft: boolean;
  media: MediaItem[];
};

const q = (s: string) => JSON.stringify(s); // JSON strings are valid YAML double-quoted scalars

/** Builds a clean, human-readable .mdx file (stable key order = small git diffs). */
export function serializePost(fields: PostFields, body: string): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${q(fields.title)}`);
  if (fields.seoTitle && fields.seoTitle !== fields.title) lines.push(`seoTitle: ${q(fields.seoTitle)}`);
  lines.push(`description: ${q(fields.description)}`);
  lines.push(`category: ${fields.category}`);
  lines.push(`type: ${fields.type}`);
  if (fields.keyword) lines.push(`keyword: ${q(fields.keyword)}`);
  if (fields.secondaryKeywords.length) lines.push(`secondaryKeywords: [${fields.secondaryKeywords.map(q).join(", ")}]`);
  lines.push(`date: ${fields.date}`);
  lines.push(`updated: ${fields.updated}`);
  if (fields.author) lines.push(`author: ${q(fields.author)}`);
  if (fields.image) lines.push(`image: ${q(fields.image)}`);
  if (fields.imageAlt) lines.push(`imageAlt: ${q(fields.imageAlt)}`);
  lines.push(`draft: ${fields.draft ? "true" : "false"}`);
  if (fields.media.length) {
    lines.push("media:");
    for (const m of fields.media) {
      lines.push(`  - url: ${q(m.url)}`);
      lines.push(`    alt: ${q(m.alt || "")}`);
      if (m.publicId) lines.push(`    publicId: ${q(m.publicId)}`);
      if (m.width) lines.push(`    width: ${m.width}`);
      if (m.height) lines.push(`    height: ${m.height}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n") + body.replace(/^\s+/, "").replace(/\s*$/, "\n");
}
