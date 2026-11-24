import Link from "next/link";
import { getCategory, postPath } from "@/lib/site";
import { formatDate, type PostMeta } from "@/lib/posts";
import { pad } from "@/lib/text";
import Thumb from "./Thumb";

type Variant = "lead" | "stack" | "row" | "tile";

export function Kicker({ post, index }: { post: PostMeta; index?: number }) {
  const cat = getCategory(post.category);
  return (
    <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1">
      {index !== undefined && <span className="text-mute">Case file // {pad(index)}</span>}
      <span className={cat?.text ?? "text-sunset"}>{cat?.short ?? "Guide"}</span>
    </p>
  );
}

export function MetaLine({ post }: { post: PostMeta }) {
  return (
    <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
      <span className="text-neon-cyan">Verified</span>
      <span>{post.readingMinutes} min</span>
      <time dateTime={post.updated}>Upd. {formatDate(post.updated)}</time>
    </p>
  );
}

export default function PostCard({
  post,
  variant = "tile",
  index,
}: {
  post: PostMeta;
  variant?: Variant;
  index?: number;
}) {
  const href = postPath(post.slug);

  if (variant === "lead") {
    return (
      <Link href={href} className="group block">
        <div className="relative aspect-[16/9] overflow-hidden border border-line">
          <Thumb post={post} sizes="(min-width: 1024px) 760px, 100vw" priority />
          <span className="mono-label absolute left-0 top-0 bg-sunset px-3 py-2 text-base">Lead story</span>
        </div>
        <div className="mt-5">
          <Kicker post={post} index={index} />
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight text-paper sm:text-5xl">
            <span className="link-rule">{post.title}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">{post.description}</p>
          <div className="mt-5">
            <MetaLine post={post} />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "stack") {
    return (
      <Link href={href} className="group flex gap-4 border-b border-line py-5 first:pt-0 last:border-b-0">
        <span className="font-display text-4xl font-bold leading-none text-line transition-colors group-hover:text-sunset">
          {pad(index ?? 0)}
        </span>
        <div className="min-w-0">
          <Kicker post={post} />
          <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-paper">
            <span className="link-rule">{post.title}</span>
          </h3>
          <div className="mt-3">
            <MetaLine post={post} />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className="group grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
        <div className="relative aspect-[4/3] overflow-hidden border border-line">
          <Thumb post={post} sizes="176px" />
        </div>
        <div className="min-w-0">
          <Kicker post={post} />
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-paper sm:text-2xl">
            <span className="link-rule">{post.title}</span>
          </h3>
          <p className="mt-2 hidden text-sm leading-relaxed text-mute sm:line-clamp-2 sm:block">{post.description}</p>
          <div className="mt-3">
            <MetaLine post={post} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex h-full flex-col border border-line bg-panel transition-colors hover:border-sunset">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <Thumb post={post} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Kicker post={post} />
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-paper">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mute">{post.description}</p>
        <div className="mt-auto pt-4">
          <MetaLine post={post} />
        </div>
      </div>
    </Link>
  );
}
