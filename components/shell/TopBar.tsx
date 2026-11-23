"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Logo from "./Logo";
import { categories } from "@/lib/site";

const POPULAR = ["q-and-a", "cheats-secrets", "map-locations", "release-specs"];

export default function TopBar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const popular = categories.filter((c) => POPULAR.includes(c.slug));

  return (
    <>
      {/* Row A: slim, sticky. Brand + sections + a small search icon. */}
      <header className="sticky top-0 z-40 border-b border-line bg-base">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Sections" className="hidden min-w-0 flex-1 md:block">
            <ul className="no-scrollbar flex overflow-x-auto">
              <li>
                <NavItem href="/" active={pathname === "/"}>
                  Front page
                </NavItem>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <NavItem href={`/category/${c.slug}`} active={pathname.startsWith(`/category/${c.slug}`)}>
                    {c.short}
                  </NavItem>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search guides"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center border border-line text-paper transition-colors hover:border-sunset hover:text-sunset md:ml-0"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        <div className="stripe" />
      </header>

      {/* Row B: utility strip with the compact search field (desktop). Scrolls away with the page. */}
      <div className="hidden border-b border-line bg-panel md:block">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between gap-6 px-6">
          <p className="mono-label flex min-w-0 items-center gap-4 text-mute">
            <span className="text-sunset">Popular</span>
            {popular.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="whitespace-nowrap hover:text-paper">
                {c.short}
              </Link>
            ))}
          </p>
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search guides"
            className="flex h-8 w-64 shrink-0 items-center gap-2 border border-line bg-base px-3 text-left text-sm text-mute transition-colors hover:border-sunset hover:text-paper"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search guides…</span>
            <kbd className="mono-label border border-line px-1.5 py-1">Ctrl K</kbd>
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`mono-label -mb-px inline-block whitespace-nowrap border-b-2 px-3 py-[1.1rem] transition-colors ${
        active ? "border-sunset text-paper" : "border-transparent text-mute hover:text-paper"
      }`}
    >
      {children}
    </Link>
  );
}
