"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";

export default function CommandSearch({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: SearchItem[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    const words = q.split(/\s+/);
    return items
      .filter((i) => {
        const hay = `${i.title} ${i.keywords}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 8);
  }, [query, items]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 px-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search GTA Wiki"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden border border-line border-t-sunset border-t-2 bg-panel"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-sunset" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search the database…"
            className="h-14 flex-1 bg-transparent text-base text-paper placeholder:text-mute focus:outline-none"
          />
          <kbd className="mono-label border border-line px-1.5 py-1 text-mute">Esc</kbd>
        </div>

        <ul role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-mute">No results for “{query}”</li>
          )}
          {results.map((r, i) => (
            <li key={r.href} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.href)}
                className={`flex w-full items-center justify-between gap-3 border-l-2 px-3 py-2.5 text-left ${
                  i === active ? "border-sunset bg-white/[0.05]" : "border-transparent"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-paper">{r.title}</span>
                  <span className="mono-label mt-1 block text-mute">{r.section}</span>
                </span>
                {i === active && <CornerDownLeft className="h-4 w-4 text-mute" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
