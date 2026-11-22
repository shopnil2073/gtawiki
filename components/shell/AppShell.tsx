"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import CommandSearch from "./CommandSearch";
import Footer from "./Footer";
import type { SearchItem } from "@/lib/search-index";

export default function AppShell({
  children,
  searchItems,
}: {
  children: React.ReactNode;
  searchItems: SearchItem[];
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The admin has its own chrome: no public header, footer or dock there.
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-sunset focus:px-4 focus:py-2 focus:text-base"
      >
        Skip to content
      </a>

      <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <TopBar onSearch={() => setSearchOpen(true)} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>

      <MobileNav onSearch={() => setSearchOpen(true)} onMenu={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} items={searchItems} />
    </>
  );
}
