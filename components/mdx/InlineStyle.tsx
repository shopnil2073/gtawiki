import type { ReactNode } from "react";

// Only hex colors are accepted (#rgb, #rgba, #rrggbb, #rrggbbaa), so nothing else can reach the style attribute.
const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** <Color value="#ff7a45">text</Color>: colored text. Inserted by the admin editor. */
export function Color({ value, children }: { value?: string; children?: ReactNode }) {
  return <span style={value && HEX.test(value) ? { color: value } : undefined}>{children}</span>;
}

/** <Highlight value="#ff7a4540">text</Highlight>: text with a background highlight. */
export function Highlight({ value, children }: { value?: string; children?: ReactNode }) {
  return (
    <mark
      style={{
        backgroundColor: value && HEX.test(value) ? value : undefined,
        color: "inherit",
        padding: "0.05em 0.3em",
        borderRadius: "2px",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </mark>
  );
}

const ALIGN = new Set(["left", "center", "right", "justify"]);

/**
 * <Align value="center">text</Align>: aligns the paragraph or heading it sits in.
 * Rendered as a block-level <span> so it stays valid HTML inside <p> and <h2>.
 */
export function Align({ value, children }: { value?: string; children?: ReactNode }) {
  const textAlign = value && ALIGN.has(value) ? (value as "left" | "center" | "right" | "justify") : undefined;
  return <span style={{ display: "block", textAlign }}>{children}</span>;
}
