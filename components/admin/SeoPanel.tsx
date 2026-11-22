"use client";

import { useState } from "react";
import { ChevronDown, Monitor, Smartphone } from "lucide-react";
import { categories } from "@/lib/site";
import type { PostFields } from "@/lib/frontmatter";
import type { Check, SeoResult } from "@/lib/seo-analysis";
import { inputCls, labelCls } from "./ui";

const ICON: Record<Check["status"], string> = { pass: "✅", warn: "⚠️", fail: "❌" };

function counterTone(len: number, lo: number, hi: number) {
  if (len === 0) return "text-mute";
  return len >= lo && len <= hi ? "text-neon-cyan" : len < lo ? "text-sunset" : "text-neon-pink";
}

function ScoreRing({ score }: { score: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "#22d3ee" : score >= 50 ? "#ff7a45" : "#ff2e93";
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`SEO score ${score} out of 100`}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="#2a2a30" strokeWidth="6" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={c}
        strokeDashoffset={c - (c * score) / 100}
        transform="rotate(-90 38 38)"
      />
      <text x="38" y="44" textAnchor="middle" fontSize="20" fontWeight="700" fill="#efe9df" fontFamily="var(--font-space)">
        {score}
      </text>
    </svg>
  );
}

function Serp({ title, slug, description }: { title: string; slug: string; description: string }) {
  const [mobile, setMobile] = useState(false);
  const t = title.length > 60 ? `${title.slice(0, 58).trim()}…` : title || "Your SEO title appears here";
  const d = description.length > 160 ? `${description.slice(0, 158).trim()}…` : description || "Your meta description appears here. Aim for 145-160 characters.";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className={labelCls + " !mb-0"}>Google preview</p>
        <div className="flex">
          <button type="button" onClick={() => setMobile(false)} aria-label="Desktop preview" className={`border border-line p-1.5 ${!mobile ? "bg-sunset text-base" : "text-mute"}`}>
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setMobile(true)} aria-label="Mobile preview" className={`border border-l-0 border-line p-1.5 ${mobile ? "bg-sunset text-base" : "text-mute"}`}>
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className={`overflow-hidden bg-white p-3 text-left font-sans ${mobile ? "max-w-[22rem]" : ""}`}>
        <p className="truncate text-xs text-[#202124]">
          gtawiki.xyz <span className="text-[#5f6368]">› guides › {slug || "your-slug"}</span>
        </p>
        <p className="mt-1 text-[1.1rem] leading-snug text-[#1a0dab]">{t}</p>
        <p className="mt-1 text-sm leading-snug text-[#4d5156]">{d}</p>
      </div>
    </div>
  );
}

type Props = {
  fields: PostFields;
  setField: <K extends keyof PostFields>(k: K, v: PostFields[K]) => void;
  slug: string;
  setSlug: (s: string) => void;
  regenSlug: () => void;
  result: SeoResult;
};

export default function SeoPanel({ fields, setField, slug, setSlug, regenSlug, result }: Props) {
  const [showExtra, setShowExtra] = useState(true);
  const [secondaryText, setSecondaryText] = useState(fields.secondaryKeywords.join(", "));

  const required = result.checks.filter((c) => c.group === "required");
  const extra = result.checks.filter((c) => c.group === "extra");
  const passed = required.filter((c) => c.status === "pass").length;
  const effectiveTitle = fields.seoTitle || fields.title;
  const label = result.score >= 80 ? "Good" : result.score >= 50 ? "Needs work" : "Poor";

  const row = (c: Check) => (
    <li key={c.id} className="flex gap-2.5 border-b border-line py-2.5 last:border-b-0">
      <span className="mt-0.5 text-base leading-none" aria-label={c.status}>
        {ICON[c.status]}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug text-paper">{c.label}</p>
        <p className="mt-0.5 text-xs leading-snug text-mute">{c.hint}</p>
      </div>
    </li>
  );

  return (
    <div className="space-y-6">
      {/* score */}
      <div className="flex items-center gap-4 border border-line bg-panel p-4">
        <ScoreRing score={result.score} />
        <div>
          <p className="mono-label text-sunset">SEO score</p>
          <p className="mt-1 font-display text-2xl font-bold text-paper">{label}</p>
          <p className="mono-label mt-1 !tracking-normal text-mute">
            {passed}/{required.length} checks passed · {result.words} words
          </p>
        </div>
      </div>

      {/* fields */}
      <div className="space-y-4 border border-line bg-panel p-4">
        <div>
          <label className={labelCls} htmlFor="kw">Focus keyword</label>
          <input id="kw" value={fields.keyword} onChange={(e) => setField("keyword", e.target.value)} placeholder="e.g. how to save game gta 6" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="sec">Secondary / LSI keywords (comma separated)</label>
          <input
            id="sec"
            value={secondaryText}
            onChange={(e) => {
              setSecondaryText(e.target.value);
              setField("secondaryKeywords", e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
            }}
            placeholder="gta 6 autosave, gta 6 manual save"
            className={inputCls}
          />
        </div>

        <div>
          <div className="flex items-end justify-between">
            <label className={labelCls} htmlFor="seot">SEO title</label>
            <span className={`mono-label mb-1.5 !tracking-normal ${counterTone(effectiveTitle.length, 30, 60)}`}>{effectiveTitle.length}/60</span>
          </div>
          <input id="seot" value={fields.seoTitle} onChange={(e) => setField("seoTitle", e.target.value)} placeholder={fields.title || "Defaults to the post title"} className={inputCls} />
        </div>

        <div>
          <div className="flex items-end justify-between">
            <label className={labelCls} htmlFor="slug">URL slug</label>
            <button type="button" onClick={regenSlug} className="mono-label mb-1.5 text-mute hover:text-sunset">Regenerate</button>
          </div>
          <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={`${inputCls} font-mono text-xs`} />
        </div>

        <div>
          <div className="flex items-end justify-between">
            <label className={labelCls} htmlFor="meta">Meta description</label>
            <span className={`mono-label mb-1.5 !tracking-normal ${counterTone(fields.description.length, 145, 160)}`}>{fields.description.length}/160</span>
          </div>
          <textarea id="meta" value={fields.description} onChange={(e) => setField("description", e.target.value)} rows={3} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="cat">Category</label>
            <select id="cat" value={fields.category} onChange={(e) => setField("category", e.target.value)} className={inputCls}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="schema">Schema type</label>
            <select
              id="schema"
              value={fields.type}
              onChange={(e) => setField("type", e.target.value as PostFields["type"])}
              className={inputCls}
            >
              <option value="article">Article</option>
              <option value="qa">FAQPage</option>
              <option value="howto">HowTo</option>
            </select>
          </div>
        </div>
      </div>

      <Serp title={effectiveTitle} slug={slug} description={fields.description} />

      {/* checklist */}
      <div className="border border-line bg-panel">
        <p className="mono-label border-b border-line px-4 py-3 text-sunset">Live SEO checklist</p>
        <ul className="px-4">{required.map(row)}</ul>
        <button type="button" onClick={() => setShowExtra((v) => !v)} className="mono-label flex w-full items-center justify-between border-t border-line px-4 py-3 text-mute hover:text-paper">
          Additional checks ({extra.filter((c) => c.status === "pass").length}/{extra.length})
          <ChevronDown className={`h-4 w-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
        </button>
        {showExtra && <ul className="border-t border-line px-4">{extra.map(row)}</ul>}
      </div>
    </div>
  );
}
