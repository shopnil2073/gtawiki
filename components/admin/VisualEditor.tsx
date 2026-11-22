"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { blockToHtml, htmlToMdx, mdxToHtml } from "@/lib/editor-convert";

export type VisualHandle = {
  getMdx: () => string;
  insertMdx: (raw: string) => void;
  exec: (command: string, value?: string) => void;
};

type Props = {
  initialBody: string;
  onChange: (mdx: string) => void;
  onEditBlock: (raw: string, apply: (next: string) => void) => void;
};

const TABLE_HTML =
  "<table><thead><tr><th>Column</th><th>Column</th><th>Column</th></tr></thead>" +
  "<tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>";

const VisualEditor = forwardRef<VisualHandle, Props>(function VisualEditor({ initialBody, onChange, onEditBlock }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const saved = useRef<Range | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Load the body once, when this editor mounts (switching modes remounts it).
  useEffect(() => {
    if (!el.current) return;
    el.current.innerHTML = mdxToHtml(initialBody) || "<p><br></p>";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remember the caret so toolbar / gallery buttons can insert where you were typing.
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && el.current?.contains(sel.anchorNode)) {
        saved.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function emitSoon() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (el.current) onChangeRef.current(htmlToMdx(el.current.innerHTML));
    }, 250);
  }

  function restoreCaret() {
    el.current?.focus();
    const sel = window.getSelection();
    if (sel && saved.current) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  }

  useImperativeHandle(ref, () => ({
    getMdx: () => (el.current ? htmlToMdx(el.current.innerHTML) : ""),
    insertMdx: (raw: string) => {
      restoreCaret();
      document.execCommand("insertHTML", false, `${mdxToHtml(raw)}<p><br></p>`);
      emitSoon();
    },
    exec: (command: string, value?: string) => {
      restoreCaret();
      if (command === "insertTable") document.execCommand("insertHTML", false, TABLE_HTML);
      else document.execCommand(command, false, value);
      emitSoon();
    },
  }));

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;
    const block = target.closest<HTMLElement>(".mdx-block");
    if (!block) return;
    const action = target.getAttribute("data-action");
    if (action === "remove") {
      block.remove();
      emitSoon();
    } else if (action === "edit") {
      const raw = decodeURIComponent(block.getAttribute("data-mdx") ?? "");
      onEditBlock(raw, (next) => {
        const holder = document.createElement("div");
        holder.innerHTML = blockToHtml(next);
        const fresh = holder.firstElementChild;
        if (fresh) block.replaceWith(fresh);
        emitSoon();
      });
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    // Clean pasted content: HTML -> Markdown -> clean HTML (kills Word/Docs junk styles).
    const clean = html ? mdxToHtml(htmlToMdx(html)) : mdxToHtml(text);
    document.execCommand("insertHTML", false, clean);
    emitSoon();
  }

  return (
    <div
      ref={el}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      aria-multiline="true"
      aria-label="Post content"
      onInput={emitSoon}
      onBlur={() => {
        window.clearTimeout(timer.current);
        if (el.current) onChangeRef.current(htmlToMdx(el.current.innerHTML));
      }}
      onClick={onClick}
      onPaste={onPaste}
      className="wiki-prose visual-surface border border-line bg-base p-5"
    />
  );
});

export default VisualEditor;
