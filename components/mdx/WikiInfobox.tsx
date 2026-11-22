import Image from "next/image";

type Props = {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  rows: [string, string][];
};

/** "Dossier" stats card. Floats right on desktop, full width on mobile. */
export default function WikiInfobox({ title, subtitle, image, imageAlt, rows }: Props) {
  return (
    <aside className="my-6 border border-line bg-panel md:float-right md:clear-right md:mb-4 md:ml-6 md:mt-1 md:w-72">
      <div className="border-b border-line border-t-2 border-t-sunset p-4">
        <p className="mono-label text-sunset">{subtitle || "Profile"}</p>
        <p className="mt-2 font-display text-xl font-bold leading-tight text-paper">{title}</p>
      </div>
      {image && (
        <div className="relative aspect-video border-b border-line">
          <Image src={image} alt={imageAlt ?? title} fill sizes="288px" className="object-cover" />
        </div>
      )}
      <dl className="text-sm">
        {(rows ?? []).map(([label, value]) => (
          <div key={label} className="grid grid-cols-5 gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
            <dt className="mono-label col-span-2 pt-0.5 text-mute">{label}</dt>
            <dd className="col-span-3 text-paper">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
