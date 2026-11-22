import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-28 sm:px-6">
      <p className="mono-label text-neon-pink">Error 404 // file not found</p>
      <h1 className="mt-4 font-display text-5xl font-bold leading-none tracking-tight text-paper sm:text-7xl">
        Wrong turn in Vice City
      </h1>
      <p className="mt-5 max-w-lg text-lg text-mute">
        That page is not in the database. Try the search (Ctrl K) or head back to the front page.
      </p>
      <Link href="/" className="mono-label mt-8 inline-block bg-sunset px-5 py-4 text-base">
        Back to front page
      </Link>
    </div>
  );
}
