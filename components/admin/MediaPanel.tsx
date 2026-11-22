"use client";

import { useRef, useState } from "react";
import { Copy, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import type { MediaItem } from "@/lib/posts";
import { btnCls, inputCls } from "./ui";

type Upload = { id: string; name: string; status: "uploading" | "done" | "error"; error?: string };

type Props = {
  slug: string;
  media: MediaItem[];
  setMedia: (fn: (cur: MediaItem[]) => MediaItem[]) => void;
  featured: string;
  onSetFeatured: (m: MediaItem) => void;
  onInsertImage: (m: MediaItem) => void;
  onInsertStep: (m: MediaItem) => void;
  cloudinaryReady: boolean;
};

const MAX_BYTES = 10 * 1024 * 1024; // Cloudinary free plan image limit

function humanize(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function thumb(url: string): string {
  return url.replace(/\/upload\/(?:[^/]*,[^/]*\/)?/, "/upload/c_fill,w_360,h_220,f_auto,q_auto/");
}

export default function MediaPanel({ slug, media, setMedia, featured, onSetFeatured, onInsertImage, onInsertStep, cloudinaryReady }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState("");

  async function uploadOne(file: File, id: string) {
    const patch = (p: Partial<Upload>) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, ...p } : x)));
    try {
      if (!file.type.startsWith("image/")) throw new Error("Not an image file.");
      if (file.size > MAX_BYTES) throw new Error("Larger than 10 MB (Cloudinary free limit). Resize it first.");

      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug || "drafts" }),
      });
      const sign = (await signRes.json()) as { error?: string; cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
      if (!signRes.ok) throw new Error(sign.error ?? "Could not sign upload.");

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", String(sign.timestamp));
      form.append("folder", sign.folder);
      form.append("signature", sign.signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: form });
      const j = (await res.json()) as { secure_url?: string; public_id?: string; width?: number; height?: number; error?: { message: string } };
      if (!res.ok || !j.secure_url) throw new Error(j.error?.message ?? "Cloudinary rejected the upload.");

      const item: MediaItem = {
        url: j.secure_url.replace("/upload/", "/upload/f_auto,q_auto/"),
        alt: humanize(file.name),
        publicId: j.public_id,
        width: j.width,
        height: j.height,
      };
      setMedia((cur) => [...cur, item]);
      patch({ status: "done" });
    } catch (e) {
      patch({ status: "error", error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  async function uploadFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    const entries = files.map((f, i) => ({ file: f, id: `${Date.now()}-${i}-${f.name}` }));
    setUploads((u) => [...entries.map((e) => ({ id: e.id, name: e.file.name, status: "uploading" as const })), ...u].slice(0, 20));
    // 3 at a time
    let i = 0;
    await Promise.all(
      Array.from({ length: Math.min(3, entries.length) }, async () => {
        while (i < entries.length) {
          const e = entries[i++];
          await uploadOne(e.file, e.id);
        }
      }),
    );
  }

  function updateAlt(url: string, alt: string) {
    setMedia((cur) => cur.map((m) => (m.url === url ? { ...m, alt } : m)));
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      /* ignore */
    }
  }

  const busy = uploads.some((u) => u.status === "uploading");

  return (
    <section className="border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="mono-label text-sunset">Media library</p>
          <p className="mt-1 text-xs text-mute">Uploads go straight to Cloudinary. Select several images at once.</p>
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={!cloudinaryReady || busy} className={btnCls}>
          <ImagePlus className="h-4 w-4" /> Upload images
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {!cloudinaryReady && (
        <p className="border-b border-line bg-neon-pink/10 px-4 py-3 text-sm text-paper">
          Cloudinary is not configured yet. Add <code className="font-mono">CLOUDINARY_CLOUD_NAME</code>, <code className="font-mono">CLOUDINARY_API_KEY</code> and{" "}
          <code className="font-mono">CLOUDINARY_API_SECRET</code> to your environment, then restart. You can still paste image URLs by hand.
        </p>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (cloudinaryReady) void uploadFiles(e.dataTransfer.files);
        }}
        className={`m-4 grid place-items-center border border-dashed py-6 text-sm ${drag ? "border-sunset bg-sunset/5 text-paper" : "border-line text-mute"}`}
      >
        <UploadCloud className="mb-1.5 h-5 w-5" />
        Drag images here
      </div>

      {uploads.length > 0 && (
        <ul className="mx-4 mb-3 space-y-1 text-xs">
          {uploads.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              <span className={u.status === "done" ? "text-neon-cyan" : u.status === "error" ? "text-neon-pink" : "text-sunset"}>
                {u.status === "done" ? "✔" : u.status === "error" ? "✖" : "…"}
              </span>
              <span className="truncate text-paper">{u.name}</span>
              {u.error && <span className="text-neon-pink">{u.error}</span>}
            </li>
          ))}
        </ul>
      )}

      {media.length === 0 ? (
        <p className="px-4 pb-5 text-sm text-mute">No images for this post yet.</p>
      ) : (
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4">
          {media.map((m) => {
            const isFeatured = m.url === featured;
            return (
              <div key={m.url} className={`w-64 shrink-0 border ${isFeatured ? "border-sunset" : "border-line"} bg-base`}>
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(m.url)} alt={m.alt} className="aspect-[360/220] w-full object-cover" />
                  {isFeatured && <span className="mono-label absolute left-0 top-0 bg-sunset px-2 py-1.5 text-base">Featured</span>}
                </div>
                <div className="space-y-2 p-3">
                  <input value={m.alt} onChange={(e) => updateAlt(m.url, e.target.value)} placeholder="Alt text (describe + keyword)" className={`${inputCls} !py-2 text-xs`} />
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onSetFeatured(m)} className={`${btnCls} !px-2 !py-2 text-[10px]`}>
                      <Star className="h-3 w-3" /> Featured
                    </button>
                    <button type="button" onClick={() => onInsertImage(m)} className={`${btnCls} !px-2 !py-2 text-[10px]`}>
                      Insert
                    </button>
                    <button type="button" onClick={() => onInsertStep(m)} className={`${btnCls} !px-2 !py-2 text-[10px]`}>
                      In step
                    </button>
                    <button type="button" onClick={() => copy(m.url)} className={`${btnCls} !px-2 !py-2 text-[10px]`}>
                      <Copy className="h-3 w-3" /> {copied === m.url ? "Copied" : "URL"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMedia((cur) => cur.filter((x) => x.url !== m.url))}
                    className="mono-label inline-flex items-center gap-1.5 text-[10px] text-mute hover:text-neon-pink"
                  >
                    <Trash2 className="h-3 w-3" /> Remove from list
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
