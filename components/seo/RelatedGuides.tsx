import PostCard from "./PostCard";
import type { PostMeta } from "@/lib/posts";

export default function RelatedGuides({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="related" className="mt-16">
      <div className="mb-5 border-b border-line pb-3">
        <p className="mono-label text-sunset">Keep reading</p>
        <h2 id="related" className="mt-2 font-display text-2xl font-bold text-paper">
          Related GTA 6 guides
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} variant="tile" />
        ))}
      </div>
    </section>
  );
}
