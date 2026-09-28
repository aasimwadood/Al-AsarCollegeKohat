import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, BrainCircuit, CodeXml, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Department, Program } from "@/lib/site/content/programs";
import type { LeaderMessage } from "@/lib/site/content/institution";
import { MERIT_COMPONENTS } from "@/lib/site/content/admissions";

export function DepartmentIcon({ icon, className }: { icon: Department["icon"]; className?: string }) {
  const Cmp = { english: BookOpenText, computing: CodeXml, psychology: BrainCircuit }[icon];
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.5} />;
}

const ICON_BY_PROGRAM: Record<string, Department["icon"]> = {
  "bs-english": "english",
  "bs-computer-science": "computing",
  "bs-psychology": "psychology",
};

export function ProgramCard({ program, index, headingLevel = "h3" }: { program: Program; index: number; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-sand-300 hover:shadow-[0_24px_48px_-32px_rgb(22_48_36/0.5)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-200">
        <Image
          src={program.image.src}
          alt={program.image.alt}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="font-display absolute top-0 left-0 bg-sand-50 px-3.5 py-2 text-sm text-brass-700 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-2 text-brass-700">
          <DepartmentIcon icon={ICON_BY_PROGRAM[program.slug] ?? "english"} className="h-5 w-5" />
          <span className="text-xs font-semibold tracking-[0.16em] uppercase">
            {program.duration} · {program.semesters} semesters
          </span>
        </div>
        <Heading className="font-display mt-3 text-[1.625rem] leading-tight font-medium text-forest-900">
          <Link href={`/programs/${program.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {program.name}
          </Link>
        </Heading>
        <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{program.summary}</p>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="text-ink-muted">{program.creditHoursDetail}</span>
          <ArrowUpRight className="h-5 w-5 text-forest-800 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export function LeaderCard({ leader }: { leader: LeaderMessage }) {
  return (
    <article className="group relative flex flex-col">
      <div className="aa-arch relative aspect-[4/5] bg-forest-800">
        <Image
          src={leader.photo.src}
          alt={leader.photo.alt}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={leader.photoPosition ? { objectPosition: leader.photoPosition } : undefined}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 via-forest-950/40 to-transparent px-6 pt-16 pb-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-brass-400 uppercase">{leader.designation}</p>
          <p className="text-sm text-sand-200">{leader.office}</p>
        </div>
      </div>
      <h3 className="font-display mt-6 text-2xl font-medium text-forest-900">
        <Link href={`/about/leadership/${leader.slug}`} className="after:absolute after:inset-0">
          {leader.name}
        </Link>
      </h3>
      <blockquote className="mt-3 flex gap-3 text-ink-muted">
        <Quote className="mt-1 h-4 w-4 shrink-0 text-brass-500" aria-hidden="true" />
        <p className="leading-relaxed italic">{leader.excerpt}</p>
      </blockquote>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-800 group-hover:underline group-hover:underline-offset-4">
        Read full message <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </p>
    </article>
  );
}

/** Visual breakdown of the prospectus merit formula (A + B + C). */
export function MeritFormula({ tone = "light", compact }: { tone?: "light" | "dark"; compact?: boolean }) {
  const dark = tone === "dark";
  const fills = ["bg-brass-500", "bg-forest-600", "bg-forest-800"];
  return (
    <figure aria-labelledby="merit-caption">
      <figcaption id="merit-caption" className="sr-only">
        Merit for BS admission: SSC or equivalent 10 percent, HSSC or equivalent 40 percent, NAT or entrance test or approved test 50 percent.
      </figcaption>
      <div className={cn("flex h-14 w-full overflow-hidden rounded-[3px] ring-1", dark ? "ring-sand-200/20" : "ring-line")} aria-hidden="true">
        {MERIT_COMPONENTS.map((m, i) => (
          <div key={m.key} className={cn("flex items-center justify-center text-sm font-semibold text-sand-50", fills[i])} style={{ width: `${m.weight}%` }}>
            {m.weight}%
          </div>
        ))}
      </div>
      <dl className={cn("mt-6 grid gap-5", compact ? "sm:grid-cols-3" : "md:grid-cols-3")}>
        {MERIT_COMPONENTS.map((m, i) => (
          <div key={m.key} className={cn("border-t-2 pt-3", ["border-brass-500", "border-forest-600", "border-forest-800"][i])}>
            <dt className={cn("flex items-baseline gap-2", dark ? "text-sand-50" : "text-forest-900")}>
              <span className="font-display text-3xl">{m.weight}%</span>
              <span className="text-sm font-medium">{m.label}</span>
            </dt>
            {!compact && <dd className={cn("mt-1.5 text-sm leading-relaxed", dark ? "text-sand-200" : "text-ink-muted")}>{m.detail}</dd>}
          </div>
        ))}
      </dl>
      <p className={cn("font-display mt-6 text-lg", dark ? "text-sand-50" : "text-forest-900")}>
        Merit = A + B + C
        <span className={cn("ml-3 font-sans text-sm", dark ? "text-sand-200" : "text-ink-muted")}>
          (A: SSC 10% · B: HSSC 40% · C: Entrance test 50%)
        </span>
      </p>
    </figure>
  );
}

/** Rendered policy groups used by the policy pages: a title, an intro and a numbered list. */
export function PolicyBlock({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32">
      <h2 id={`${id}-title`} className="font-display text-[1.75rem] leading-tight font-medium text-forest-900">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
