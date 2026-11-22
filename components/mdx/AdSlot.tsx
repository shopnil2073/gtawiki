import AdUnit from "./AdUnit";

export type AdVariant = "header" | "in-article" | "sidebar" | "sticky-mobile";

/**
 * Reserved-height containers = zero layout shift.
 * Renders NOTHING in production until you set the env vars below, so you never
 * ship empty boxes to Google's reviewers. In `npm run dev` a dashed preview is shown.
 *
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   NEXT_PUBLIC_ADSENSE_SLOT_HEADER=1234567890
 *   NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE=1234567891
 *   NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=1234567892
 *   NEXT_PUBLIC_ADSENSE_SLOT_STICKY=1234567893
 */
const SIZES: Record<AdVariant, string> = {
  header: "min-h-[100px] md:min-h-[90px]",
  "in-article": "min-h-[280px]",
  sidebar: "min-h-[250px] xl:min-h-[600px]",
  "sticky-mobile": "min-h-[50px]",
};

function slotFor(variant: AdVariant): string | undefined {
  switch (variant) {
    case "header":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER;
    case "in-article":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE;
    case "sidebar":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
    case "sticky-mobile":
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY;
  }
}

export default function AdSlot({ variant = "in-article" }: { variant?: AdVariant }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = slotFor(variant);

  if (!client || !slot) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`mono-label my-8 grid place-items-center border border-dashed border-line text-mute ${SIZES[variant]}`}
      >
        Ad slot preview: {variant} (dev only, hidden in production)
      </div>
    );
  }

  return (
    <div className="my-8" aria-label="Advertisement">
      <p className="mono-label mb-1 text-center text-[10px] text-mute">Advertisement</p>
      <div className={`overflow-hidden ${SIZES[variant]}`}>
        <AdUnit client={client} slot={slot} />
      </div>
    </div>
  );
}
