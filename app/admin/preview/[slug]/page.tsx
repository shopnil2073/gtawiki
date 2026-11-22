import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { loadPost } from "@/lib/admin-posts";
import ArticleView from "@/components/seo/ArticleView";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function PreviewPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  return (
    <>
      <div className="mono-label flex flex-wrap items-center justify-between gap-3 border-b border-neon-pink bg-neon-pink/10 px-4 py-3 text-paper">
        <span>
          Preview // {post.draft ? "draft (not public)" : "published"} // reads the saved version
        </span>
        <Link href={`/admin/editor/${slug}`} className="text-sunset underline underline-offset-4">
          Back to editor
        </Link>
      </div>
      <ArticleView post={post} preview />
    </>
  );
}
