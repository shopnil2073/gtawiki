import type { ReactNode } from "react";
import { Plus } from "lucide-react";

/**
 * Native <details> accordion: works without JavaScript and stays crawlable.
 * lib/posts.ts reads these blocks from the MDX source to build FAQPage schema.
 * Usage: <QaBlock q="Question here?">Answer here.</QaBlock>
 */
export default function QaBlock({ q, children }: { q: string; children?: ReactNode }) {
  return (
    <details className="group my-0 border-b border-line first-of-type:border-t">
      <summary className="flex cursor-pointer list-none items-start gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <span className="mono-label mt-1 text-sunset">Q.</span>
        <span className="flex-1 font-display text-lg font-semibold leading-snug text-paper">{q}</span>
        <Plus className="mt-1 h-5 w-5 shrink-0 text-mute transition-transform group-open:rotate-45 group-open:text-sunset" />
      </summary>
      <div className="space-y-3 pb-5 pl-9 text-paper/85">{children}</div>
    </details>
  );
}
