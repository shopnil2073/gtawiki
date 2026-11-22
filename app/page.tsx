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
  const tickerPosts = (trending.length > 0 ? trending : posts).slice(0, 8);
  const rest = posts.slice(4, 4 + 8);

  const indexItems = categories.map((c) => ({
    slug: c.slug,
    count: counts[c.slug] ?? 0,
    latest: posts.filter((p) => p.category === c.slug).slice(0, 3).map((p) => ({ title: p.title, slug: p.slug })),
  }));

  return (
    <div>
      {/* Ticker */}
      <div className="ticker overflow-hidden border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-stretch">
          <span className="mono-label z-10 shrink-0 bg-neon-pink px-4 py-3 text-base">Trending Q&amp;A</span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="ticker-track">
              {[0, 1].map((dup) => (
                <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                  {tickerPosts.length === 0 ? (
                    <li className="mono-label px-6 text-mute">New files incoming // check back soon</li>
                  ) : (
                    tickerPosts.map((p) => (
                      <li key={p.slug} className="flex items-center">
                        <Link href={`/guides/${p.slug}`} className="mono-label whitespace-nowrap px-6 py-3 text-paper hover:text-sunset">
                          {p.title}
                        </Link>
                        <span className="text-line">/</span>
                      </li>
                    ))
                  )}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>

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

      {/* Positioning strip */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="grid border border-line md:grid-cols-3">
          {[
            ["01", "Checked in-game", "Gameplay claims are tested or traced to an official Rockstar source."],
            ["02", "Leaks are labeled", "Rumors never pass as fact, and we never host stolen files."],
            ["03", "Always current", "Every guide shows when it was last updated, and we revise after patches."],
          ].map(([n, t, d]) => (
            <div key={n} className="border-b border-line p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <p className="mono-label text-sunset">{n}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-paper">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-mute">
          Read the full <Link href="/editorial-policy" className="text-paper underline decoration-sunset underline-offset-4">editorial policy</Link>.
        </p>
      </section>
    </div>
  );
}
