"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { builders } from "@/lib/mdx-blocks";
import type { MediaItem } from "@/lib/posts";
import { btnCls, btnPrimaryCls, inputCls, labelCls } from "./ui";

export type ModalKind = "tutorial" | "qa" | "cheat" | "infobox" | "figure" | "raw";

type Props = {
  kind: ModalKind;
  media: MediaItem[];
  nextStep: number;
  initialRaw?: string;
  initialImage?: MediaItem;
  onInsert: (mdx: string) => void;
  onClose: () => void;
};

const TITLES: Record<ModalKind, string> = {
  tutorial: "Tutorial step",
  qa: "Q&A block",
  cheat: "Cheat code card",
  infobox: "Wiki infobox",
  figure: "Image (zoomable figure)",
  raw: "Edit block (MDX)",
};

export default function ComponentModal({ kind, media, nextStep, initialRaw, initialImage, onInsert, onClose }: Props) {
  // shared
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tip, setTip] = useState("");
  const [n, setN] = useState(nextStep);
  const [image, setImage] = useState(initialImage?.url ?? "");
  const [alt, setAlt] = useState(initialImage?.alt ?? "");
  const [caption, setCaption] = useState("");
  // qa
  const [q, setQ] = useState("");
  // cheat
  const [effect, setEffect] = useState("");
  const [ps5, setPs5] = useState("");
  const [xbox, setXbox] = useState("");
  const [pc, setPc] = useState("");
  // infobox
  const [subtitle, setSubtitle] = useState("");
  const [rows, setRows] = useState<[string, string][]>([["", ""]]);
  // raw
  const [raw, setRaw] = useState(initialRaw ?? "");

  function pick(url: string) {
    setImage(url);
    const m = media.find((x) => x.url === url);
    if (m && !alt) setAlt(m.alt);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    switch (kind) {
      case "tutorial":
        return onInsert(builders.tutorialStep({ n, title, text, tip, image, alt }));
      case "qa":
        return onInsert(builders.qaBlock(q, text));
      case "cheat":
        return onInsert(builders.cheatCodeCard({ name: title, effect, ps5, xbox, pc }));
      case "infobox":
        return onInsert(builders.wikiInfobox({ title, subtitle, image, imageAlt: alt, rows: rows.filter((r) => r[0].trim()) }));
      case "figure":
        return onInsert(builders.figure({ src: image, alt, caption }));
      case "raw":
        return onInsert(raw.trim());
    }
  }

  const needsImage = kind === "figure";
  const valid =
    (kind === "tutorial" && title.trim() && text.trim()) ||
    (kind === "qa" && q.trim() && text.trim()) ||
    (kind === "cheat" && title.trim() && effect.trim() && (ps5 || xbox || pc)) ||
    (kind === "infobox" && title.trim() && rows.some((r) => r[0].trim())) ||
    (kind === "figure" && image.trim() && alt.trim()) ||
    (kind === "raw" && raw.trim());

  const imageField = (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Image {needsImage ? "" : "(optional)"}</label>
        <select value={media.some((m) => m.url === image) ? image : ""} onChange={(e) => pick(e.target.value)} className={inputCls}>
          <option value="">Choose from uploaded media…</option>
          {media.map((m) => (
            <option key={m.url} value={m.url}>
              {m.alt || m.url.split("/").pop()}
            </option>
          ))}
        </select>
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="…or paste an https:// image URL" className={`${inputCls} mt-2`} />
      </div>
      <div>
        <label className={labelCls}>Alt text {needsImage ? "(required)" : ""}</label>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image, include your keyword naturally" className={inputCls} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] grid place-items-start justify-items-center overflow-y-auto bg-black/80 p-4 pt-[6vh]" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl space-y-4 border border-line border-t-2 border-t-sunset bg-panel p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-paper">{TITLES[kind]}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center border border-line text-paper hover:border-sunset">
            <X className="h-4 w-4" />
          </button>
        </div>

        {kind === "tutorial" && (
          <>
            <div className="grid grid-cols-[5rem_1fr] gap-3">
              <div>
                <label className={labelCls}>Step #</label>
                <input type="number" min={1} value={n} onChange={(e) => setN(Number(e.target.value) || 1)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Step title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} autoFocus />
              </div>
            </div>
            <div>
              <label className={labelCls}>Instructions</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pro tip (optional)</label>
              <input value={tip} onChange={(e) => setTip(e.target.value)} className={inputCls} />
            </div>
            {imageField}
          </>
        )}

        {kind === "qa" && (
          <>
            <div>
              <label className={labelCls}>Question</label>
              <input value={q} onChange={(e) => setQ(e.target.value)} className={inputCls} autoFocus />
            </div>
            <div>
              <label className={labelCls}>Answer</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className={inputCls} />
              <p className="mt-1 text-xs text-mute">Becomes FAQ schema automatically.</p>
            </div>
          </>
        )}

        {kind === "cheat" && (
          <>
            <div>
              <label className={labelCls}>Cheat name</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} autoFocus />
            </div>
            <div>
              <label className={labelCls}>What it does</label>
              <input value={effect} onChange={(e) => setEffect(e.target.value)} className={inputCls} />
            </div>
            {(
              [
                ["PS5 code", ps5, setPs5],
                ["Xbox Series X|S code", xbox, setXbox],
                ["PC code", pc, setPc],
              ] as const
            ).map(([label, val, set]) => (
              <div key={label}>
                <label className={labelCls}>{label}</label>
                <input value={val} onChange={(e) => set(e.target.value)} className={inputCls} />
              </div>
            ))}
          </>
        )}

        {kind === "infobox" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} autoFocus />
              </div>
              <div>
                <label className={labelCls}>Subtitle</label>
                <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Rows (label → value)</label>
              <div className="space-y-2">
                {rows.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                    <input value={r[0]} onChange={(e) => setRows(rows.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} placeholder="Label" className={inputCls} />
                    <input value={r[1]} onChange={(e) => setRows(rows.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} placeholder="Value" className={inputCls} />
                    <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove row" className="grid w-10 place-items-center border border-line text-mute hover:text-neon-pink">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setRows([...rows, ["", ""]])} className={`${btnCls} mt-2`}>
                <Plus className="h-3.5 w-3.5" /> Add row
              </button>
            </div>
            {imageField}
          </>
        )}

        {kind === "figure" && (
          <>
            {imageField}
            <div>
              <label className={labelCls}>Caption (optional)</label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} />
            </div>
          </>
        )}

        {kind === "raw" && (
          <div>
            <label className={labelCls}>Block source</label>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={12} spellCheck={false} className={`${inputCls} font-mono`} />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnCls}>
            Cancel
          </button>
          <button type="submit" disabled={!valid} className={btnPrimaryCls}>
            {kind === "raw" ? "Apply" : "Insert"}
          </button>
        </div>
      </form>
    </div>
  );
}
