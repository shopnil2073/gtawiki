/**
 * Pure helpers (no server/client APIs) to find and build wiki component blocks
 * such as <QaBlock q="..."> ... </QaBlock> inside an MDX string.
 * Used by the admin editor (visual <-> MDX conversion, live preview).
 */

export type Segment =
  | { type: "md"; text: string }
  | { type: "block"; raw: string; name: string };

export type ParsedBlock = {
  name: string;
  attrs: Record<string, unknown>;
  children: string;
};

function fenceRanges(src: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = /^(```|~~~).*$/gm;
  let open: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (open === null) open = m.index;
    else {
      ranges.push([open, m.index + m[0].length]);
      open = null;
    }
  }
  if (open !== null) ranges.push([open, src.length]);
  return ranges;
}

/** Scans an opening tag starting at `start` (the "<"). Returns the index after ">" and whether it self-closes. */
function scanTagEnd(src: string, start: number): { end: number; selfClosing: boolean } | null {
  let i = start + 1;
  while (i < src.length && /[A-Za-z0-9]/.test(src[i])) i++;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'") {
      const close = src.indexOf(c, i + 1);
      if (close === -1) return null;
      i = close + 1;
    } else if (c === "{") {
      let depth = 0;
      while (i < src.length) {
        const d = src[i];
        if (d === '"' || d === "'" || d === "`") {
          const close = src.indexOf(d, i + 1);
          if (close === -1) return null;
          i = close + 1;
          continue;
        }
        if (d === "{") depth++;
        if (d === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
        i++;
      }
    } else if (c === "/" && src[i + 1] === ">") {
      return { end: i + 2, selfClosing: true };
    } else if (c === ">") {
      return { end: i + 1, selfClosing: false };
    } else {
      i++;
    }
  }
  return null;
}

/** Inline wiki components: they live inside paragraphs, so they are never treated as standalone blocks. */
export const INLINE_COMPONENTS = new Set(["Color", "Highlight", "Align"]);

/** Splits MDX into markdown text and wiki component blocks (only blocks that start at a line start). */
export function splitMdx(src: string): Segment[] {
  const out: Segment[] = [];
  const fences = fenceRanges(src);
  const inFence = (idx: number) => fences.some(([a, b]) => idx >= a && idx <= b);
  const re = /^<([A-Z][A-Za-z0-9]*)(?=[\s/>])/gm;
  let pos = 0;

  while (pos < src.length) {
    re.lastIndex = pos;
    let m: RegExpExecArray | null = re.exec(src);
    while (m && (inFence(m.index) || INLINE_COMPONENTS.has(m[1]))) m = re.exec(src);
    if (!m) break;

    const name = m[1];
    const tag = scanTagEnd(src, m.index);
    if (!tag) {
      out.push({ type: "md", text: src.slice(pos, m.index + 1) });
      pos = m.index + 1;
      continue;
    }

    let rawEnd = tag.end;
    if (!tag.selfClosing) {
      const closeTag = `</${name}>`;
      const closeIdx = src.indexOf(closeTag, tag.end);
      if (closeIdx === -1) {
        out.push({ type: "md", text: src.slice(pos, tag.end) });
        pos = tag.end;
        continue;
      }
      rawEnd = closeIdx + closeTag.length;
    }

    if (m.index > pos) out.push({ type: "md", text: src.slice(pos, m.index) });
    out.push({ type: "block", raw: src.slice(m.index, rawEnd), name });
    pos = rawEnd;
  }

  if (pos < src.length) out.push({ type: "md", text: src.slice(pos) });
  return out;
}

function parseExpression(expr: string): unknown {
  const attempts = [
    expr,
    expr
      .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*)'/g, '"$1"')
      .replace(/,\s*([}\]])/g, "$1"),
  ];
  for (const a of attempts) {
    try {
      return JSON.parse(a);
    } catch {
      /* try next */
    }
  }
  return undefined;
}

