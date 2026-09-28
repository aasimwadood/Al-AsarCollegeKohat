import type { Metadata } from "next";
import { FlaskConical, Presentation } from "lucide-react";
import { ATTENDANCE } from "@/lib/site/content/policies";
import { Callout, Container, CtaBand, PageHero, RuleList, Section, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Attendance Policy",
  description:
    "Attendance policy at Al-Asar Degree College, Kohat: at least 75% attendance in each course, 75% separately in lab and classroom for courses with a lab, leave rules and fines.",
  alternates: { canonical: "/policies/attendance" },
};

function Gauge({ label, icon: Icon }: { label: string; icon: typeof FlaskConical }) {
  return (
    <div className="flex items-center gap-5 border border-line bg-white p-5">
      <div
        className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(var(--aa-forest-800) 0 ${ATTENDANCE.minimumPercent}%, var(--aa-sand-200) ${ATTENDANCE.minimumPercent}% 100%)` }}
        aria-hidden="true"
      >
        <div className="flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-white">
          <span className="font-display text-2xl text-forest-900">{ATTENDANCE.minimumPercent}%</span>
        </div>
      </div>
      <div>
        <p className="flex items-center gap-2 font-medium text-forest-900">
          <Icon className="h-4 w-4 text-brass-700" aria-hidden="true" /> {label}
        </p>
        <p className="mt-1 text-sm text-ink-muted">Minimum attendance required</p>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <>
      <PageHero
        eyebrow="Rules & Policies"
        title="Attendance"
        lede={`At least ${ATTENDANCE.minimumPercent}% attendance in each course is required to sit the final examination for that course.`}
        crumbs={[{ label: "Rules & Policies", href: "/policies" }, { label: "Attendance" }]}
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Every course" title="75% in each course" />
            <p className="mt-6 leading-relaxed text-ink">{ATTENDANCE.course}</p>
            <div className="mt-8">
              <Gauge label="Each course" icon={Presentation} />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Courses with a lab" title="75% in lab and 75% in class — separately" />
            <p className="mt-6 leading-relaxed text-ink">{ATTENDANCE.lab}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Gauge label="Lab" icon={FlaskConical} />
              <Gauge label="Classroom" icon={Presentation} />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand" className="border-y border-line">
        <Container>
          <SectionHeading eyebrow="Absence" title="What happens when a student is absent" />
          <ol className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {ATTENDANCE.escalation.map((e, i) => (
              <li key={e.marker} className="bg-sand-50 p-6">
                <p className="font-display text-sm text-brass-700">Step {i + 1}</p>
                <p className="font-display mt-1 text-xl text-forest-900">{e.marker}</p>
                <p className="mt-2 leading-relaxed text-ink-muted">{e.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Leave" title="Leave and punctuality" />
            <RuleList items={ATTENDANCE.general} className="mt-8" />
          </div>
          <div>
            <SectionHeading eyebrow="Fines" title="Fines" />
            <table className="mt-8 w-full text-left">
              <caption className="sr-only">Attendance fines</caption>
              <tbody>
                {ATTENDANCE.fines.map((f) => (
                  <tr key={f.item} className="border-b border-line">
                    <th scope="row" className="py-4 pr-4 font-normal text-ink">{f.item}</th>
                    <td className="font-display py-4 text-right text-lg whitespace-nowrap text-forest-900">{f.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Callout tone="sand" className="mt-8">
              Students on attendance probation, and those absent for extended periods, are notified through the Departmental notice board and a
              registered letter to their parents.
            </Callout>
          </div>
        </Container>
      </Section>

      <CtaBand title="Examinations follow attendance." primary={{ label: "Examination system", href: "/academics/examinations" }} secondary={{ label: "All policies", href: "/policies" }} />
    </>
  );
}
