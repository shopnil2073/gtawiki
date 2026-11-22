"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Home, LayoutGrid, ListChecks, Search } from "lucide-react";

type Props = { onSearch: () => void; onMenu: () => void };

export default function MobileNav({ onSearch, onMenu }: Props) {
  const pathname = usePathname();
  const cell = (active: boolean) =>
    `mono-label flex h-full flex-col items-center justify-center gap-1.5 border-t-2 text-[10px] ${
      active ? "border-sunset text-paper" : "border-transparent text-mute"
    }`;

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        <li>
          <Link href="/" className={cell(pathname === "/")}>
            <Home className="h-5 w-5" />
            Front
          </Link>
        </li>
        <li>
          <Link href="/category/how-to" className={cell(pathname.startsWith("/category/how-to"))}>
            <ListChecks className="h-5 w-5" />
            Guides
          </Link>
        </li>
        <li className="relative">
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search"
            className="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-4 place-items-center border-4 border-base bg-sunset text-base active:translate-y-[-14px]"
          >
            <Search className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </li>
        <li>
          <Link href="/category/q-and-a" className={cell(pathname.startsWith("/category/q-and-a"))}>
            <HelpCircle className="h-5 w-5" />
            Q&amp;A
          </Link>
        </li>
        <li>
          <button type="button" onClick={onMenu} className={`${cell(false)} w-full`}>
            <LayoutGrid className="h-5 w-5" />
            Index
          </button>
        </li>
      </ul>
    </nav>
  );
}
