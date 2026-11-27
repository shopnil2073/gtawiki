"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import { popoverCls } from "./ui";

export type AlignValue = "left" | "center" | "right" | "justify";

const OPTIONS: { value: AlignValue; label: string; Icon: typeof AlignLeft }[] = [
  { value: "left", label: "Align Left", Icon: AlignLeft },
  { value: "center", label: "Align Center", Icon: AlignCenter },
  { value: "right", label: "Align Right", Icon: AlignRight },
  { value: "justify", label: "Justify", Icon: AlignJustify },
];

/** Alignment dropdown. Portal + fixed position, so the toolbar's scroll area never clips it. */
export default function AlignMenu({
  anchor,
  onPick,
  onClose,
}: {
  anchor: HTMLElement;
  onPick: (v: AlignValue) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const w = ref.current?.offsetWidth ?? 190;
    setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) });
  }, [anchor]);

  useEffect(() => {
    const outside = (e: Event) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.contains(t)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const scroll = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div ref={ref} role="menu" aria-label="Text alignment" style={{ top: pos.top, left: pos.left }} className={`${popoverCls} w-48 py-1`}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="menuitem"
          // keep the editor selection while clicking
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(value)}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-paper hover:bg-white/[0.06] hover:text-sunset [@media(pointer:coarse)]:py-3.5"
        >
          <Icon className="h-4 w-4 text-sunset" />
          {label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
