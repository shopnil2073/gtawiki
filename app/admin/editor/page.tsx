import { redirect } from "next/navigation";
import Editor from "@/components/admin/Editor";
import { isAdmin } from "@/lib/admin-auth";
import { emptyFields } from "@/lib/admin-posts";
import { cloudinaryConfig } from "@/lib/cloudinary";
import { storeMode } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <Editor
      isNew
      initialSlug=""
      initialFields={emptyFields()}
      initialBody=""
      storage={storeMode()}
      cloudinaryReady={Boolean(cloudinaryConfig())}
    />
  );
}
