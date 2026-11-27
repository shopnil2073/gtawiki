import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import WikiInfobox from "./WikiInfobox";
import TutorialStep from "./TutorialStep";
import QaBlock from "./QaBlock";
import CheatCodeCard from "./CheatCodeCard";
import AdSlot from "./AdSlot";
import Figure from "./Figure";
import { Align, Color, Highlight } from "./InlineStyle";

function A({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  a: A,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  WikiInfobox,
  TutorialStep,
  QaBlock,
  CheatCodeCard,
  AdSlot,
  Figure,
  Color,
  Highlight,
  Align,
};
