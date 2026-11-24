"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories, postPath } from "@/lib/site";
import { pad } from "@/lib/text";

type Item = { slug: string; count: number; latest: { title: string; slug: string }[] };

/** Interactive index: hover/focus a section on the left to preview its newest files on the right. */
export default function CategoryIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? "");
  const current = items.find((i) => i.slug === active);
  const cat = categories.find((c) => c.slug === active);

  return (
    <div className="grid border border-line lg:grid-cols-12">
      <ul className="lg:col-span-7 lg:border-r lg:border-line">
        {categories.map((c, i) => {
          const count = items.find((x) => x.slug === c.slug)?.count ?? 0;
          const on = active === c.slug;
          return (
            <li key={c.slug} className="border-b border-line last:border-b-0">
              <Link
                href={`/category/${c.slug}`}
                onMouseEnter={() => setActive(c.slug)}
                onFocus={() => setActive(c.slug)}
                className={`group flex items-center gap-4 border-l-2 px-4 py-4 transition-colors sm:px-5 ${
                  on ? "border-sunset bg-white/[0.04]" : "border-transparent"
                }`}
              >
                <span className="mono-label w-6 text-mute">{pad(i + 1)}</span>
                <span className="font-display text-lg font-semibold text-paper sm:text-xl">{c.label}</span>
                <span className="mono-label ml-auto whitespace-nowrap text-mute">
                  {count} {count === 1 ? "file" : "files"}
                </span>
                <ArrowUpRight className={`h-4 w-4 shrink-0 transition-transform ${on ? "translate-x-0.5 -translate-y-0.5 text-sunset" : "text-mute"}`} />
              </Link>
            </li>
          );
        })}
      </ul>

        <div className="hidden bg-panel p-6 lg:col-span-5 lg:block">
          {cat && current && (
            <>
              <cat.icon className={`h-7 w-7 ${cat.text}`} strokeWidth={1.5} />
              <p className="mono-label mt-5 text-mute">Section preview</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-paper">{cat.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{cat.description}</p>
              <p className="mono-label mt-6 text-sunset">Newest files</p>
              {current.latest.length === 0 ? (
                <p className="mt-3 text-sm text-mute">No files yet. Coming soon.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {current.latest.map((p) => (
                    <li key={p.slug}>
                      <Link href={postPath(p.slug)} className="text-sm text-paper hover:text-sunset">
                        → {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
    </div>
  );
}
