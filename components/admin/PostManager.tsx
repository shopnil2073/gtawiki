"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { categories, getCategory } from "@/lib/site";
import type { PostSummary } from "@/lib/admin-posts";
import { btnPrimaryCls, inputCls } from "./ui";

export default function PostManager({
  initialPosts,
  mode,
  loadError,
}: {
  initialPosts: PostSummary[];
  mode: "fs" | "github";
  loadError: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (!needle || `${p.title} ${p.slug} ${p.keyword}`.toLowerCase().includes(needle)) &&
        (!cat || p.category === cat) &&
        (!status || (status === "draft") === p.draft),
    );
  }, [posts, q, cat, status]);

  const published = posts.filter((p) => !p.draft).length;

  async function remove(p: PostSummary) {
    if (!window.confirm(`Delete "${p.title}"? This removes ${p.slug}.mdx permanently.`)) return;
    setBusy(p.slug);
    setNotice("");
    try {
      const res = await fetch(`/api/admin/posts/${p.slug}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Delete failed");
      setPosts((cur) => cur.filter((x) => x.slug !== p.slug));
      setNotice(mode === "github" ? "Deleted. Vercel is rebuilding; the page disappears in about a minute." : "Deleted from disk.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-sunset">Content desk</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-paper">All posts</h1>
          <p className="mono-label mt-3 text-mute">
            {posts.length} total · {published} published · {posts.length - published} drafts · storage: {mode === "github" ? "GitHub (live)" : "local disk"}
          </p>
        </div>
        <Link href="/admin/editor" className={btnPrimaryCls}>
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {loadError && <p className="mt-6 border border-neon-pink p-4 text-sm text-paper">{loadError}</p>}
      {notice && <p className="mt-6 border border-neon-cyan p-3 text-sm text-paper">{notice}</p>}

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_14rem_10rem]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, slug or keyword…" className={`${inputCls} pl-9`} />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto border border-line">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="mono-label bg-panel text-left text-mute">
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3 text-right">Words</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-mute">
                  No posts match. <Link href="/admin/editor" className="text-sunset underline">Write the first one</Link>.
                </td>
              </tr>
            )}
            {shown.map((p) => (
              <tr key={p.slug} className="border-t border-line align-top hover:bg-white/[0.02]">
                <td className="p-3">
                  <Link href={`/admin/editor/${p.slug}`} className="font-medium text-paper hover:text-sunset">
                    {p.title}
                  </Link>
                  <p className="mono-label mt-1.5 !normal-case !tracking-normal text-mute">/guides/{p.slug}</p>
                  {p.error && <p className="mt-1 text-xs text-neon-pink">{p.error}</p>}
                </td>
                <td className="p-3 text-mute">{getCategory(p.category)?.label ?? "—"}</td>
                <td className="p-3">
                  {p.draft ? (
                    <span className="mono-label border border-line px-2 py-1 text-mute">Draft</span>
                  ) : (
                    <span className="mono-label border border-neon-cyan px-2 py-1 text-neon-cyan">Published</span>
                  )}
                </td>
                <td className="mono-label p-3 !tracking-normal text-mute">{p.updated || "—"}</td>
                <td className="p-3 text-right tabular-nums text-mute">{p.words.toLocaleString("en-US")}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/editor/${p.slug}`} className="mono-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 hover:border-sunset hover:text-sunset">
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <Link href={`/admin/preview/${p.slug}`} target="_blank" className="mono-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 hover:border-neon-cyan hover:text-neon-cyan">
                      <Eye className="h-3 w-3" /> Preview
                    </Link>
                    <button
                      type="button"
                      disabled={busy === p.slug}
                      onClick={() => remove(p)}
                      className="mono-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 hover:border-neon-pink hover:text-neon-pink disabled:opacity-40"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
