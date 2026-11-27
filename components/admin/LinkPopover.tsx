"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Link2Off, X } from "lucide-react";
import { normalizeUrl } from "@/lib/url";
import { inputCls, labelCls, popoverCls } from "./ui";

export type Rect = { top: number; left: number; bottom: number; right: number };

type Props = {
  /** Called on scroll/resize so the popover follows the link or selection. */
  getRect: () => Rect;
  mode: "new" | "edit";
  initialUrl: string;
  initialText?: string;
  /** No text is selected: also ask for the link text. */
  needText?: boolean;
  onApply: (url: string, text: string) => void;
  onRemove?: () => void;
  onOpen?: (url: string) => void;
  onClose: () => void;
  /** Hover tracking, so a hover-opened popover stays while the pointer is over it. */
  onHover?: (over: boolean) => void;
  /** Called when the user starts interacting (typing in the URL box). Pins a hover-opened popover. */
  onPin?: () => void;
};

const WIDTH = 340;

/**
 * Floating link editor. Rendered in a portal on <body> with fixed positioning, so neither the sticky
 * toolbar nor any scrolling container can clip it. Buttons are 44px tall on touch screens.
 */
export default function LinkPopover({
  getRect,
  mode,
  initialUrl,
  initialText = "",
  needText,
  onApply,
  onRemove,
  onOpen,
  onClose,
  onHover,
  onPin,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ top: -9999, left: -9999 });

  const place = () => {
    const el = ref.current;
    if (!el) return;
    const r = getRect();
    const h = el.offsetHeight;
    let top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - WIDTH - 8));
    setPos({ top, left });
  };

  useLayoutEffect(place, [mode, needText, error]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const outside = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", outside);
    document.addEventListener("touchstart", outside, { passive: true });
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("touchstart", outside);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  useEffect(() => {
    if (mode === "new") (needText ? undefined : urlRef.current)?.focus();
  }, [mode, needText]);

  function apply() {
    const res = normalizeUrl(url);
    if (res.error !== undefined) return setError(res.error);
    if (needText && !text.trim()) return setError("Enter the link text.");
    onApply(res.url, text.trim());
  }

  const touchBtn =
    "mono-label inline-flex min-h-9 items-center justify-center gap-1.5 border border-line px-3 text-paper hover:border-sunset hover:text-sunset [@media(pointer:coarse)]:min-h-11";

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={mode === "edit" ? "Edit link" : "Add link"}
      style={{ top: pos.top, left: pos.left, width: `min(${WIDTH}px, calc(100vw - 16px))` }}
      className={`${popoverCls} p-3`}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      <div className="flex items-center justify-between">
        <p className="mono-label text-sunset">{mode === "edit" ? "Edit link" : "Add link"}</p>
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center text-mute hover:text-paper">
          <X className="h-4 w-4" />
        </button>
      </div>

      {needText && (
        <div className="mt-3">
          <label className={labelCls} htmlFor="lp-text">
            Link text
          </label>
          <input
            id="lp-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            className={inputCls}
            autoFocus
          />
        </div>
      )}

      <div className="mt-3">
        <label className={labelCls} htmlFor="lp-url">
          URL
        </label>
        <div className="flex gap-2">
          <input
            id="lp-url"
            ref={urlRef}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            onFocus={() => onPin?.()}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            placeholder="Paste a URL or /post-slug"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={inputCls}
          />
          <button type="button" onClick={apply} className="mono-label shrink-0 bg-sunset px-4 text-base hover:brightness-110 [@media(pointer:coarse)]:min-h-11">
            Apply
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-neon-pink">{error}</p>}
      </div>

      {mode === "edit" && (
        <div className="mt-3 flex gap-2">
          <button type="button" className={`${touchBtn} flex-1`} onClick={() => onOpen?.(url)}>
            <ExternalLink className="h-3.5 w-3.5" /> Open link
          </button>
          <button type="button" className={`${touchBtn} flex-1 hover:!border-neon-pink hover:!text-neon-pink`} onClick={() => onRemove?.()}>
            <Link2Off className="h-3.5 w-3.5" /> Unlink
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
