"use client";

import { Search } from "lucide-react";

/** Opens the same search palette as Ctrl+K (AppShell listens for that shortcut). */
export default function HomeSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
      className="mono-label inline-flex h-9 shrink-0 items-center gap-2 border border-line px-3 text-paper transition-colors hover:border-sunset hover:text-sunset"
    >
      <Search className="h-3.5 w-3.5" /> Search
    </button>
  );
}
