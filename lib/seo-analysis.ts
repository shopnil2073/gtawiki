/** Live "RankMath / Yoast style" analysis. Pure functions: runs in the browser on every keystroke. */
import { slugify } from "./text";

export type CheckStatus = "pass" | "warn" | "fail";

export type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  hint: string;
  group: "required" | "extra";
};

export type SeoInput = {
  title: string;
  seoTitle: string;
  slug: string;
  description: string;
  keyword: string;
  secondary: string[];
  body: string;
  type: "article" | "howto" | "qa";
  image: string;
  imageAlt: string;
  media: { url: string; alt: string }[];
};

export type SeoResult = {
  checks: Check[];
  score: number; // 0-100, required checks only
  words: number;
  keywordCount: number;
  density: number;
};

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countPhrase(haystack: string, phrase: string): number {
  if (!phrase) return 0;
  let count = 0;
  let from = 0;
  const h = ` ${haystack} `;
  const p = ` ${phrase} `;
  for (;;) {
    const idx = h.indexOf(p, from);
    if (idx === -1) return count;
    count++;
    from = idx + p.length - 1;
  }
}

const TEXT_ATTRS = /\b(?:q|title|tip|name|effect|subtitle|caption)="([^"]*)"/g;

/** Visible text of the post body: markdown/JSX stripped, but component texts (q, title, tip...) kept. */
export function visibleText(body: string): string {
  return body
    .replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, " ")
    .replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*?>/g, (tag) => {
      const parts: string[] = [];
      let m: RegExpExecArray | null;
      TEXT_ATTRS.lastIndex = 0;
      while ((m = TEXT_ATTRS.exec(tag))) parts.push(m[1]);
      return ` ${parts.join(". ")} `;
    })
    .replace(/<\/[A-Z][A-Za-z0-9]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, " ")
    .replace(/[|*_`~\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Heading = { level: number; text: string };

export function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      out.push({ level: m[1].length, text: m[2].replace(/[*_`]/g, "") });
      continue;
    }
    const h = /^\s*<h([1-6])[^>]*>([\s\S]*?)<\/h\1>\s*$/i.exec(line);
    if (h) out.push({ level: Number(h[1]), text: h[2].replace(/<[^>]+>/g, "").trim() });
  }
  return out;
}

type ImageRef = { src: string; alt: string };

export function extractImages(body: string): ImageRef[] {
  const out: ImageRef[] = [];
  const md = /!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = md.exec(body))) out.push({ alt: m[1], src: m[2] });

  const jsx = /<(Figure|TutorialStep|WikiInfobox)\b([^>]*?)\/?>/g;
  while ((m = jsx.exec(body))) {
    const attrs = m[2];
    const src = /\b(?:src|image)="([^"]+)"/.exec(attrs)?.[1];
    const alt = /\b(?:alt|imageAlt)="([^"]*)"/.exec(attrs)?.[1] ?? "";
    if (src) out.push({ src, alt });
  }
  return out;
}

const INTERNAL = /(?:\]\(|href=")(?:https?:\/\/(?:www\.)?gtawiki\.xyz)?\/(?:guides|category)\/[^)"\s]*/g;

export function countInternalLinks(body: string): number {
  return (body.match(INTERNAL) ?? []).length;
}

function status(ok: boolean, partial = false): CheckStatus {
  return ok ? "pass" : partial ? "warn" : "fail";
}

