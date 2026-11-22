"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

export default function AdminBar({ authed }: { authed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const editor = pathname.startsWith("/admin/editor");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-panel">
      <div className="stripe" />
      <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-5 px-4">
        <Link href="/admin" className="font-display text-lg font-bold uppercase tracking-tight text-paper">
          GTA<span className="text-sunset">Wiki</span> <span className="mono-label ml-1 text-mute">Admin</span>
        </Link>
        {authed && (
          <nav className="flex items-center gap-1">
            <Link href="/admin" className={`mono-label px-3 py-2 ${pathname === "/admin" ? "text-sunset" : "text-mute hover:text-paper"}`}>
              Posts
            </Link>
            <Link
              href="/admin/editor"
              className={`mono-label px-3 py-2 ${editor && pathname === "/admin/editor" ? "text-sunset" : "text-mute hover:text-paper"}`}
            >
              New post
            </Link>
          </nav>
        )}
        <div className="ml-auto flex items-center gap-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="mono-label inline-flex items-center gap-1.5 text-mute hover:text-paper">
            View site <ExternalLink className="h-3 w-3" />
          </a>
          {authed && (
            <button type="button" onClick={logout} className="mono-label inline-flex items-center gap-1.5 text-mute hover:text-neon-pink">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
