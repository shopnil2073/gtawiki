import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getCategory, postPath } from "@/lib/site";
import { formatDate, type PostMeta } from "@/lib/posts";
import Thumb from "./Thumb";

/** The one big post at the top of the homepage. The whole card is a single link. */
export default function FeaturedHero({ post }: { post: PostMeta }) {
  const cat = getCategory(post.category);
  return (
    <Link
      href={postPath(post.slug)}
      className="group grid overflow-hidden border border-line bg-panel transition-colors hover:border-sunset lg:grid-cols-12"
    >
      <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[24rem]">
        <Thumb post={post} sizes="(min-width: 1024px) 700px, 100vw" priority />
        <span className="mono-label absolute left-0 top-0 bg-sunset px-3 py-2 text-base">Featured post</span>
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:col-span-5">
        <p className={`mono-label ${cat?.text ?? "text-sunset"}`}>{cat?.label ?? "Guide"}</p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight text-paper sm:text-4xl">
          <span className="link-rule">{post.title}</span>
        </h2>
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-mute">{post.description}</p>

        <div className="mt-auto pt-6">
          <p className="mono-label flex flex-wrap items-center gap-x-4 gap-y-1 text-mute">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {post.readingMinutes} min read
            </span>
            <time dateTime={post.updated}>Updated {formatDate(post.updated)}</time>
          </p>
          <span className="mono-label mt-5 inline-flex items-center gap-2 bg-sunset px-5 py-3.5 text-base transition group-hover:brightness-110">
            Read the guide <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
