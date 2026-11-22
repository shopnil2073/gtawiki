import type { Metadata } from "next";
import AdminBar from "@/components/admin/AdminBar";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: { absolute: "Admin | GTA Wiki" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-base">
      <AdminBar authed={authed} />
      {children}
    </div>
  );
}
