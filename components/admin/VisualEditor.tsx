"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { blockToHtml, htmlToMdx, mdxToHtml } from "@/lib/editor-convert";
import LinkPopover, { type Rect } from "./LinkPopover";

export type VisualHandle = {
  getMdx: () => string;
  insertMdx: (raw: string) => void;
  exec: (command: string, value?: string) => void;
  /** Opens the floating link editor for the current selection or the link under the caret. */
  openLinkEditor: () => void;
};

type Props = {
  initialBody: string;
  onChange: (mdx: string) => void;
  onEditBlock: (raw: string, apply: (next: string) => void) => void;
};

type LinkState = {
  id: number;
  el: HTMLAnchorElement | null;
  mode: "new" | "edit";
  href: string;
  text: string;
  needText: boolean;
  /** pinned = opened by click / Ctrl+K / toolbar (stays until Esc, outside click or Apply). Not pinned = hover preview. */
  pinned: boolean;
  getRect: () => Rect;
};

const TABLE_HTML =
  "<table><thead><tr><th>Column</th><th>Column</th><th>Column</th></tr></thead>" +
  "<tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>";

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s: string) => escHtml(s).replace(/"/g, "&quot;");

const rectOf = (node: Element): Rect => {
  const r = node.getBoundingClientRect();
  return { top: r.top, left: r.left, bottom: r.bottom, right: r.right };
};

const VisualEditor = forwardRef<VisualHandle, Props>(function VisualEditor({ initialBody, onChange, onEditBlock }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const saved = useRef<Range | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [link, setLink] = useState<LinkState | null>(null);
  const linkId = useRef(0);
  const hoverTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const overLink = useRef(false);
  const overPopover = useRef(false);

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

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function emitSoon() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (el.current) onChangeRef.current(htmlToMdx(el.current.innerHTML));
    }, 250);
  }

  /** Removes one inline style (color or background-color) from every styled span touched by the selection. */
  function clearInline(prop: "color" | "background-color") {
    const root = el.current;
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    root.querySelectorAll<HTMLElement>("span[style], font").forEach((node) => {
      if (!range.intersectsNode(node)) return;
      if (node.tagName === "FONT" && prop === "color") node.removeAttribute("color");
      node.style.removeProperty(prop);
      if (!node.getAttribute("style")) node.removeAttribute("style");
      node.removeAttribute("data-fmt");
      const empty = node.attributes.length === 0;
      if (empty) {
        const parent = node.parentNode;
        while (parent && node.firstChild) parent.insertBefore(node.firstChild, node);
        node.remove();
      }
    });
  }

  function restoreCaret() {
    el.current?.focus();
    const sel = window.getSelection();
    if (sel && saved.current) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  }

  // ------------------------------------------------------------ links

  function anchorOf(node: Node | null): HTMLAnchorElement | null {
    const element = node instanceof Element ? node : (node?.parentElement ?? null);
    const a = element?.closest("a") as HTMLAnchorElement | null;
    return a && el.current?.contains(a) ? a : null;
  }

  function openLinkAt(a: HTMLAnchorElement, pinned: boolean) {
    window.clearTimeout(closeTimer.current);
    setLink({
      id: ++linkId.current,
      el: a,
      mode: "edit",
      href: a.getAttribute("href") ?? "",
      text: a.textContent ?? "",
      needText: false,
      pinned,
      getRect: () => rectOf(a),
    });
  }

  function openLinkEditor() {
    const root = el.current;
    if (!root) return;
    let range: Range | null = saved.current && root.contains(saved.current.commonAncestorContainer) ? saved.current : null;
    if (!range) {
      root.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && root.contains(sel.anchorNode)) range = sel.getRangeAt(0).cloneRange();
    }
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(root);
      range.collapse(false);
      saved.current = range.cloneRange();
    }
    const existing = anchorOf(range.startContainer) ?? anchorOf(range.endContainer);
    if (existing) return openLinkAt(existing, true);

    const r = range;
    const collapsed = r.collapsed;
    setLink({
      id: ++linkId.current,
      el: null,
      mode: "new",
      href: "",
      text: collapsed ? "" : r.toString(),
      needText: collapsed,
      pinned: true,
      getRect: () => {
        const b = r.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) {
          const c = r.startContainer;
          return rectOf(c instanceof Element ? c : (c.parentElement ?? root));
        }
        return { top: b.top, left: b.left, bottom: b.bottom, right: b.right };
      },
    });
  }

  function applyLink(url: string, text: string) {
    const st = link;
    if (!st) return;
    if (st.el) {
      st.el.setAttribute("href", url);
    } else {
      restoreCaret();
      if (st.needText) {
        document.execCommand("insertHTML", false, `<a href="${escAttr(url)}">${escHtml(text || url)}</a> `);
      } else {
        document.execCommand("createLink", false, url);
      }
    }
    setLink(null);
    emitSoon();
  }

  function removeLink() {
    const a = link?.el;
    if (a && a.parentNode) {
      const parent = a.parentNode;
      while (a.firstChild) parent.insertBefore(a.firstChild, a);
      a.remove();
    }
    setLink(null);
    emitSoon();
  }

  function openLinkInNewTab(url: string) {
    try {
      window.open(new URL(url, window.location.origin).href, "_blank", "noopener,noreferrer");
    } catch {
      /* invalid URL: nothing to open */
    }
  }

  const closeLink = useCallback(() => setLink(null), []);

  function scheduleSoftClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      if (overPopover.current || overLink.current) return;
      setLink((cur) => (cur && !cur.pinned ? null : cur));
    }, 350);
  }

  function onMouseOver(e: React.MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia("(hover: hover)").matches) return; // touch screens: tap instead
    const a = anchorOf(e.target as Node);
    if (!a) return;
    overLink.current = true;
    window.clearTimeout(closeTimer.current);
    if (link?.pinned) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => openLinkAt(a, false), 300);
  }

  function onMouseOut(e: React.MouseEvent<HTMLDivElement>) {
    if (!anchorOf(e.target as Node)) return;
    overLink.current = false;
    window.clearTimeout(hoverTimer.current);
    if (link && !link.pinned) scheduleSoftClose();
  }

  // ------------------------------------------------------------ imperative API

  useImperativeHandle(ref, () => ({
    getMdx: () => (el.current ? htmlToMdx(el.current.innerHTML) : ""),
    insertMdx: (raw: string) => {
      restoreCaret();
      document.execCommand("insertHTML", false, `${mdxToHtml(raw)}<p><br></p>`);
      emitSoon();
    },
    exec: (command: string, value?: string) => {
      restoreCaret();
      if (command === "insertTable") {
        document.execCommand("insertHTML", false, TABLE_HTML);
      } else if (command === "foreColor" || command === "hiliteColor") {
        // styleWithCSS makes the browser write <span style="color:…"> instead of <font>. It is switched
        // off again straight away so bold/italic keep producing <strong>/<em>.
        document.execCommand("styleWithCSS", false, "true");
        const ok = document.execCommand(command, false, value);
        if (!ok && command === "hiliteColor") document.execCommand("backColor", false, value);
        document.execCommand("styleWithCSS", false, "false");
      } else if (command === "clearColor") {
        clearInline("color");
      } else if (command === "clearHighlight") {
        clearInline("background-color");
      } else {
        // includes justifyLeft / justifyCenter / justifyRight / justifyFull
        document.execCommand(command, false, value);
      }
      emitSoon();
    },
    openLinkEditor,
  }));

  // ------------------------------------------------------------ events

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;

    // wiki block buttons (Edit / Remove)
    const actionEl = target.closest<HTMLElement>("[data-action]");
    const block = actionEl?.closest<HTMLElement>(".mdx-block");
    if (actionEl && block) {
      const action = actionEl.getAttribute("data-action");
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
      return;
    }

    // A tap or click on a link never navigates away from the editor: it opens the link editor instead.
    const a = anchorOf(target);
    if (a) {
      e.preventDefault();
      window.clearTimeout(hoverTimer.current);
      openLinkAt(a, true);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openLinkEditor();
    }
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    // caret moved into a link with the keyboard: show a hover-style preview
    if (!/^(Arrow|Home|End|Page)/.test(e.key)) return;
    const sel = window.getSelection();
    const a = sel && sel.rangeCount > 0 && sel.isCollapsed ? anchorOf(sel.anchorNode) : null;
    if (a) {
      if (!link?.pinned) openLinkAt(a, false);
    } else if (link && !link.pinned) {
      setLink(null);
    }
  }

  function onInput() {
    if (link && !link.pinned) setLink(null);
    emitSoon();
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    // Clean pasted content: HTML -> Markdown -> clean HTML (kills Word/Docs junk styles).
    const clean = html ? mdxToHtml(htmlToMdx(html, false)) : mdxToHtml(text);
    document.execCommand("insertHTML", false, clean);
    emitSoon();
  }

  return (
    <>
      <div
        ref={el}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        role="textbox"
        aria-multiline="true"
        aria-label="Post content"
        onInput={onInput}
        onBlur={() => {
          window.clearTimeout(timer.current);
          if (el.current) onChangeRef.current(htmlToMdx(el.current.innerHTML));
        }}
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPaste={onPaste}
        className="wiki-prose visual-surface border border-line bg-base p-5"
      />

      {link && (
        <LinkPopover
          key={link.id}
          getRect={link.getRect}
          mode={link.mode}
          initialUrl={link.href}
          initialText={link.text}
          needText={link.needText}
          onApply={applyLink}
          onRemove={removeLink}
          onOpen={openLinkInNewTab}
          onClose={closeLink}
          onHover={(over) => {
            overPopover.current = over;
            if (over) window.clearTimeout(closeTimer.current);
            else scheduleSoftClose();
          }}
          onPin={() => setLink((cur) => (cur ? { ...cur, pinned: true } : cur))}
        />
      )}
    </>
  );
});

export default VisualEditor;
