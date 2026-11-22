import Link from "next/link";
import { formatDate } from "@/lib/posts";

export default function AuthorBox({
  author,
  published,
  updated,
}: {
  author: string;
  published: string;
  updated: string;
}) {
  return (
    <aside className="mt-14 grid gap-4 border border-line bg-panel p-5 sm:grid-cols-[auto_1fr]">
      <div className="grid h-14 w-14 place-items-center border border-sunset font-display text-2xl font-bold text-sunset">
        {author.charAt(0).toUpperCase()}
      </div>
      <div className="text-sm leading-relaxed">
        <p className="mono-label text-mute">Filed by</p>
        <p className="mt-1 font-display text-lg font-semibold text-paper">{author}</p>
        <p className="mt-2 text-mute">
          Every guide is checked against the game itself or an official Rockstar source before it is published,
          and unconfirmed details are labeled. Read our{" "}
          <Link href="/editorial-policy" className="text-paper underline decoration-sunset underline-offset-4">
            editorial policy
          </Link>
          .
        </p>
        <p className="mono-label mt-3 flex flex-wrap gap-x-4 gap-y-1 text-mute">
          <span>
            Published <time dateTime={published}>{formatDate(published)}</time>
          </span>
          <span>
            Updated <time dateTime={updated}>{formatDate(updated)}</time>
          </span>
          <span className="text-neon-cyan">Verified</span>
        </p>
      </div>
    </aside>
  );
}
