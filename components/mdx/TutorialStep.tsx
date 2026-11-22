import type { ReactNode } from "react";
import Figure from "./Figure";

type Props = {
  n: number;
  title: string;
  image?: string;
  alt?: string;
  tip?: string;
  children?: ReactNode;
};

export default function TutorialStep({ n, title, image, alt, tip, children }: Props) {
  return (
    <section className="my-10 grid gap-x-6 border-t border-line pt-6 sm:grid-cols-[4.5rem_1fr]">
      <p className="font-display text-6xl font-bold leading-none text-sunset sm:text-7xl">{String(n).padStart(2, "0")}</p>
      <div className="min-w-0">
        <p className="mono-label mt-3 text-mute sm:mt-0">Step</p>
        <h3 className="!mt-1 font-display text-2xl font-bold text-paper">{title}</h3>
        <div className="mt-3 space-y-3 text-paper/85">{children}</div>
        {image && <Figure src={image} alt={alt ?? title} caption={alt} />}
        {tip && (
          <p className="mt-4 border-l-2 border-neon-cyan bg-neon-cyan/5 p-3 text-sm text-paper">
            <span className="mono-label mr-2 text-neon-cyan">Pro tip</span>
            {tip}
          </p>
        )}
      </div>
    </section>
  );
}
