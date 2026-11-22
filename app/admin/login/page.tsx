import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="px-4">
      <LoginForm configured={adminConfigured()} />
    </main>
  );
}
