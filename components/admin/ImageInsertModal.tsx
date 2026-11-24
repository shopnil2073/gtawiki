"use client";

import { useRef, useState, type FormEvent } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { builders } from "@/lib/mdx-blocks";
import { normalize } from "@/lib/seo-analysis";
import type { MediaItem } from "@/lib/posts";
import { thumbUrl, uploadImage } from "./upload";
import { btnCls, btnPrimaryCls, inputCls, labelCls } from "./ui";

type Props = {
  media: MediaItem[];
  keyword: string;
  slug: string;
  cloudinaryReady: boolean;
  /** Pre-selected image (when you click "Insert" on a library card). */
  initial?: MediaItem;
  /** A freshly uploaded or edited image: add it to / update it in the post's media library. */
  onMediaChange: (item: MediaItem) => void;
  onInsert: (mdx: string, opts: { item: MediaItem; featured: boolean }) => void;
  onClose: () => void;
};

export default function ImageInsertModal({ media, keyword, slug, cloudinaryReady, initial, onMediaChange, onInsert, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "library">(initial || media.length === 0 ? "upload" : "library");
  const [item, setItem] = useState<MediaItem | null>(initial ?? null);
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [caption, setCaption] = useState("");
  const [featured, setFeatured] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const kw = normalize(keyword);
  const altHasKeyword = kw !== "" && normalize(alt).includes(kw);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const m = await uploadImage(file, slug);
      setItem(m);
      setAlt(m.alt);
      onMediaChange(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function useUrl() {
    const u = url.trim();
    if (!/^https:\/\/\S+$/i.test(u)) return setError("Paste a full https:// image URL.");
    setError("");
    setItem({ url: u, alt: "" });
    setAlt("");
  }

  function choose(m: MediaItem) {
    setItem(m);
    setAlt(m.alt);
    setError("");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!item || !alt.trim()) return;
    const final: MediaItem = { ...item, alt: alt.trim() };
    onMediaChange(final);
    onInsert(builders.figure({ src: final.url, alt: final.alt, caption }), { item: final, featured });
  }

  const tabBtn = (id: "upload" | "library", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`mono-label px-4 py-2.5 ${tab === id ? "bg-sunset text-base" : "text-mute hover:text-paper"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[120] grid place-items-start justify-items-center overflow-y-auto bg-black/80 p-4 pt-[5vh]" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-2xl space-y-4 border border-line border-t-2 border-t-sunset bg-panel p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="mono-label text-sunset">Insert at cursor</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-paper">Add an image</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center border border-line text-paper hover:border-sunset">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div role="tablist" className="flex w-fit border border-line">
          {tabBtn("upload", "Upload from computer")}
          {media.length > 0 && <span className="border-l border-line">{tabBtn("library", `Media library (${media.length})`)}</span>}
        </div>

        {tab === "upload" && (
          <div className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (cloudinaryReady) void upload(e.dataTransfer.files[0]);
              }}
              className={`grid place-items-center border border-dashed px-4 py-8 text-center ${drag ? "border-sunset bg-sunset/5" : "border-line"}`}
            >
              <UploadCloud className="h-6 w-6 text-sunset" />
              <p className="mt-2 text-sm text-paper">{busy ? "Uploading to Cloudinary…" : "Drop an image here"}</p>
              <button type="button" disabled={!cloudinaryReady || busy} onClick={() => fileInput.current?.click()} className={`${btnCls} mt-3`}>
                <ImagePlus className="h-4 w-4" /> Choose file
              </button>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
              {!cloudinaryReady && (
                <p className="mt-3 text-xs text-neon-pink">Cloudinary is not configured. Add the CLOUDINARY_* variables, or paste an image URL below.</p>
              )}
              <p className="mt-2 text-xs text-mute">JPG, PNG, WebP or GIF, up to 10 MB.</p>
            </div>
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an https:// image URL" className={inputCls} />
              <button type="button" onClick={useUrl} className={btnCls}>
                Use URL
              </button>
            </div>
          </div>
        )}

        {tab === "library" && (
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {media.map((m) => (
              <button
                key={m.url}
                type="button"
                onClick={() => choose(m)}
                aria-pressed={item?.url === m.url}
                className={`relative border ${item?.url === m.url ? "border-sunset" : "border-line hover:border-paper"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl(m.url)} alt={m.alt} className="aspect-[360/220] w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-neon-pink">{error}</p>}

        {item && (
          <div className="space-y-3 border-t border-line pt-4">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbUrl(item.url)} alt="" className="h-20 w-32 shrink-0 border border-line object-cover" />
              <div className="min-w-0 flex-1">
                <label className={labelCls} htmlFor="img-alt">
                  Alt text (required)
                </label>
                <input
                  id="img-alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe what the image shows"
                  className={inputCls}
                  autoFocus
                />
              </div>
            </div>

            <p className={`border-l-2 p-2.5 text-xs leading-relaxed ${altHasKeyword ? "border-neon-cyan bg-neon-cyan/5 text-paper" : "border-sunset bg-sunset/5 text-paper"}`}>
              {kw === "" ? (
                <>Tip: describe the image for people who cannot see it, and work your focus keyword in naturally. Set a focus keyword in the SEO panel to get a live check.</>
              ) : altHasKeyword ? (
                <>✅ Alt text contains your focus keyword “{keyword}”.</>
              ) : (
                <>
                  ⚠️ Add your focus keyword “{keyword}” to the alt text if it fits naturally, for example “{keyword}, screenshot”. Never stuff it in.
                </>
              )}
            </p>

            <div>
              <label className={labelCls} htmlFor="img-cap">
                Caption (optional)
              </label>
              <input id="img-cap" value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} />
            </div>

            <label className="flex items-center gap-2 text-sm text-paper">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#ff7a45]" />
              Also use as the featured thumbnail (hero banner and social image)
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnCls}>
            Cancel
          </button>
          <button type="submit" disabled={!item || !alt.trim() || busy} className={btnPrimaryCls}>
            Insert at cursor
          </button>
        </div>
      </form>
    </div>
  );
}
