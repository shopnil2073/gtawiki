import { getHomeData } from "@/lib/posts";
import FeaturedHero from "./FeaturedHero";
import FeedCard from "./FeedCard";
import HomeCategoryBar from "./HomeCategoryBar";
import Pagination from "./Pagination";
import PostCard from "./PostCard";
import SectionHeading from "./SectionHeading";

/** Homepage layout, shared by "/" (page 1) and "/page/[num]" (page 2+). */
export default function HomeFeed({ page }: { page: number }) {
  const { featured, items, page: current, totalPages, popular, total } = getHomeData(page);
  const first = current === 1;

  return (
    <div>
      <h1 className="sr-only">GTA Wiki: GTA 6 guides, answers and news</h1>
      <HomeCategoryBar />

      {total === 0 ? (
        <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <p className="mono-label text-sunset">Grand Theft Auto VI // unofficial wiki</p>
          <p className="mt-4 font-display text-4xl font-bold text-paper">New guides are being verified.</p>
          <p className="mt-3 text-mute">Check back soon.</p>
        </section>
      ) : (
        <>
          {/* 1. Featured post */}
          {first && featured && (
            <section aria-label="Featured post" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:pt-10">
              <FeaturedHero post={featured} />
            </section>
          )}

          {/* 2. Latest posts feed, 10 per page */}
          {items.length > 0 && (
            <section aria-labelledby="latest" className={`mx-auto max-w-6xl px-4 sm:px-6 ${first ? "pt-12" : "pt-10"}`}>
              <SectionHeading
                kicker={first ? "Fresh off the desk" : `Page ${current} of ${totalPages}`}
                title="Latest posts"
                id="latest"
              />
              <div>
                {items.map((p) => (
                  <FeedCard key={p.slug} post={p} />
                ))}
              </div>
              <Pagination current={current} total={totalPages} />
            </section>
          )}

          {/* 3. Popular posts */}
          {first && popular.length > 0 && (
            <section aria-labelledby="popular" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
              <SectionHeading kicker="Most read" title="Popular posts" id="popular" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {popular.map((p) => (
                  <PostCard key={p.slug} post={p} variant="tile" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
