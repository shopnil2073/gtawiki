/** MDX <-> HTML conversion for the admin's Visual mode and live preview (browser side). */
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { blockLabel, parseBlock, splitMdx } from "./mdx-blocks";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function md(text: string): string {
  return marked.parse(text, { async: false, gfm: true }) as string;
}

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
  service = td;
  return td;
}

export function htmlToMdx(html: string): string {
  return turndown()
    .turndown(html)
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
    if (/<[A-Z][A-Za-z0-9]*[\s/>]/.test(t)) risks.push("a wiki component placed inside a paragraph");
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
