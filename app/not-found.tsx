import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sand-100 px-4 text-center">
      <BrandMark className="h-16" />
      <p className="aa-eyebrow mt-8">Page not found</p>
      <h1 className="font-display mt-4 text-4xl font-medium text-forest-900 sm:text-5xl">This page could not be found.</h1>
      <p className="mt-4 max-w-md text-ink-muted">The page may have moved, or the address may be mistyped.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-[3px] bg-forest-800 px-5 font-medium text-sand-50 hover:bg-forest-900">
          Al-Asar home
        </Link>
        <Link href="/programs" className="inline-flex min-h-11 items-center rounded-[3px] border border-forest-800 px-5 font-medium text-forest-800">
          BS programs
        </Link>
      </div>
    </main>
  );
}
