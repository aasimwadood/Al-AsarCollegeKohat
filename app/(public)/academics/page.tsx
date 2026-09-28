import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarRange, ClipboardCheck, Users } from "lucide-react";
import { DEPARTMENTS, GRADUATE_PROGRAMS_INTRO, PROGRAMS } from "@/lib/site/content/programs";
import { ATTENDANCE, EXAMINATION } from "@/lib/site/content/policies";
import { IMAGES } from "@/lib/site/content/images";
import { Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { DepartmentIcon, ProgramCard } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Academics",
  description:
    "Academics at Al-Asar Degree College, Kohat: BS semester system in affiliation with KUST, the Departments of English, Computer Science and Psychology, examinations and attendance.",
  alternates: { canonical: "/academics" },
};

export default function AcademicsPage() {
  return (
    <>
      <PageHero eyebrow="Academics" title="Education and research, hand in hand." lede={GRADUATE_PROGRAMS_INTRO[0]} crumbs={[{ label: "Academics" }]} image={IMAGES.libraryAssembly} />

      <Section>
        <Container>
          <SectionHeading eyebrow="Departments" title="Three departments" lede={GRADUATE_PROGRAMS_INTRO[1]} />
          <ul className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <li key={d.slug} className="group relative bg-white p-7">
                <DepartmentIcon icon={d.icon} className="h-8 w-8 text-brass-700" />
                <h3 className="font-display mt-5 text-2xl text-forest-900">
                  <Link href={`/departments/${d.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                    {d.name}
                  </Link>
                </h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{d.tagline}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="sand" className="border-y border-line">
        <Container>
          <SectionHeading eyebrow="Academic System" title="How the BS program runs" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarRange, title: "Semester system", body: EXAMINATION.session, href: "/academics/examinations#calendar" },
              { icon: BookOpenCheck, title: "15 + 2 weeks", body: "Each regular semester has 15 weeks of teaching and 02 weeks of final examinations.", href: "/academics/examinations#calendar" },
              { icon: ClipboardCheck, title: "Continuous assessment", body: "Quizzes, assignments and a mid-semester examination form part of every course.", href: "/academics/examinations#marks" },
              { icon: Users, title: `${ATTENDANCE.minimumPercent}% attendance`, body: "Required in each course — and separately in lab and classroom for courses with a lab.", href: "/policies/attendance" },
            ].map(({ icon: Icon, title, body, href }) => (
              <Link key={title} href={href} className="group flex flex-col border border-line bg-sand-50 p-6 transition-colors hover:border-sand-300 hover:bg-white">
                <Icon className="h-6 w-6 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-display mt-4 text-xl text-forest-900">{title}</p>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-800 group-hover:underline group-hover:underline-offset-4">
                  Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Programs" title="BS programs on offer" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <ProgramCard key={p.slug} program={p} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand title="Meet the people who teach." primary={{ label: "Faculty", href: "/faculty" }} secondary={{ label: "Library", href: "/library" }} />
    </>
  );
}
