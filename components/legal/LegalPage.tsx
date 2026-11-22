import type { ReactNode } from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { siteConfig } from "@/lib/site";

export default function LegalPage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 sm:px-6">
          <Breadcrumbs
            items={[
              { name: "Front page", href: "/" },
              { name: title, href: path },
            ]}
          />
          <p className="mono-label text-sunset">The desk // {title}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-none tracking-tight text-paper sm:text-6xl">{title}</h1>
          <p className="mt-4 text-lg text-mute">{intro}</p>
          <p className="mono-label mt-5 text-mute">Last updated: {siteConfig.legalUpdated}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="wiki-prose sections">{children}</div>
      </div>
    </div>
  );
}
