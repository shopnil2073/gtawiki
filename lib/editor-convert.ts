/** MDX <-> HTML conversion for the admin's Visual mode and live preview (browser side). */
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { blockLabel, parseBlock, splitMdx } from "./mdx-blocks";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** <Color value="#hex">…</Color> / <Highlight value="#hex">…</Highlight> -> styled spans (Visual + preview). */
function inlineToHtml(text: string): string {
  return text
    .replace(/<Color\s+value="(#[0-9a-fA-F]{3,8})"\s*>/g, '<span data-fmt="color" style="color:$1">')
    .replace(/<Highlight\s+value="(#[0-9a-fA-F]{3,8})"\s*>/g, '<span data-fmt="highlight" style="background-color:$1">')
    .replace(/<\/(?:Color|Highlight)>/g, "</span>");
}

/**
 * <Align value="center">text</Align> on its own line (optionally after "## ") becomes a real
 * <p> / <h2> with text-align. Used by Visual mode and the live preview.
 */
function alignToHtml(text: string): string {
  return text.replace(
    /^(#{1,6})?[ \t]*<Align value="(left|center|right|justify)">([\s\S]*?)<\/Align>[ \t]*$/gm,
    (_m, hashes: string | undefined, value: string, inner: string) => {
      const tag = hashes ? `h${hashes.length}` : "p";
      const body = marked.parseInline(inlineToHtml(inner), { async: false, gfm: true }) as string;
      return `\n<${tag} style="text-align:${value}">${body}</${tag}>\n`;
    },
  );
}

function md(text: string): string {
  return marked.parse(inlineToHtml(alignToHtml(text)), { async: false, gfm: true }) as string;
}

/** rgb()/rgba()/#hex (as browsers serialize them) -> #rrggbb or #rrggbbaa. Returns null if unknown. */
export function toHex(value: string): string | null {
  const v = value.trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/.exec(v);
  if (m) return "#" + m[1].split("").map((c) => c + c).join("");
  m = /^#([0-9a-f]{4})$/.exec(v);
  if (m) return "#" + m[1].split("").map((c) => c + c).join("");
  if (/^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)) return v;
  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(v);
  if (!rgb) return null;
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  let out = `#${h(+rgb[1])}${h(+rgb[2])}${h(+rgb[3])}`;
  if (rgb[4] !== undefined) {
    const a = rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
    if (a < 1) out += h(a * 255);
  }
  return out;
}

function styleValue(style: string, prop: string): string | null {
  const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i").exec(style);
  return m ? m[1].trim() : null;
}

let keepInlineFormats = true;

/** In Visual mode each wiki component is a locked block that remembers its exact MDX. */
function blockPlaceholder(raw: string, name: string): string {
  const label = blockLabel(parseBlock(raw), name);
  return (
    `<div class="mdx-block" data-mdx="${encodeURIComponent(raw)}" contenteditable="false">` +
    `<span class="mdx-tag">${esc(name)}</span>` +
    `<span class="mdx-label">${esc(label)}</span>` +
    `<span class="mdx-actions"><button type="button" data-action="edit">Edit</button>` +
    `<button type="button" data-action="remove">Remove</button></span></div>`
  );
}

export function mdxToHtml(body: string): string {
  return splitMdx(body)
    .map((s) => (s.type === "block" ? blockPlaceholder(s.raw, s.name) : md(s.text)))
    .join("\n");
}

let service: TurndownService | null = null;

function turndown(): TurndownService {
  if (service) return service;
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    hr: "---",
  });
  td.use(gfm);

  // MDX treats < { } as syntax, so literal ones in prose must be escaped.
  const baseEscape = td.escape.bind(td);
  td.escape = (s: string) => baseEscape(s).replace(/[<{}]/g, (m) => `\\${m}`);

  td.addRule("mdxBlock", {
    filter: (node) => node.nodeName === "DIV" && (node as HTMLElement).hasAttribute("data-mdx"),
    replacement: (_c, node) => {
      const raw = decodeURIComponent((node as HTMLElement).getAttribute("data-mdx") ?? "");
      return `\n\n${raw}\n\n`;
    },
  });
  // Aligned paragraphs / headings: <p style="text-align:center"> -> <Align value="center">…</Align>
  const alignOf = (node: Node): string | null => {
    const el = node as HTMLElement;
    const style = el.getAttribute("style") ?? "";
    const v = (styleValue(style, "text-align") ?? el.getAttribute("align") ?? "").toLowerCase();
    return v === "center" || v === "right" || v === "justify" ? v : null;
  };
  td.addRule("alignedBlock", {
    filter: (node) => keepInlineFormats && /^(P|DIV|H[1-6])$/.test(node.nodeName) && alignOf(node) !== null,
    replacement: (content, node) => {
      const text = content.replace(/\n{2,}/g, "\n").trim();
      if (!text) return "";
      const value = alignOf(node);
      const m = /^H([1-6])$/.exec(node.nodeName);
      const prefix = m ? `${"#".repeat(Number(m[1]))} ` : "";
      return `\n\n${prefix}<Align value="${value}">${text}</Align>\n\n`;
    },
  });

  // Text color / highlight: browser spans (or <font>) -> <Color> / <Highlight> components
  td.addRule("inlineColor", {
    filter: (node) => {
      if (node.nodeName !== "SPAN" && node.nodeName !== "FONT") return false;
      const el = node as HTMLElement;
      const style = el.getAttribute("style") ?? "";
      return /(?:^|;)\s*(?:background-)?color\s*:/i.test(style) || (node.nodeName === "FONT" && el.hasAttribute("color"));
    },
    replacement: (content, node) => {
      if (!keepInlineFormats || !content.trim()) return content;
      const el = node as HTMLElement;
      const style = el.getAttribute("style") ?? "";
      const colorRaw = styleValue(style, "color") ?? (node.nodeName === "FONT" ? el.getAttribute("color") : null);
      const bgRaw = styleValue(style, "background-color");
      const color = colorRaw ? toHex(colorRaw) : null;
      const bg = bgRaw ? toHex(bgRaw) : null;
      let out = content;
      if (bg) out = `<Highlight value="${bg}">${out}</Highlight>`;
      if (color) out = `<Color value="${color}">${out}</Color>`;
      return out;
    },
  });
  service = td;
  return td;
}

