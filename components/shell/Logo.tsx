import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" aria-label="GTA Wiki home" className="flex items-center gap-2.5">
      <Image
        src="/favicon.jpg"
        alt="GTA Wiki logo"
        width={72}
        height={72}
        priority
        className="h-9 w-9 border border-line object-cover"
      />
      <span className="font-display text-xl font-bold uppercase leading-none tracking-tight text-paper">
        GTA<span className="text-sunset">Wiki</span>
      </span>
    </Link>
  );
}