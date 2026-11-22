import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/site";
import { getPostsByCategory } from "@/lib/posts";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import PostCard from "@/components/seo/PostCard";
import AdSlot from "@/components/mdx/AdSlot";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  const url = `/category/${cat.slug}`;
  const title = `${cat.label}: GTA 6 Guides`;
  return {
    title,
    description: `${cat.description} Browse every GTA 6 ${cat.label.toLowerCase()} guide on GTA Wiki.`,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description: cat.description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();
  const posts = getPostsByCategory(cat.slug);
  const Icon = cat.icon;
  const idx = categories.findIndex((c) => c.slug === cat.slug) + 1;

  return (
    <div>
      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
          <Breadcrumbs
            items={[
              { name: "Front page", href: "/" },
              { name: cat.label, href: `/category/${cat.slug}` },
            ]}
          />
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className={`mono-label ${cat.text}`}>Section {String(idx).padStart(2, "0")}</p>
              <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight text-paper sm:text-7xl">
                {cat.label}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-mute">{cat.description}</p>
            </div>
            <Icon className={`hidden h-24 w-24 sm:block ${cat.text} opacity-70`} strokeWidth={0.8} />
          </div>
          <p className="mono-label mt-6 text-mute">
            {posts.length} {posts.length === 1 ? "file" : "files"} on record
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdSlot variant="header" />
        {posts.length === 0 ? (
          <div className="hatch border border-line p-10 text-center">
            <p className="mono-label text-sunset">Empty drawer</p>
            <p className="mt-3 text-mute">New {cat.label} guides are being verified. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} variant="tile" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
