export default function SectionHeading({
  kicker,
  title,
  id,
}: {
  kicker: string;
  title: string;
  id?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div>
        <p className="mono-label text-sunset">{kicker}</p>
        <h2 id={id} className="mt-2 font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
          {title}
        </h2>
      </div>
    </div>
  );
}
