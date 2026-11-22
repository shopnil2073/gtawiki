"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  priority?: boolean;
};

/** Click-to-zoom image with lightbox. `src` must be a host allowed in next.config.ts (Cloudinary). */
export default function Figure({ src, alt, width = 1600, height = 900, caption, priority }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <figure className="my-6 clear-both">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Zoom image: ${alt}`}
        className="group relative block w-full overflow-hidden border border-line bg-panel"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(min-width: 1280px) 720px, 100vw"
          className="h-auto w-full"
        />
        <span className="absolute right-0 top-0 grid h-9 w-9 place-items-center bg-sunset text-base opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      {caption && <figcaption className="mono-label mt-2 !normal-case !tracking-normal text-mute">Fig. // {caption}</figcaption>}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[120] grid place-items-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close image"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-line bg-base text-paper hover:bg-sunset hover:text-base"
          >
            <X className="h-5 w-5" />
          </button>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="100vw"
            className="max-h-[90dvh] w-auto max-w-full object-contain"
          />
        </div>
      )}
    </figure>
  );
}
