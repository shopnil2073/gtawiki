"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Swatch = { value: string; label: string };

type Props = {
  /** Button the popover hangs under (used for position and to ignore its own clicks). */
  anchor: HTMLElement | null;
  title: string;
  swatches: Swatch[];
  /** Highlight mode: custom picker gets an opacity slider so the highlight stays readable on dark. */
  withAlpha?: boolean;
  resetLabel: string;
  onPick: (value: string) => void;
  onReset: () => void;
  onClose: () => void;
};

const WIDTH = 252;

/** Rendered in a portal on <body> with fixed positioning, so the sticky/scrolling toolbar never clips it. */
export default function ColorPopover({ anchor, title, swatches, withAlpha, resetLabel, onPick, onReset, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState("#ff7a45");
  const [alpha, setAlpha] = useState(30);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({
      top: Math.min(r.bottom + 6, window.innerHeight - 330),
      left: Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8)),
    });
  }, [anchor]);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor?.contains(t)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const scroll = (e: Event) => {
      if (ref.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [anchor, onClose]);

  const customValue = withAlpha
    ? `${custom}${Math.round((alpha / 100) * 255).toString(16).padStart(2, "0")}`
    : custom;

  // keep the editor selection when clicking swatches
  const keepSelection = (e: React.MouseEvent) => e.preventDefault();

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      style={{ top: pos.top, left: pos.left, width: WIDTH }}
      className="fixed z-[110] border border-line border-t-2 border-t-sunset bg-panel p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]"
    >
      <p className="mono-label text-sunset">{title}</p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {swatches.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.label}
            aria-label={s.label}
            onMouseDown={keepSelection}
            onClick={() => onPick(s.value)}
            className="relative h-9 border border-line transition-transform hover:scale-110 hover:border-paper"
          >
            {/* checkerboard so semi-transparent highlights are visible */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundColor: "#0b0b0d", backgroundImage: "linear-gradient(45deg,#1b1b20 25%,transparent 25%,transparent 75%,#1b1b20 75%),linear-gradient(45deg,#1b1b20 25%,transparent 25%,transparent 75%,#1b1b20 75%)", backgroundSize: "8px 8px", backgroundPosition: "0 0,4px 4px" }}
            />
            <span aria-hidden className="absolute inset-0" style={{ backgroundColor: s.value }} />
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mono-label text-mute">Custom</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            aria-label="Custom color"
            className="h-9 w-12 cursor-pointer border border-line bg-base p-0.5"
          />
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-mute">{customValue}</code>
          <button type="button" onMouseDown={keepSelection} onClick={() => onPick(customValue)} className="mono-label border border-line px-3 py-2.5 text-paper hover:border-sunset hover:text-sunset">
            Apply
          </button>
        </div>
        {withAlpha && (
          <label className="mt-3 flex items-center gap-3 text-xs text-mute">
            Strength
            <input type="range" min={10} max={80} step={5} value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="flex-1 accent-[#ff7a45]" />
            <span className="w-9 text-right tabular-nums">{alpha}%</span>
          </label>
        )}
      </div>

      <button
        type="button"
        onMouseDown={keepSelection}
        onClick={onReset}
        className="mono-label mt-4 w-full border border-line py-2.5 text-mute hover:border-neon-pink hover:text-neon-pink"
      >
        {resetLabel}
      </button>
    </div>,
    document.body,
  );
}
