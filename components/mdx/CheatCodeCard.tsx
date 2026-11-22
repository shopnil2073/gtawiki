"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Platform = "ps5" | "xbox" | "pc";
const LABELS: Record<Platform, string> = { ps5: "PS5", xbox: "Xbox Series X|S", pc: "PC" };

type Props = {
  name: string;
  effect: string;
  codes: Partial<Record<Platform, string>>;
};

export default function CheatCodeCard({ name, effect, codes }: Props) {
  const available = (Object.keys(LABELS) as Platform[]).filter((p) => codes?.[p]);
  const [platform, setPlatform] = useState<Platform>(available[0] ?? "ps5");
  const [copied, setCopied] = useState(false);
  const code = codes?.[platform] ?? "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the code is still visible to copy by hand */
    }
  }

  if (available.length === 0) return null;

  return (
    <div className="my-6 border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <p className="mono-label text-neon-pink">Cheat code</p>
        <div role="tablist" aria-label="Platform" className="flex">
          {available.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={platform === p}
              onClick={() => setPlatform(p)}
              className={`mono-label border-b-2 px-3 py-2 ${
                platform === p ? "border-sunset text-paper" : "border-transparent text-mute hover:text-paper"
              }`}
            >
              {LABELS[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <p className="font-display text-xl font-bold text-paper">{name}</p>
        <p className="mt-1 text-sm text-mute">{effect}</p>
        <div className="mt-4 flex items-stretch border border-line bg-black">
          <code className="min-w-0 flex-1 break-words px-3 py-3 font-mono text-sm text-neon-cyan">{code}</code>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy cheat code"
            className="mono-label inline-flex shrink-0 items-center gap-2 border-l border-line px-4 text-paper hover:bg-sunset hover:text-base"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
