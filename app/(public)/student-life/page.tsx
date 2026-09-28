import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Trophy } from "lucide-react";
import { STUDENT_LIFE } from "@/lib/site/content/campus";
import { IMAGES } from "@/lib/site/content/images";
import { Container, CtaBand, Eyebrow, PageHero, Section, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Student Life",
  description:
    "Student life at Al-Asar Degree College, Kohat: the Students Council and its seven clubs, games and sports, hostels, and support for deserving students.",
  alternates: { canonical: "/student-life" },
};

export default function StudentLifePage() {
  return (
    <>
      <PageHero eyebrow="Campus Life" title="Student life" lede={STUDENT_LIFE.enrichment} crumbs={[{ label: "Campus Life", href: "/campus" }, { label: "Student Life" }]} image={IMAGES.libraryAssembly} />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Students' Council" title="For the students, by the students." />
            <div className="aa-prose mt-8">
              {STUDENT_LIFE.council.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="font-display mt-8 text-2xl text-brass-700 italic">“{STUDENT_LIFE.motto}”</p>
          </div>
          <div>
            <Eyebrow>The 7 clubs</Eyebrow>
            <ol className="mt-6 divide-y divide-line border-y border-line">
              {STUDENT_LIFE.clubs.map((c, i) => (
                <li key={c.name} className="grid grid-cols-[2.75rem_1fr] items-baseline gap-3 py-4">
                  <span className="font-display text-brass-700 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="font-display block text-xl text-forest-900">{c.name}</span>
                    {c.detail && <span className="text-sm text-ink-muted">{c.detail}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <section className="aa-lattice bg-forest-900 py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Trophy className="h-8 w-8 text-brass-400" strokeWidth={1.5} aria-hidden="true" />
            <SectionHeading className="mt-4" light eyebrow="Games & Sports" title="Passionate about sport." />
            <div className="mt-8 space-y-4 text-lg leading-relaxed text-sand-200">
              {STUDENT_LIFE.sports.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="self-center">
            <ul className="grid grid-cols-2 gap-px overflow-hidden border border-sand-200/20 bg-sand-200/20 sm:grid-cols-3">
              {STUDENT_LIFE.sportsList.map((s) => (
                <li key={s} className="bg-forest-900 px-5 py-8 text-center">
                  <span className="font-display text-xl text-sand-50">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div className="aa-arch relative aspect-[4/5] max-w-md">
            <Image src={IMAGES.hostelCorridor.src} alt={IMAGES.hostelCorridor.alt} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" />
          </div>
          <div>
            <HeartHandshake className="h-8 w-8 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
            <SectionHeading className="mt-4" eyebrow="Student Support" title="Support for deserving students." />
            <p className="mt-8 text-lg leading-relaxed text-ink">{STUDENT_LIFE.support}</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-medium">
              <Link href="/campus#hostels" className="inline-flex items-center gap-2 text-forest-800 underline underline-offset-4">
                Hostels <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/about#welfare-society" className="inline-flex items-center gap-2 text-forest-800 underline underline-offset-4">
                Al-Asar Welfare Society <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand title="Know the rules of campus life." primary={{ label: "Rules & policies", href: "/policies" }} secondary={{ label: "Anti-ragging policy", href: "/policies/anti-ragging" }} />
    </>
  );
}
