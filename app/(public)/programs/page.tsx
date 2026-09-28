import type { Metadata } from "next";
import { CalendarRange, Clock, Layers } from "lucide-react";
import { PROGRAMS, GRADUATE_PROGRAMS_INTRO } from "@/lib/site/content/programs";
import { FUTURE } from "@/lib/site/content/institution";
import { IMAGES } from "@/lib/site/content/images";
import { Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { ProgramCard } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "BS Programs",
  description:
    "Four-year BS programs in English, Computer Science and Psychology at Al-Asar Degree College, Kohat, in affiliation with KUST — plus the college's planned future programs.",
  alternates: { canonical: "/programs" },
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Graduate Programs"
        title="BS degree programs"
        lede={GRADUATE_PROGRAMS_INTRO[0]}
        crumbs={[{ label: "Programs" }]}
        image={IMAGES.lecture}
      />

      <Section>
        <Container>
          <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
            {[
              { icon: Clock, k: "Duration", v: "4 years" },
              { icon: Layers, k: "Structure", v: "8 semesters, 2 each year" },
              { icon: CalendarRange, k: "Affiliation", v: "Kohat University of Science & Technology" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex gap-4 bg-white p-6">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{k}</dt>
                  <dd className="font-display mt-1 text-xl text-forest-900">{v}</dd>
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-12 max-w-3xl text-lg leading-relaxed text-ink-muted">{GRADUATE_PROGRAMS_INTRO[1]}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program, i) => (
              <ProgramCard key={program.slug} program={program} index={i} headingLevel="h2" />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="future-programs" tone="sand" className="border-t border-line">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Future / Planned Programs" title="Room to grow." lede={FUTURE.paragraphs[2]} />
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-brass-500/60 bg-sand-50 px-4 py-1.5 text-sm text-brass-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brass-500" aria-hidden="true" />
              Planned — not currently open for admission
            </p>
          </div>
          <div>
            <ul className="grid gap-px overflow-hidden border border-dashed border-sand-300 bg-sand-300/60 sm:grid-cols-2">
              {FUTURE.plannedPrograms.map((name) => (
                <li key={name} className="flex items-center justify-between gap-3 bg-sand-50 px-5 py-4">
                  <span className="text-forest-900">{name}</span>
                  <span className="text-xs tracking-[0.12em] text-ink-muted uppercase">Planned</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-muted">
              {FUTURE.plannedProgramsNote}. These programs are intentions stated in the prospectus; they are not being offered and no admission is
              open for them.
            </p>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Ready to apply for a BS program?"
        body="Admission is based on merit from SSC, HSSC and an approved entrance test."
        primary={{ label: "Admissions", href: "/admissions" }}
        secondary={{ label: "Merit formula", href: "/admissions#merit" }}
      />
    </>
  );
}
