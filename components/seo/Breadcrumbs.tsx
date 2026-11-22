import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";

export default function Breadcrumbs({ items, schema = true }: { items: Crumb[]; schema?: boolean }) {
  return (
    <>
      {schema && <JsonLd data={breadcrumbSchema(items)} />}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="mono-label flex flex-wrap items-center gap-x-2 gap-y-1 text-mute">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="max-w-[18rem] truncate text-paper">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-sunset">
                    {c.name}
                  </Link>
                )}
                {!last && <span aria-hidden>/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
