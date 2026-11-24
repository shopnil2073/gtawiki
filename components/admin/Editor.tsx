"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  KeyRound,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  PanelRight,
  Pilcrow,
  Quote,
  Redo2,
  Save,
  Send,
  Table2,
  Undo2,
  UserSquare2,
} from "lucide-react";
import type { PostFields } from "@/lib/frontmatter";
import type { MediaItem } from "@/lib/posts";
import { slugProblem, slugify } from "@/lib/text";
import { analyze } from "@/lib/seo-analysis";
import { previewHtml, visualRisks } from "@/lib/editor-convert";
import VisualEditor, { type VisualHandle } from "./VisualEditor";
import ComponentModal, { type ModalKind } from "./ComponentModal";
import ImageInsertModal from "./ImageInsertModal";
import ColorPopover, { type Swatch } from "./ColorPopover";
import MediaPanel from "./MediaPanel";
import SeoPanel from "./SeoPanel";
import { btnCls, btnPrimaryCls, inputCls } from "./ui";

type Props = {
  isNew: boolean;
  initialSlug: string;
  initialFields: PostFields;
  initialBody: string;
  storage: "fs" | "github";
  cloudinaryReady: boolean;
};

type Mode = "visual" | "mdx";
type Notice = { type: "ok" | "error"; text: string } | null;
type ModalState = { kind: ModalKind; initialRaw?: string; initialImage?: MediaItem; apply?: (mdx: string) => void } | null;
type ColorKind = "text" | "bg";

const snap = (fields: PostFields, slug: string, body: string) => JSON.stringify({ fields, slug, body });