export function analyze(input: SeoInput): SeoResult {
  const kw = normalize(input.keyword);
  const seoTitle = input.seoTitle.trim() || input.title.trim();
  const text = visibleText(input.body);
  const normText = normalize(text);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const headings = extractHeadings(input.body);
  const images = extractImages(input.body);
  const checks: Check[] = [];
  const add = (c: Omit<Check, "group"> & { group?: Check["group"] }) => checks.push({ group: "required", ...c });

  const noKw = !kw;
  const needKw = "Set a focus keyword first.";

  // 1. keyword in SEO title
  add({
    id: "kw-title",
    label: "Focus keyword is in the SEO title",
    status: noKw ? "fail" : status(normalize(seoTitle).includes(kw)),
    hint: noKw ? needKw : normalize(seoTitle).includes(kw) ? "Great: the keyword is in the title." : "Add the exact focus keyword to the SEO title, ideally near the start.",
  });

  // 2. keyword in slug
  const slugNorm = normalize(input.slug.replace(/-/g, " "));
  const slugHasAll = kw ? kw.split(" ").every((w) => slugNorm.split(" ").includes(w)) : false;
  add({
    id: "kw-slug",
    label: "Focus keyword is in the URL slug",
    status: noKw ? "fail" : status(slugNorm.includes(kw), slugHasAll),
    hint: noKw ? needKw : slugNorm.includes(kw) ? "Slug contains the keyword." : `Use a slug like "${slugify(input.keyword)}".`,
  });

  // 3. keyword in meta description
  const desc = input.description.trim();
  add({
    id: "kw-meta",
    label: "Focus keyword is in the meta description",
    status: noKw ? "fail" : status(normalize(desc).includes(kw)),
    hint: noKw ? needKw : normalize(desc).includes(kw) ? "Keyword found in the meta description." : "Mention the focus keyword in the meta description.",
  });

  // 4. meta description length
  const dl = desc.length;
  add({
    id: "meta-length",
    label: "Meta description is 145-160 characters",
    status: dl >= 145 && dl <= 160 ? "pass" : dl >= 120 && dl <= 175 ? "warn" : "fail",
    hint: `Currently ${dl} characters. Aim for 145-160 so Google shows it without cutting it off.`,
  });

  // 5. keyword in first 100 words
  const first100 = normalize(text.split(/\s+/).slice(0, 100).join(" "));
  add({
    id: "kw-intro",
    label: "Focus keyword appears in the first 100 words",
    status: noKw ? "fail" : status(first100.includes(kw)),
    hint: noKw ? needKw : first100.includes(kw) ? "Keyword appears early in the intro." : "Work the focus keyword into your opening paragraph.",
  });

  // 6. keyword in an H2/H3
  const subs = headings.filter((h) => h.level === 2 || h.level === 3);
  const kwInSub = kw ? subs.some((h) => normalize(h.text).includes(kw)) : false;
  add({
    id: "kw-heading",
    label: "Focus keyword is used in an H2 or H3 subheading",
    status: noKw ? "fail" : status(kwInSub),
    hint: noKw ? needKw : kwInSub ? "A subheading contains the keyword." : "Use the keyword (or a close variant) in at least one H2/H3.",
  });

  // 7. heading hierarchy
  let prev = 1;
  let skipped = false;
  for (const h of headings) {
    if (h.level > prev + 1) skipped = true;
    prev = h.level;
  }
  const hasH1 = headings.some((h) => h.level === 1);
  add({
    id: "hierarchy",
    label: "Heading hierarchy is clean (H2 → H3, no skipped levels)",
    status: headings.length === 0 ? "warn" : skipped || hasH1 ? "fail" : "pass",
    hint:
      headings.length === 0
        ? "Add H2 subheadings to structure the article."
        : hasH1
          ? "Remove H1 headings from the body: the post title is already the H1."
          : skipped
            ? "A heading level is skipped (for example H2 straight to H4). Fix the order."
            : "Headings are in a logical order.",
  });

  // 8. keyword density (long-tail phrases of 4+ words get a realistic band: repeating a 7-word phrase
  //    1-2% of the time would read as stuffing, so the exact phrase is held to 0.25-1.5%)
  const keywordCount = countPhrase(normText, kw);
  const density = words > 0 ? (keywordCount / words) * 100 : 0;
  const longTail = kw.split(" ").filter(Boolean).length >= 4;
  const lo = longTail ? 0.25 : 0.8;
  const hi = longTail ? 1.5 : 2.0;
  add({
    id: "density",
    label: `Keyword density is ${lo}%-${hi}%${longTail ? " (long-tail phrase)" : ""}`,
    status: noKw ? "fail" : density >= lo && density <= hi ? "pass" : density > hi ? "fail" : "warn",
    hint: noKw
      ? needKw
      : `Used ${keywordCount}× in ${words} words = ${density.toFixed(2)}%. ${
          density > hi ? "That looks like keyword stuffing: use variations." : density < lo ? "Use the exact phrase a little more naturally, or add close variations." : "Healthy density."
        }`,
  });

  // 9. image alt text
  const alts = [...images.map((i) => i.alt), input.image ? input.imageAlt : ""].filter(Boolean);
  const hasImage = images.length > 0 || Boolean(input.image);
  const secondaryNorm = input.secondary.map(normalize).filter(Boolean);
  const altHasKw = alts.some((a) => {
    const n = normalize(a);
    return (kw && n.includes(kw)) || secondaryNorm.some((s) => n.includes(s));
  });
  add({
    id: "image-alt",
    label: "At least one image has descriptive alt text with the keyword",
    status: !hasImage ? "fail" : alts.length === 0 ? "fail" : altHasKw ? "pass" : "warn",
    hint: !hasImage
      ? "Add at least one image (Figure or Tutorial Step)."
      : alts.length === 0
        ? "Your images have no alt text. Describe what each one shows."
        : altHasKw
          ? "An image alt text contains your keyword."
          : "Alt text exists, but none mentions the focus keyword. Describe the image using it naturally.",
  });

  // 10. internal links
  const links = countInternalLinks(input.body);
  add({
    id: "internal-links",
    label: "Internal links to other guides or categories",
    status: links >= 1 ? "pass" : "fail",
    hint: links >= 1 ? `${links} internal link${links > 1 ? "s" : ""} found.` : "Link to at least one other /guides/ or /category/ page.",
  });

  // 11. word count
  const min = input.type === "qa" ? 300 : 600;
  add({
    id: "word-count",
    label: `Enough content (${min}+ words for ${input.type === "qa" ? "quick Q&A" : "guides"})`,
    status: words >= min ? "pass" : words >= min * 0.7 ? "warn" : "fail",
    hint: `${words} words now. ${words >= min ? "Good depth." : `Add about ${min - words} more useful words.`}`,
  });

  // ----- extras (not part of the score) -----
  const tl = seoTitle.length;
  add({
    group: "extra",
    id: "title-length",
    label: "SEO title is 30-60 characters",
    status: tl >= 30 && tl <= 60 ? "pass" : tl >= 20 && tl <= 70 ? "warn" : "fail",
    hint: `${tl} characters. Titles over ~60 get cut off in Google.`,
  });
  add({
    group: "extra",
    id: "slug-length",
    label: "URL slug is short (under 75 characters)",
    status: input.slug.length > 0 && input.slug.length <= 75 ? "pass" : "warn",
    hint: `${input.slug.length} characters.`,
  });
  add({
    group: "extra",
    id: "featured",
    label: "Featured thumbnail is set",
    status: input.image ? "pass" : "warn",
    hint: input.image ? "Used for the hero banner and social sharing." : "Pick a featured image from your uploads for the hero and OG image.",
  });
  const secHit = secondaryNorm.filter((s) => normText.includes(s)).length;
  add({
    group: "extra",
    id: "secondary",
    label: "Secondary keywords appear in the text",
    status: secondaryNorm.length === 0 ? "warn" : secHit === secondaryNorm.length ? "pass" : secHit > 0 ? "warn" : "fail",
    hint: secondaryNorm.length === 0 ? "Add 3-5 secondary / LSI keywords." : `${secHit} of ${secondaryNorm.length} used in the text.`,
  });
  const qaCount = (input.body.match(/<QaBlock\b/g) ?? []).length;
  const stepCount = (input.body.match(/<TutorialStep\b/g) ?? []).length;
  const schemaOk = input.type === "qa" ? qaCount >= 2 : input.type === "howto" ? stepCount >= 2 : true;
  add({
    group: "extra",
    id: "schema",
    label: "Schema type matches the content",
    status: schemaOk ? "pass" : "warn",
    hint:
      input.type === "qa"
        ? `FAQPage needs 2+ Q&A blocks (found ${qaCount}).`
        : input.type === "howto"
          ? `HowTo needs 2+ Tutorial Steps (found ${stepCount}).`
          : "Article schema is always valid.",
  });

  const required = checks.filter((c) => c.group === "required");
  const points = required.reduce((n, c) => n + (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0);
  return { checks, score: Math.round((points / required.length) * 100), words, keywordCount, density };
}
