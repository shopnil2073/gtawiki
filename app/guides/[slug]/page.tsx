import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { extractFaq, extractSteps, getAllPosts, getPostBySlug } from "@/lib/posts";
import { articleSchema, breadcrumbSchema, faqSchema, howToSchema } from "@/lib/schema";
import { getCategory } from "@/lib/site";
import JsonLd from "@/components/seo/JsonLd";
import ArticleView from "@/components/seo/ArticleView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `/guides/${post.slug}`;
  const title = post.seoTitle || post.title;
  return {
    // absolute: what you type in the SEO title field is exactly what Google sees (no "| GTA Wiki" suffix)
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: post.author }],
    keywords: [post.keyword, ...post.secondaryKeywords].filter(Boolean),
    openGraph: {
      type: "article",
      url,
      title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      ...(post.image ? { images: [{ url: post.image, alt: post.imageAlt ?? post.title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description: post.description },
    robots: post.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = getCategory(post.category);
  const faq = post.type === "qa" || post.type === "article" ? extractFaq(post.content) : [];
  const steps = post.type === "howto" ? extractSteps(post.content) : [];

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          ...(cat ? [{ name: cat.label, href: `/category/${cat.slug}` }] : []),
          { name: post.title, href: `/guides/${post.slug}` },
        ])}
      />
      {faq.length > 0 && <JsonLd data={faqSchema(faq)} />}
      {steps.length > 0 && <JsonLd data={howToSchema(post, steps)} />}
      <ArticleView post={post} />
    </>
  );
}
