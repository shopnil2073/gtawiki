"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { categories, legalLinks } from "@/lib/site";
import { pad } from "@/lib/text";

/** Bottom sheet "Index": thumb-friendly full list of sections. */
export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Site index"
        className={`absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto border-t-2 border-sunset bg-panel pb-[env(safe-area-inset-bottom)] transition-all duration-300 ${
          open ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-panel px-4 py-3">
          <p className="mono-label text-sunset">Index // all sections</p>
          <button type="button" onClick={onClose} aria-label="Close index" className="grid h-10 w-10 place-items-center border border-line text-paper">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul>
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={c.slug} className="border-b border-line">
                <Link href={`/category/${c.slug}`} onClick={onClose} className="flex items-center gap-4 px-4 py-4 active:bg-white/5">
                  <span className="mono-label w-6 text-mute">{pad(i + 1)}</span>
                  <Icon className={`h-5 w-5 ${c.text}`} />
                  <span className="font-display text-lg font-semibold text-paper">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 px-4 py-5">
          {legalLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={onClose} className="mono-label text-mute">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
