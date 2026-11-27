import Link from "next/link";
import { categories } from "@/lib/site";
import HomeSearchButton from "./HomeSearchButton";

/** Slim jump bar: sections on the left (scrolls sideways on phones), search on the right. */
export default function HomeCategoryBar() {
  return (
    <div className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <p className="mono-label hidden shrink-0 text-sunset sm:block">Jump to</p>
        <nav aria-label="Browse sections" className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="mono-label shrink-0 border border-line px-3 py-2.5 text-mute transition-colors hover:border-sunset hover:text-paper"
            >
              {c.short}
            </Link>
          ))}
        </nav>
        <HomeSearchButton />
      </div>
    </div>
  );
}
