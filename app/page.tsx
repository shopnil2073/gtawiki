import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, siteConfig } from "@/lib/site";
import { getAllPosts, getCategoryCounts } from "@/lib/posts";
import PostCard from "@/components/seo/PostCard";
import CategoryIndex from "@/components/seo/CategoryIndex";
import SectionHeading from "@/components/seo/SectionHeading";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const posts = getAllPosts();
  const counts = getCategoryCounts();
  const lead = posts[0];
  const stack = posts.slice(1, 4);
  const trending = posts.filter((p) => p.category === "q-and-a" || p.type === "qa");
  const tickerPosts = (trending.length > 0 ? trending : []).slice(0, 3);
  const rest = posts.slice(4, 4 + 8);

  const indexItems = categories.map((c) => ({
    slug: c.slug,
    count: counts[c.slug] ?? 0,
    latest: posts.filter((p) => p.category === c.slug).slice(0, 3).map((p) => ({ title: p.title, slug: p.slug })),
  }));

  return (
    <div>
      {/* Trending strip (static: no animation, no layout shift) */}
      {tickerPosts.length > 0 && (
        <div className="border-b border-line bg-panel">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            <span className="mono-label text-neon-pink">Trending Q&amp;A</span>
            {tickerPosts.slice(0, 3).map((p) => (
              <Link key={p.slug} href={`/guides/${p.slug}`} className="text-sm text-paper hover:text-sunset">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Masthead lead */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:pt-14" aria-label="Top stories">
        {lead ? (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <PostCard post={lead} variant="lead" index={posts.length} />
            </div>
            <aside className="lg:col-span-4 lg:border-l lg:border-line lg:pl-8">
              <p className="mono-label mb-5 text-sunset">The dossier stack</p>
              {stack.length === 0 ? (
                <p className="text-sm text-mute">More files are being verified. Check back soon.</p>
              ) : (
                stack.map((p, i) => <PostCard key={p.slug} post={p} variant="stack" index={posts.length - 1 - i} />)
              )}
              <Link
                href="/category/how-to"
                className="mono-label mt-6 inline-flex items-center gap-2 text-paper hover:text-sunset"
              >
                Browse all guides <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        ) : (
          <div className="max-w-3xl">
            <p className="mono-label text-sunset">Grand Theft Auto VI // unofficial wiki</p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[0.98] tracking-tight text-paper sm:text-7xl">
              The Leonida database
            </h1>
            <p className="mt-5 text-lg text-mute">{siteConfig.description}</p>
          </div>
        )}
      </section>

      {/* Category index */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6" aria-labelledby="index">
        <SectionHeading kicker="Find your way around" title="The index" id="index" />
        <CategoryIndex items={indexItems} />
      </section>

      {/* Latest feed */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6" aria-labelledby="latest">
          <SectionHeading kicker="Fresh off the desk" title="Latest verified guides" id="latest" />
          <div className="grid gap-x-10 lg:grid-cols-2">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} variant="row" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
