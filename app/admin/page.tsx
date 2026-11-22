import { redirect } from "next/navigation";
import PostManager from "@/components/admin/PostManager";
import { isAdmin } from "@/lib/admin-auth";
import { listSummaries, type PostSummary } from "@/lib/admin-posts";
import { storeMode } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");

  let posts: PostSummary[] = [];
  let error = "";
  try {
    posts = await listSummaries();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load posts.";
  }
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8">
      <PostManager initialPosts={posts} mode={storeMode()} loadError={error} />
    </main>
  );
}
