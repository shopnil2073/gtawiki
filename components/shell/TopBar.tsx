"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Logo from "./Logo";
import { categories } from "@/lib/site";

export default function TopBar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base">
      <div className="hidden border-b border-line md:block">
        <div className="mono-label mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-mute">
          <span>Leonida database // unofficial fan wiki</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse bg-neon-pink" />
            Live coverage
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search GTA 6 guides"
          className="ml-auto flex h-10 items-center gap-3 border border-line px-3 text-sm text-mute transition-colors hover:border-sunset hover:text-paper md:ml-8 md:w-full md:max-w-md"
        >
          <Search className="h-4 w-4" />
          <span className="hidden flex-1 text-left md:block">Search the database…</span>
          <kbd className="mono-label hidden border border-line px-1.5 py-1 md:block">Ctrl K</kbd>
        </button>
      </div>

      <nav aria-label="Sections" className="hidden border-t border-line md:block">
        <ul className="no-scrollbar mx-auto flex max-w-6xl overflow-x-auto px-6">
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
      <div className="stripe" />
    </header>
  );
}

function NavItem({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`mono-label -mb-px inline-block whitespace-nowrap border-b-2 px-3 py-3.5 transition-colors ${
        active ? "border-sunset text-paper" : "border-transparent text-mute hover:text-paper"
      }`}
    >
      {children}
    </Link>
  );
}
