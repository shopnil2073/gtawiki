import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getCategory, postPath } from "@/lib/site";
import { formatDate, type PostMeta } from "@/lib/posts";
import Thumb from "./Thumb";

/** One row of the "Latest posts" feed: thumbnail left, text right on desktop; stacked on mobile. */
export default function FeedCard({ post }: { post: PostMeta }) {
  const cat = getCategory(post.category);
  return (
    <Link
      href={postPath(post.slug)}
      className="group grid gap-4 border-b border-line py-6 first:pt-0 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-6"
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-line">
        <Thumb post={post} sizes="(min-width: 768px) 272px, 100vw" />
      </div>

      <div className="flex min-w-0 flex-col">
        <p className={`mono-label ${cat?.text ?? "text-sunset"}`}>{cat?.label ?? "Guide"}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-paper sm:text-2xl">
          <span className="link-rule">{post.title}</span>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mute sm:text-base">{post.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {post.readingMinutes} min
            </span>
            <time dateTime={post.updated}>{formatDate(post.updated)}</time>
          </p>
          <span className="mono-label inline-flex items-center gap-2 border border-line px-4 py-2.5 text-paper transition-colors group-hover:border-sunset group-hover:bg-sunset group-hover:text-base">
            Read More <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