/** keepFormats=false drops colors/highlights (used when pasting foreign HTML). */
export function htmlToMdx(html: string, keepFormats = true): string {
  keepInlineFormats = keepFormats;
  return turndown()
    .turndown(html)
    .replace(/\u00a0/g, " ")
    .replace(/^[ \t]+$/gm, "")
    .replace(/^(\s*)-\s{2,}/gm, "$1- ")
    .replace(/^(\s*\d+\.)\s{2,}/gm, "$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Things Visual mode cannot represent exactly. Used to suggest MDX mode. */
export function visualRisks(body: string): string[] {
  const risks: string[] = [];
  for (const s of splitMdx(body)) {
    if (s.type !== "md") continue;
    const t = s.text.replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, "");
    if (/<(?!Color\b|Highlight\b|Align\b)[A-Z][A-Za-z0-9]*[\s/>]/.test(t)) risks.push("a wiki component placed inside a paragraph");
    if (/<(?!br\b)[a-z][a-z0-9]*[\s/>]/.test(t)) risks.push("raw HTML tags");
    if (/(^|[^\\])\{[^}]*\}/.test(t)) risks.push("a { } expression outside a component");
  }
  return Array.from(new Set(risks));
}

// ------------------------------------------------------------------ live preview

function previewBlock(raw: string, name: string): string {
  const b = parseBlock(raw);
  if (!b) return `<div class="pv-card">${esc(name)}</div>`;
  const a = b.attrs;
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  const kids = b.children ? md(b.children) : "";

  switch (name) {
    case "QaBlock":
      return `<details class="pv-card" open><summary>${esc(s(a.q))}</summary>${kids}</details>`;
    case "TutorialStep": {
      const img = s(a.image) ? `<img src="${esc(s(a.image))}" alt="${esc(s(a.alt))}" />` : "";
      const tip = s(a.tip) ? `<p class="pv-tip"><b>Pro tip:</b> ${esc(s(a.tip))}</p>` : "";
      return `<section class="pv-card"><p class="pv-kicker">STEP ${esc(String(a.n ?? ""))}</p><h3>${esc(s(a.title))}</h3>${kids}${img}${tip}</section>`;
    }
    case "CheatCodeCard": {
      const codes = (typeof a.codes === "object" && a.codes ? a.codes : {}) as Record<string, string>;
      const rows = Object.entries(codes)
        .map(([k, v]) => `<tr><th>${esc(k.toUpperCase())}</th><td><code>${esc(String(v))}</code></td></tr>`)
        .join("");
      return `<section class="pv-card"><p class="pv-kicker">CHEAT CODE</p><h3>${esc(s(a.name))}</h3><p>${esc(s(a.effect))}</p><table>${rows}</table></section>`;
    }
    case "WikiInfobox": {
      const rows = (Array.isArray(a.rows) ? a.rows : []) as unknown[];
      const body = rows
        .map((r) => (Array.isArray(r) ? `<tr><th>${esc(String(r[0] ?? ""))}</th><td>${esc(String(r[1] ?? ""))}</td></tr>` : ""))
        .join("");
      const img = s(a.image) ? `<img src="${esc(s(a.image))}" alt="" />` : "";
      return `<aside class="pv-card pv-infobox"><p class="pv-kicker">${esc(s(a.subtitle) || "INFOBOX")}</p><h3>${esc(s(a.title))}</h3>${img}<table>${body}</table></aside>`;
    }
    case "Figure":
      return `<figure class="pv-card"><img src="${esc(s(a.src))}" alt="${esc(s(a.alt))}" />${s(a.caption) ? `<figcaption>${esc(s(a.caption))}</figcaption>` : ""}</figure>`;
    case "AdSlot":
      return `<div class="pv-card pv-ad">Ad slot: ${esc(s(a.variant) || "in-article")}</div>`;
    default:
      return `<div class="pv-card">${esc(name)}</div>`;
  }
}

export function previewHtml(body: string): string {
  return splitMdx(body)
    .map((s) => (s.type === "block" ? previewBlock(s.raw, s.name) : md(s.text)))
    .join("\n");
}

/** HTML for one locked block (used when editing a block in place). */
export function blockToHtml(raw: string): string {
  const name = /^<([A-Z][A-Za-z0-9]*)/.exec(raw)?.[1] ?? "Block";
  return blockPlaceholder(raw, name);
}