/** Theme-friendly text colors (dark UI). */
const TEXT_SWATCHES: Swatch[] = [
  { value: "#efe9df", label: "Paper (headline white)" },
  { value: "#ffffff", label: "White" },
  { value: "#ff7a45", label: "Sunset orange" },
  { value: "#ff2e93", label: "Neon pink" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#4ade80", label: "Green" },
  { value: "#facc15", label: "Yellow" },
  { value: "#8e8e98", label: "Muted gray" },
  { value: "#0b0b0d", label: "Ink (use on a highlight)" },
];

/** Subtle tinted highlights that stay readable on the dark background. */
const BG_SWATCHES: Swatch[] = [
  { value: "#ff7a4540", label: "Orange tint" },
  { value: "#ff2e9340", label: "Pink tint" },
  { value: "#22d3ee33", label: "Cyan tint" },
  { value: "#4ade8033", label: "Green tint" },
  { value: "#facc1540", label: "Yellow tint" },
  { value: "#8b5cf640", label: "Purple tint" },
  { value: "#ffffff1f", label: "Gray tint" },
];

export default function Editor({ isNew, initialSlug, initialFields, initialBody, storage, cloudinaryReady }: Props) {
  const [fields, setFields] = useState<PostFields>(initialFields);
  const [slug, setSlug] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<Mode>(visualRisks(initialBody).length > 0 ? "mdx" : "visual");
  const [split, setSplit] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [imageModal, setImageModal] = useState<{ initial?: MediaItem } | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [isNewPost, setIsNewPost] = useState(isNew);
  const [originalSlug, setOriginalSlug] = useState(initialSlug);
  const [savedSnap, setSavedSnap] = useState(snap(initialFields, initialSlug, initialBody));
  const [colorOpen, setColorOpen] = useState<{ kind: ColorKind; anchor: HTMLElement } | null>(null);
  const [textColor, setTextColor] = useState("#ff7a45");
  const [bgColor, setBgColor] = useState("#facc1540");
  const [barH, setBarH] = useState(64);

  const visualRef = useRef<VisualHandle>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const dirty = snap(fields, slug, body) !== savedSnap;
  const slugIssue = slug ? slugProblem(slug) : null;

  // The sticky formatting toolbar sits exactly under the sticky action bar, whatever height that bar has
  // (it wraps to two rows on narrow screens and grows when a notice is shown).
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setBarH(Math.round(el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function setField<K extends keyof PostFields>(k: K, v: PostFields[K]) {
    setFields((f) => ({ ...f, [k]: v }));
    // Short, keyword-based slug (like the focus keyword) unless you edited the slug yourself.
    if (k === "keyword" && !slugTouched && typeof v === "string" && v.trim()) setSlug(slugify(v));
  }

  function setTitle(t: string) {
    setFields((f) => ({ ...f, title: t }));
    if (!slugTouched) setSlug(slugify(fields.keyword || t));
  }

  const setMedia = (fn: (cur: MediaItem[]) => MediaItem[]) => setFields((f) => ({ ...f, media: fn(f.media) }));
  const upsertMedia = (m: MediaItem) =>
    setMedia((cur) => (cur.some((x) => x.url === m.url) ? cur.map((x) => (x.url === m.url ? { ...x, ...m } : x)) : [...cur, m]));

  const result = useMemo(
    () =>
      analyze({
        title: fields.title,
        seoTitle: fields.seoTitle,
        slug,
        description: fields.description,
        keyword: fields.keyword,
        secondary: fields.secondaryKeywords,
        body,
        type: fields.type,
        image: fields.image,
        imageAlt: fields.imageAlt,
        media: fields.media,
      }),
    [fields, slug, body],
  );

  const deferredBody = useDeferredValue(body);
  const preview = useMemo(() => (split ? previewHtml(deferredBody) : ""), [split, deferredBody]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ------------------------------------------------------------ editing helpers

  function currentBody(): string {
    if (mode === "visual") {
      const md = visualRef.current?.getMdx();
      if (md !== undefined) return md;
    }
    return body;
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setColorOpen(null);
    if (mode === "visual") {
      setBody(currentBody());
      setMode(next);
      return;
    }
    const risks = visualRisks(body);
    if (
      risks.length > 0 &&
      !window.confirm(
        `Visual mode cannot show ${risks.join(", ")} exactly and may reformat them.\n\nSwitch anyway? (MDX mode gives full control.)`,
      )
    )
      return;
    setMode(next);
  }

  function setTextarea(next: string, selStart: number, selEnd: number) {
    setBody(next);
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  }

  function insertMdx(text: string) {
    if (mode === "visual") {
      visualRef.current?.insertMdx(text);
      return;
    }
    const ta = taRef.current;
    const s = ta?.selectionStart ?? body.length;
    const e = ta?.selectionEnd ?? body.length;
    const before = body.slice(0, s);
    const after = body.slice(e);
    const pre = !before ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const post = !after ? "\n" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    const next = before + pre + text + post + after;
    const caret = (before + pre + text).length;
    setTextarea(next, caret, caret);
  }

  /** MDX mode: wrap / unwrap the selection in <Color value="…"> or <Highlight value="…">. */
  function mdxInline(tag: "Color" | "Highlight", value: string | null) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = body.slice(s, e);
    const tagRe = new RegExp(`<${tag}\\s+value="[^"]*"\\s*>|</${tag}>`, "g");

    if (value === null) {
      const before = body.slice(0, s);
      const after = body.slice(e);
      const close = `</${tag}>`;
      const open = new RegExp(`<${tag}\\s+value="[^"]*"\\s*>$`).exec(before);
      if (open && after.startsWith(close)) {
        // caret / selection is directly inside one wrapper: remove it
        const start = s - open[0].length;
        setTextarea(before.slice(0, start) + sel + after.slice(close.length), start, start + sel.length);
        return;
      }
      const cleaned = sel.replace(tagRe, "");
      setTextarea(body.slice(0, s) + cleaned + body.slice(e), s, s + cleaned.length);
      return;
    }

    const inner = sel.replace(tagRe, "") || "text";
    const openTag = `<${tag} value="${value}">`;
    setTextarea(body.slice(0, s) + openTag + inner + `</${tag}>` + body.slice(e), s + openTag.length, s + openTag.length + inner.length);
  }

  function mdxFormat(a: string) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = body.slice(s, e);

    const wrap = (l: string, r: string, ph: string) => {
      const inner = sel || ph;
      setTextarea(body.slice(0, s) + l + inner + r + body.slice(e), s + l.length, s + l.length + inner.length);
    };
    const lines = (map: (line: string, i: number) => string) => {
      const ls = body.lastIndexOf("\n", s - 1) + 1;
      const leIdx = body.indexOf("\n", e);
      const le = leIdx === -1 ? body.length : leIdx;
      const block = body.slice(ls, le).split("\n").map(map).join("\n");
      setTextarea(body.slice(0, ls) + block + body.slice(le), ls, ls + block.length);
    };
    const strip = (l: string) => l.replace(/^(#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/, "");

    switch (a) {
      case "bold":
        return wrap("**", "**", "bold text");
      case "italic":
        return wrap("*", "*", "italic text");
      case "h2":
        return lines((l) => `## ${strip(l)}`);
      case "h3":
        return lines((l) => `### ${strip(l)}`);
      case "h4":
        return lines((l) => `#### ${strip(l)}`);
      case "p":
        return lines((l) => strip(l));
      case "ul":
        return lines((l) => `- ${strip(l)}`);
      case "ol":
        return lines((l, i) => `${i + 1}. ${strip(l)}`);
      case "quote":
        return lines((l) => `> ${strip(l)}`);
      case "link": {
        const url = window.prompt("Link URL (internal links look like /another-post-slug)", "/");
        if (url) wrap("[", `](${url})`, "link text");
        return;
      }
      case "hr":
        return insertMdx("---");
      case "table":
        return insertMdx("| Column | Column | Column |\n| --- | --- | --- |\n| Cell | Cell | Cell |");
    }
  }

  function format(a: string) {
    if (mode === "mdx") return mdxFormat(a);
    const v = visualRef.current;
    if (!v) return;
    switch (a) {
      case "bold":
        return v.exec("bold");
      case "italic":
        return v.exec("italic");
      case "h2":
        return v.exec("formatBlock", "<h2>");
      case "h3":
        return v.exec("formatBlock", "<h3>");
      case "h4":
        return v.exec("formatBlock", "<h4>");
      case "p":
        return v.exec("formatBlock", "<p>");
      case "ul":
        return v.exec("insertUnorderedList");
      case "ol":
        return v.exec("insertOrderedList");
      case "quote":
        return v.exec("formatBlock", "<blockquote>");
      case "hr":
        return v.exec("insertHorizontalRule");
      case "table":
        return v.exec("insertTable");
      case "undo":
        return v.exec("undo");
      case "redo":
        return v.exec("redo");
      case "link": {
        const url = window.prompt("Link URL (internal links look like /another-post-slug)", "/");
        if (url) v.exec("createLink", url);
      }
    }
  }

  function applyColor(kind: ColorKind, value: string) {
    if (kind === "text") setTextColor(value);
    else setBgColor(value);
    if (mode === "visual") visualRef.current?.exec(kind === "text" ? "foreColor" : "hiliteColor", value);
    else mdxInline(kind === "text" ? "Color" : "Highlight", value);
    setColorOpen(null);
  }

  function resetColor(kind: ColorKind) {
    if (mode === "visual") visualRef.current?.exec(kind === "text" ? "clearColor" : "clearHighlight");
    else mdxInline(kind === "text" ? "Color" : "Highlight", null);
    setColorOpen(null);
  }

  const nextStep = (body.match(/<TutorialStep\b/g) ?? []).length + 1;

  // ------------------------------------------------------------ save / publish

  async function save(draft: boolean) {
    setNotice(null);
    if (!fields.title.trim()) return setNotice({ type: "error", text: "Add a post title first." });
    const problem = slugProblem(slug);
    if (problem) return setNotice({ type: "error", text: problem });
    if (!fields.description.trim()) return setNotice({ type: "error", text: "Add a meta description first." });
    if (!draft && result.score < 50 && !window.confirm(`SEO score is only ${result.score}/100. Publish anyway?`)) return;

    setSaving(true);
    try {
      const bodyNow = currentBody();
      if (mode === "visual") setBody(bodyNow);
      const today = new Date().toISOString().slice(0, 10);
      const payload: PostFields = {
        ...fields,
        draft,
        date: !draft && (isNewPost || fields.draft) ? today : fields.date,
      };
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNew: isNewPost, originalSlug, fields: payload, body: bodyNow }),
      });
      const j = (await res.json()) as { error?: string; updated?: string };
      if (!res.ok) throw new Error(j.error ?? "Save failed");

      const saved = { ...payload, updated: j.updated ?? payload.updated };
      setFields(saved);
      setIsNewPost(false);
      setOriginalSlug(slug);
      setSlugTouched(true);
      setSavedSnap(snap(saved, slug, bodyNow));
      window.history.replaceState(null, "", `/admin/editor/${slug}`);

      const live = storage === "github";
      setNotice({
        type: "ok",
        text: draft
          ? live
            ? "Draft committed to GitHub. It stays hidden from the public site."
            : "Draft saved to content/guides on disk."
          : live
            ? "Published! Committed to GitHub, so Vercel is rebuilding. The post is live in about 45 seconds."
            : "Published to content/guides on disk. It is visible on your local site now.",
      });
    } catch (e) {
      setNotice({ type: "error", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }
  saveRef.current = () => void save(fields.draft);

  // ------------------------------------------------------------ UI

  const toolBtn = "grid h-9 w-9 shrink-0 place-items-center border border-line text-paper hover:border-sunset hover:text-sunset";

  const fmtBtn = (a: string, label: string, icon: React.ReactNode, hideInMdx = false) =>
    hideInMdx && mode === "mdx" ? null : (
      <button key={a} type="button" title={label} aria-label={label} onMouseDown={(e) => e.preventDefault()} onClick={() => format(a)} className={toolBtn}>
        {icon}
      </button>
    );

  const compBtn = (label: string, icon: React.ReactNode, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="mono-label inline-flex h-9 shrink-0 items-center gap-1.5 border border-sunset/50 bg-sunset/5 px-2.5 text-sunset hover:bg-sunset hover:text-base"
    >
      {icon}
      {label}
    </button>
  );

  const scoreTone = result.score >= 80 ? "border-neon-cyan text-neon-cyan" : result.score >= 50 ? "border-sunset text-sunset" : "border-neon-pink text-neon-pink";

  return (
    <div style={{ ["--editor-bar-h" as string]: `${barH}px` }}>
      {/* sticky action bar */}
      <div ref={barRef} className="sticky top-0 z-30 border-b border-line bg-base">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <Link href="/admin" className="mono-label inline-flex items-center gap-1.5 text-mute hover:text-paper">
            <ArrowLeft className="h-3.5 w-3.5" /> Posts
          </Link>
          <span className={`mono-label border px-2 py-1 ${fields.draft ? "border-line text-mute" : "border-neon-cyan text-neon-cyan"}`}>
            {isNewPost ? "New" : fields.draft ? "Draft" : "Published"}
          </span>
          {dirty && <span className="mono-label text-sunset">Unsaved changes</span>}
          <span className={`mono-label border px-2 py-1 ${scoreTone}`}>SEO {result.score}/100</span>
          <span className="mono-label hidden !tracking-normal text-mute lg:inline">
            Storage: {storage === "github" ? "GitHub → Vercel (live)" : "local disk"}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {!isNewPost && (
              <a href={`/admin/preview/${slug}`} target="_blank" rel="noopener noreferrer" className={btnCls} title="Opens the last saved version">
                <Eye className="h-4 w-4" /> Preview
              </a>
            )}
            {fields.draft ? (
              <>
                <button type="button" disabled={saving} onClick={() => save(true)} className={btnCls}>
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save draft"}
                </button>
                <button type="button" disabled={saving} onClick={() => save(false)} className={btnPrimaryCls}>
                  <Send className="h-4 w-4" /> Publish
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={saving} onClick={() => save(true)} className={btnCls}>
                  Unpublish
                </button>
                <button type="button" disabled={saving} onClick={() => save(false)} className={btnPrimaryCls}>
                  <Send className="h-4 w-4" /> {saving ? "Saving…" : "Update"}
                </button>
              </>
            )}
          </div>
        </div>
        {notice && (
          <p className={`border-t px-4 py-2.5 text-sm ${notice.type === "ok" ? "border-neon-cyan bg-neon-cyan/10 text-paper" : "border-neon-pink bg-neon-pink/10 text-paper"}`}>
            {notice.text}
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-6 pt-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <main className="min-w-0 space-y-5">
          <div>
            <input
              value={fields.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title (becomes the H1)"
              aria-label="Post title"
              className="w-full border-0 border-b border-line bg-transparent pb-3 font-display text-3xl font-bold text-paper placeholder:text-mute focus:border-sunset focus:outline-none sm:text-4xl"
            />
            <p className="mono-label mt-3 !tracking-normal text-mute">
              gtawiki.xyz/
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                aria-label="URL slug"
                className="ml-0.5 w-[min(28rem,70%)] border-b border-line bg-transparent text-paper focus:border-sunset focus:outline-none"
              />
            </p>
            {slugIssue && <p className="mt-2 text-sm text-neon-pink">{slugIssue}</p>}
          </div>

          {/* sticky: mode tabs + formatting toolbar */}
          <div
            className="sticky z-20 -mx-4 border-b border-line bg-base px-4 pb-2 pt-2 sm:mx-0 sm:px-0"
            style={{ top: "var(--editor-bar-h)" }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div role="tablist" aria-label="Editor mode" className="flex border border-line">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "visual"}
                  onClick={() => switchMode("visual")}
                  className={`mono-label px-4 py-2.5 ${mode === "visual" ? "bg-sunset text-base" : "text-mute hover:text-paper"}`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "mdx"}
                  onClick={() => switchMode("mdx")}
                  className={`mono-label inline-flex items-center gap-1.5 border-l border-line px-4 py-2.5 ${mode === "mdx" ? "bg-sunset text-base" : "text-mute hover:text-paper"}`}
                >
                  <Code2 className="h-3.5 w-3.5" /> MDX / HTML
                </button>
              </div>
              <button type="button" onClick={() => setSplit((v) => !v)} aria-pressed={split} className={`${btnCls} !py-2.5 ${split ? "!border-sunset !text-sunset" : ""}`}>
                <PanelRight className="h-4 w-4" /> Live preview
              </button>
            </div>

            <div className="no-scrollbar mt-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto border border-line bg-panel p-2 md:flex-wrap md:overflow-visible">
              {fmtBtn("bold", "Bold", <Bold className="h-4 w-4" />)}
              {fmtBtn("italic", "Italic", <Italic className="h-4 w-4" />)}
              {fmtBtn("h2", "Heading 2", <Heading2 className="h-4 w-4" />)}
              {fmtBtn("h3", "Heading 3", <Heading3 className="h-4 w-4" />)}
              {fmtBtn("h4", "Heading 4", <Heading4 className="h-4 w-4" />)}
              {fmtBtn("p", "Paragraph", <Pilcrow className="h-4 w-4" />)}

              <button
                type="button"
                data-color-trigger
                title="Text color"
                aria-label="Text color"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  const anchor = e.currentTarget;
                  setColorOpen((c) => (c?.kind === "text" ? null : { kind: "text", anchor }));
                }}
                className={`${toolBtn} ${colorOpen?.kind === "text" ? "!border-sunset" : ""}`}
              >
                <span className="flex flex-col items-center leading-none">
                  <span className="font-display text-[15px] font-bold">A</span>
                  <span className="mt-0.5 h-[3px] w-4" style={{ backgroundColor: textColor }} />
                </span>
              </button>
              <button
                type="button"
                data-color-trigger
                title="Highlight (text background)"
                aria-label="Highlight color"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  const anchor = e.currentTarget;
                  setColorOpen((c) => (c?.kind === "bg" ? null : { kind: "bg", anchor }));
                }}
                className={`${toolBtn} ${colorOpen?.kind === "bg" ? "!border-sunset" : ""}`}
              >
                <span className="flex flex-col items-center leading-none">
                  <Highlighter className="h-4 w-4" />
                  <span className="mt-0.5 h-[3px] w-4" style={{ backgroundColor: bgColor }} />
                </span>
              </button>

              {fmtBtn("ul", "Bullet list", <List className="h-4 w-4" />)}
              {fmtBtn("ol", "Numbered list", <ListOrdered className="h-4 w-4" />)}
              {fmtBtn("quote", "Blockquote", <Quote className="h-4 w-4" />)}
              {fmtBtn("link", "Link", <Link2 className="h-4 w-4" />)}
              {fmtBtn("table", "Table", <Table2 className="h-4 w-4" />)}
              {fmtBtn("hr", "Divider", <Minus className="h-4 w-4" />)}
              {fmtBtn("undo", "Undo", <Undo2 className="h-4 w-4" />, true)}
              {fmtBtn("redo", "Redo", <Redo2 className="h-4 w-4" />, true)}
              <span className="mx-1 hidden h-6 w-px shrink-0 bg-line sm:block" />
              {compBtn("Step", <ListChecks className="h-3.5 w-3.5" />, () => setModal({ kind: "tutorial" }))}
              {compBtn("Q&A", <HelpCircle className="h-3.5 w-3.5" />, () => setModal({ kind: "qa" }))}
              {compBtn("Cheat", <KeyRound className="h-3.5 w-3.5" />, () => setModal({ kind: "cheat" }))}
              {compBtn("Infobox", <UserSquare2 className="h-3.5 w-3.5" />, () => setModal({ kind: "infobox" }))}
              {compBtn("Image", <ImageIcon className="h-3.5 w-3.5" />, () => setImageModal({}))}
            </div>
          </div>

          {/* editor + preview */}
          <div className={split ? "grid gap-4 2xl:grid-cols-2" : ""}>
            <div className="min-w-0">
              {mode === "visual" ? (
                <VisualEditor
                  ref={visualRef}
                  initialBody={body}
                  onChange={setBody}
                  onEditBlock={(raw, apply) => setModal({ kind: "raw", initialRaw: raw, apply })}
                />
              ) : (
                <textarea
                  ref={taRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const ta = e.currentTarget;
                      const s = ta.selectionStart;
                      setTextarea(body.slice(0, s) + "  " + body.slice(ta.selectionEnd), s + 2, s + 2);
                    }
                  }}
                  spellCheck={false}
                  aria-label="MDX source"
                  placeholder={"Write Markdown / MDX here.\n\n## Subheading\nParagraph text…"}
                  className={`${inputCls} min-h-[460px] resize-y !p-5 font-mono text-[13px] leading-6`}
                  rows={24}
                />
              )}
              <p className="mono-label mt-2 !tracking-normal text-mute">
                {result.words.toLocaleString("en-US")} words ·{" "}
                {mode === "visual"
                  ? "Visual mode: wiki blocks appear as orange boxes (Edit / Remove)."
                  : "MDX mode: write Markdown, HTML and wiki components directly. Color and highlight are saved as <Color> and <Highlight> tags."}
              </p>
            </div>
            {split && (
              <div className="min-w-0">
                <div
                  className="wiki-prose pv-surface max-h-[70vh] min-h-[460px] overflow-y-auto border border-line bg-panel p-5"
                  dangerouslySetInnerHTML={{ __html: preview || "<p>Nothing to preview yet.</p>" }}
                />
                <p className="mono-label mt-2 !tracking-normal text-mute">Approximate preview. Use Preview (top right) for the exact saved page.</p>
              </div>
            )}
          </div>

          <MediaPanel
            slug={slug}
            media={fields.media}
            setMedia={setMedia}
            featured={fields.image}
            cloudinaryReady={cloudinaryReady}
            onSetFeatured={(m) => setFields((f) => ({ ...f, image: m.url, imageAlt: m.alt }))}
            onInsertImage={(m) => setImageModal({ initial: m })}
            onInsertStep={(m) => setModal({ kind: "tutorial", initialImage: m })}
          />

          <div className="grid gap-4 border border-line bg-panel p-4 sm:grid-cols-2">
            <div>
              <label className="mono-label mb-1.5 block text-mute" htmlFor="feat">Featured thumbnail URL</label>
              <input id="feat" value={fields.image} onChange={(e) => setField("image", e.target.value)} placeholder="Pick one in the library above, or paste a URL" className={inputCls} />
            </div>
            <div>
              <label className="mono-label mb-1.5 block text-mute" htmlFor="feata">Featured image alt text</label>
              <input id="feata" value={fields.imageAlt} onChange={(e) => setField("imageAlt", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mono-label mb-1.5 block text-mute" htmlFor="auth">Author name</label>
              <input id="auth" value={fields.author} onChange={(e) => setField("author", e.target.value)} placeholder="Defaults to GTA Wiki Editorial Team" className={inputCls} />
            </div>
          </div>
        </main>

        <aside className="min-w-0 xl:sticky xl:top-[calc(var(--editor-bar-h)+1rem)] xl:max-h-[calc(100dvh-var(--editor-bar-h)-2rem)] xl:self-start xl:overflow-y-auto xl:pr-1">
          <SeoPanel
            fields={fields}
            setField={setField}
            slug={slug}
            slugIssue={slugIssue}
            setSlug={(s) => {
              setSlugTouched(true);
              setSlug(s);
            }}
            regenSlug={() => {
              setSlug(slugify(fields.keyword || fields.title));
              setSlugTouched(false);
            }}
            result={result}
          />
        </aside>
      </div>

      {colorOpen && (
        <ColorPopover
          anchor={colorOpen.anchor}
          title={colorOpen.kind === "text" ? "Text color" : "Highlight"}
          swatches={colorOpen.kind === "text" ? TEXT_SWATCHES : BG_SWATCHES}
          withAlpha={colorOpen.kind === "bg"}
          resetLabel={colorOpen.kind === "text" ? "Reset to default color" : "Clear highlight"}
          onPick={(v) => applyColor(colorOpen.kind, v)}
          onReset={() => resetColor(colorOpen.kind)}
          onClose={() => setColorOpen(null)}
        />
      )}

      {imageModal && (
        <ImageInsertModal
          media={fields.media}
          keyword={fields.keyword}
          slug={slug}
          cloudinaryReady={cloudinaryReady}
          initial={imageModal.initial}
          onMediaChange={upsertMedia}
          onClose={() => setImageModal(null)}
          onInsert={(mdx, { item, featured }) => {
            insertMdx(mdx);
            if (featured) setFields((f) => ({ ...f, image: item.url, imageAlt: item.alt }));
            setImageModal(null);
          }}
        />
      )}

      {modal && (
        <ComponentModal
          kind={modal.kind}
          media={fields.media}
          nextStep={nextStep}
          initialRaw={modal.initialRaw}
          initialImage={modal.initialImage}
          onClose={() => setModal(null)}
          onInsert={(mdx) => {
            if (modal.apply) modal.apply(mdx);
            else insertMdx(mdx);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
