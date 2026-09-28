import { cn } from "@/lib/utils";

/**
 * Interim Al-Asar mark: the campus's arched veranda, an eight-point star and
 * an open book. Swap for the official crest (public/brand/al-asar-mark.svg)
 * when the college supplies one.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" aria-hidden="true" className={cn("h-12 w-auto shrink-0", className)}>
      <path d="M5 54V24a19 19 0 0 1 38 0v30z" fill="var(--aa-forest-800)" stroke="var(--aa-brass-500)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10.5 54V25a13.5 13.5 0 0 1 27 0v29" fill="none" stroke="var(--aa-sand-100)" strokeOpacity=".35" strokeWidth="1" />
      <g transform="translate(24 28)" fill="var(--aa-brass-400)">
        <rect x="-5" y="-5" width="10" height="10" />
        <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" />
      </g>
      <circle cx="24" cy="28" r="2.2" fill="var(--aa-forest-800)" />
      <path d="M13 43.5q5.5-2.8 11 0 5.5-2.8 11 0V49q-5.5-2.8-11 0-5.5-2.8-11 0z" fill="var(--aa-sand-100)" />
      <path d="M24 43.5V49" stroke="var(--aa-forest-800)" strokeWidth=".9" />
    </svg>
  );
}
