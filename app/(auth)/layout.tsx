import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";
import { SITE } from "@/lib/site/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <BrandMark className="h-12" />
          <span className="leading-tight">
            <span className="font-display block text-2xl font-semibold text-forest-900">{SITE.shortName}</span>
            <span className="block text-xs font-medium tracking-[0.14em] text-brass-700 uppercase">College Portal</span>
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
