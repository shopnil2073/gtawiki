import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pagePath } from "@/lib/site";

function windowed(current: number, total: number): (number | null)[] {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}

/** "See more / Next →" plus numbered pages. Page 1 is "/", the rest are "/page/2", "/page/3" ... */
export default function Pagination({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null;
  const items = windowed(current, total);
  const box = "mono-label grid h-11 min-w-11 place-items-center border px-3";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {current > 1 && (
          <Link href={pagePath(current - 1)} rel="prev" className={`${box} gap-2 border-line text-paper hover:border-sunset hover:text-sunset`}>
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </span>
          </Link>
        )}
        {items.map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} className={`${box} border-transparent text-mute`} aria-hidden>
              …
            </span>
          ) : n === current ? (
            <span key={n} aria-current="page" className={`${box} border-sunset bg-sunset text-base`}>
              {n}
            </span>
          ) : (
            <Link key={n} href={pagePath(n)} aria-label={`Page ${n}`} className={`${box} border-line text-paper hover:border-sunset hover:text-sunset`}>
              {n}
            </Link>
          ),
        )}
      </div>

      {current < total && (
        <Link
          href={pagePath(current + 1)}
          rel="next"
          className="mono-label inline-flex h-11 items-center gap-2 bg-sunset px-5 text-base transition hover:brightness-110"
        >
          See more / Next <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </nav>
  );
}
