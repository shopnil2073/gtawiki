import Image from "next/image";
import Link from "next/link";
import { categories, legalLinks, siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="stripe" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Image
            src={siteConfig.assets.logoFull}
            alt="GTA Wiki"
            width={480}
            height={160}
            className="h-14 w-auto border border-line"
          />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">
            An independent reference for Grand Theft Auto VI. Every guide is checked against the game or an
            official source, and unconfirmed details are labeled.
          </p>
        </div>

        <div className="md:col-span-4">
          <h2 className="mono-label text-sunset">Index</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-paper/80 hover:text-sunset">
                  {c.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="mono-label text-sunset">The desk</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/80 hover:text-sunset">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-4 py-6 sm:px-6">
        <p className="mono-label mx-auto max-w-6xl !leading-relaxed !normal-case !tracking-normal text-mute">
          GTA Wiki is an unofficial fan-made resource and is not affiliated with, endorsed by, or sponsored by
          Rockstar Games or Take-Two Interactive Software, Inc. Grand Theft Auto and GTA are trademarks of
          Take-Two Interactive Software, Inc. © {new Date().getFullYear()} {siteConfig.domain}
        </p>
      </div>
    </footer>
  );
}