/** Parses attributes and children of one block. Expressions are read as JSON-like literals (no eval). */
export function parseBlock(raw: string): ParsedBlock | null {
  const nameMatch = /^<([A-Z][A-Za-z0-9]*)/.exec(raw);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const tag = scanTagEnd(raw, 0);
  if (!tag) return null;

  const open = raw.slice(nameMatch[0].length, tag.selfClosing ? tag.end - 2 : tag.end - 1);
  const attrs: Record<string, unknown> = {};
  let i = 0;
  while (i < open.length) {
    while (i < open.length && /\s/.test(open[i])) i++;
    const nm = /^[A-Za-z_][\w-]*/.exec(open.slice(i));
    if (!nm) break;
    const key = nm[0];
    i += key.length;
    if (open[i] !== "=") {
      attrs[key] = true;
      continue;
    }
    i++;
    const q = open[i];
    if (q === '"' || q === "'") {
      const close = open.indexOf(q, i + 1);
      attrs[key] = open.slice(i + 1, close === -1 ? open.length : close);
      i = close === -1 ? open.length : close + 1;
    } else if (q === "{") {
      let depth = 0;
      const start = i;
      while (i < open.length) {
        const d = open[i];
        if (d === '"' || d === "'" || d === "`") {
          const close = open.indexOf(d, i + 1);
          i = close === -1 ? open.length : close + 1;
          continue;
        }
        if (d === "{") depth++;
        if (d === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
        i++;
      }
      const inner = open.slice(start + 1, i - 1).trim();
      const value = parseExpression(inner);
      attrs[key] = value === undefined ? inner : value;
    }
  }

  let children = "";
  if (!tag.selfClosing) {
    const closeTag = `</${name}>`;
    children = raw.slice(tag.end, raw.length - closeTag.length).trim();
  }
  return { name, attrs, children };
}

/** Quotes a string for a JSX attribute while keeping it readable and regex-extractable. */
function attrString(value: string): string {
  const clean = value.replace(/"/g, "\u201d").replace(/\s*\n\s*/g, " ").trim();
  return `"${clean}"`;
}

function attr(key: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number") return ` ${key}={${value}}`;
  return ` ${key}=${attrString(value)}`;
}

function exprAttr(key: string, value: unknown): string {
  return ` ${key}={${JSON.stringify(value)}}`;
}

export const builders = {
  qaBlock(q: string, answer: string): string {
    return `<QaBlock${attr("q", q)}>\n${answer.trim()}\n</QaBlock>`;
  },
  tutorialStep(p: { n: number; title: string; text: string; tip?: string; image?: string; alt?: string }): string {
    return `<TutorialStep${attr("n", p.n)}${attr("title", p.title)}${attr("tip", p.tip)}${attr("image", p.image)}${attr("alt", p.alt)}>\n${p.text.trim()}\n</TutorialStep>`;
  },
  cheatCodeCard(p: { name: string; effect: string; ps5?: string; xbox?: string; pc?: string }): string {
    const codes: Record<string, string> = {};
    if (p.ps5) codes.ps5 = p.ps5;
    if (p.xbox) codes.xbox = p.xbox;
    if (p.pc) codes.pc = p.pc;
    return `<CheatCodeCard${attr("name", p.name)}${attr("effect", p.effect)}${exprAttr("codes", codes)} />`;
  },
  wikiInfobox(p: { title: string; subtitle?: string; image?: string; imageAlt?: string; rows: [string, string][] }): string {
    return `<WikiInfobox${attr("title", p.title)}${attr("subtitle", p.subtitle)}${attr("image", p.image)}${attr("imageAlt", p.imageAlt)}${exprAttr("rows", p.rows)} />`;
  },
  figure(p: { src: string; alt: string; caption?: string }): string {
    return `<Figure${attr("src", p.src)}${attr("alt", p.alt)}${attr("caption", p.caption)} />`;
  },
};

/** One-line human label for a block (used in the visual editor and preview). */
export function blockLabel(block: ParsedBlock | null, name: string): string {
  if (!block) return name;
  const a = block.attrs;
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  switch (name) {
    case "QaBlock":
      return s(a.q);
    case "TutorialStep":
      return `Step ${String(a.n ?? "")}: ${s(a.title)}`;
    case "CheatCodeCard":
      return s(a.name);
    case "WikiInfobox":
      return s(a.title);
    case "Figure":
      return s(a.alt) || s(a.caption) || s(a.src);
    case "AdSlot":
      return s(a.variant) || "in-article";
    default:
      return name;
  }
}
