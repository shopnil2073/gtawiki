import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getFileNumber, formatDate, getRelatedPosts, getToc, type Post } from "@/lib/posts";
import { getCategory, postPath } from "@/lib/site";
import { pad } from "@/lib/text";
import { mdxComponents } from "@/components/mdx";
import AdSlot from "@/components/mdx/AdSlot";
import Breadcrumbs from "./Breadcrumbs";
import AuthorBox from "./AuthorBox";
import RelatedGuides from "./RelatedGuides";
import Toc from "./Toc";
import ReadingProgress from "./ReadingProgress";

/** The article layout. Shared by the public guide page and the admin preview. */
export default function ArticleView({ post, preview = false }: { post: Post; preview?: boolean }) {
  const cat = getCategory(post.category);
  const toc = getToc(post.content);
  const related = preview ? [] : getRelatedPosts(post, 4);
  const fileNo = getFileNumber(post.slug);

  return (
    <div>
      <ReadingProgress />

      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <Breadcrumbs
            schema={false}
            items={[
              { name: "Front page", href: "/" },
              ...(cat ? [{ name: cat.label, href: `/category/${cat.slug}` }] : []),
              { name: post.title, href: postPath(post.slug) },
            ]}
          />

          <div className="grid gap-8 pb-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cat?.text ?? "text-sunset"}>{cat?.label}</span>
                {post.draft ? (
                  <span className="bg-neon-pink px-2 py-1 text-base">Draft</span>
                ) : (
                  <span className="border border-neon-cyan px-2 py-1 text-neon-cyan">Verified</span>
                )}
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight text-paper sm:text-6xl">
                {post.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute sm:text-xl">{post.description}</p>
            </div>

            <dl className="mono-label grid h-fit grid-cols-2 border border-line lg:col-span-4">
              {(
                [
                  ["File no.", fileNo ? pad(fileNo, 3) : "---"],
                  ["Read time", `${post.readingMinutes} min`],
                  ["Published", formatDate(post.date)],
                  ["Updated", formatDate(post.updated)],
                  ["Words", post.words.toLocaleString("en-US")],
                  ["Filed by", post.author],
                ] as const
              ).map(([k, v], i) => (
                <div key={k} className={`border-line p-3 ${i % 2 === 0 ? "border-r" : ""} ${i < 4 ? "border-b" : ""}`}>
                  <dt className="text-mute">{k}</dt>
                  <dd className="mt-1.5 !normal-case !tracking-normal text-sm text-paper">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {post.image && (
            <figure className="-mx-4 sm:mx-0">
              <div className="relative aspect-[21/9] border-y border-line sm:border">
                <Image
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  fill
                  priority
                  sizes="(min-width: 1152px) 1100px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mono-label px-4 py-3 text-mute sm:px-0">
                Fig. 01 // {post.imageAlt || post.title}
              </figcaption>
            </figure>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0 max-w-3xl">
          <AdSlot variant="header" />

          {toc.length > 1 && (
            <details className="mb-8 border border-line bg-panel p-4 xl:hidden">
              <summary className="mono-label cursor-pointer text-sunset">On this page</summary>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((t) => (
                  <li key={t.id} className={t.level === 3 ? "pl-4" : ""}>
                    <a href={`#${t.id}`} className="text-mute hover:text-paper">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="wiki-prose sections flow-root">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                // Props like rows={[...]} are JS expressions. Content is your own MDX (trusted),
                // so allow them; blockDangerousJS stays on to still block eval/require/process.
                blockJS: false,
                mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
              }}
            />
          </div>

          <AdSlot variant="in-article" />
          <AuthorBox author={post.author} published={post.date} updated={post.updated} />
          <RelatedGuides posts={related} />
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-32 space-y-8">
            <Toc items={toc} />
            <AdSlot variant="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
