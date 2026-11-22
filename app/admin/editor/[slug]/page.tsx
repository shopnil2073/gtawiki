import { notFound, redirect } from "next/navigation";
import Editor from "@/components/admin/Editor";
import { isAdmin } from "@/lib/admin-auth";
import { loadPost, postToFields } from "@/lib/admin-posts";
import { cloudinaryConfig } from "@/lib/cloudinary";
import { storeMode } from "@/lib/content-store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  return (
    <Editor
      isNew={false}
      initialSlug={slug}
      initialFields={postToFields(post)}
      initialBody={post.content.replace(/^\s+/, "")}
      storage={storeMode()}
      cloudinaryReady={Boolean(cloudinaryConfig())}
    />
  );
}
