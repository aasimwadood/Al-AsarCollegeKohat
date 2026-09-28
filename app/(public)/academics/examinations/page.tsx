import type { Metadata } from "next";
import { Gavel } from "lucide-react";
import { EXAMINATION } from "@/lib/site/content/policies";
import { BulletList, Callout, Container, CtaBand, OnThisPage, PageHero } from "@/components/site/primitives";
import { PolicyBlock } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Examination System",
  description:
    "Semester examination system at Al-Asar Degree College, Kohat: Fall, Spring and Summer semesters, 15 teaching weeks and 2 exam weeks, marks distribution, examination offences and unfair means procedure.",
  alternates: { canonical: "/academics/examinations" },
};

function MarksTable({ caption, rows }: { caption: string; rows: { label: string; percent: number }[] }) {
  const total = rows.reduce((s, r) => s + r.percent, 0);
  return (
    <table className="w-full text-left text-[0.9375rem]">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-xs tracking-[0.08em] text-ink-muted uppercase">
          <th scope="col" className="py-2 font-medium">Component</th>
          <th scope="col" className="py-2 text-right font-medium">Weight</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-t border-line align-top">
            <th scope="row" className="py-3 pr-4 font-normal text-ink">
              {r.label}
              <span className="mt-2 block h-1 bg-sand-200" aria-hidden="true">
                <span className="block h-full bg-forest-700" style={{ width: `${(r.percent / Math.max(total, 1)) * 100}%` }} />
              </span>
            </th>
            <td className="font-display py-3 text-right text-lg text-forest-900 tabular-nums">{r.percent}%</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-forest-800">
          <th scope="row" className="py-3 font-medium text-forest-900">Total</th>
          <td className="font-display py-3 text-right text-lg text-forest-900 tabular-nums">{total}%</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function ExaminationsPage() {
  const toc = [
    { id: "calendar", label: "Academic year" },
    { id: "marks", label: "Marks distribution" },
    { id: "offences", label: "Examination offences" },
    { id: "appeal", label: "Appeals" },
  ];
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const bands = [
    { label: "Fall", start: 0, span: 5, cls: "bg-forest-800 text-sand-50" },
    { label: "Spring", start: 5, span: 5, cls: "bg-forest-600 text-sand-50" },
    { label: "Summer", start: 10, span: 2, cls: "border border-dashed border-brass-500 bg-sand-100 text-brass-700" },
  ];

  return (
    <>
      <PageHero eyebrow="Academics" title="Examination system" lede={EXAMINATION.intro} crumbs={[{ label: "Academics", href: "/academics" }, { label: "Examination System" }]} />

      <Container className="grid gap-12 py-16 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <OnThisPage items={toc} />
          </div>
        </aside>
        <div className="min-w-0 space-y-20">
          <PolicyBlock id="calendar" title="Academic year / session" intro={EXAMINATION.session}>
            <div className="border border-line bg-white p-5 sm:p-7">
              <div className="grid grid-cols-12 gap-1 text-center text-[0.6875rem] tracking-wide text-ink-muted uppercase sm:text-xs" aria-hidden="true">
                {months.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <div className="relative mt-2 grid grid-cols-12 gap-1" aria-hidden="true">
                {bands.map((b) => (
                  <div key={b.label} className={`flex h-12 items-center justify-center rounded-[2px] px-1 text-center text-xs font-medium sm:text-sm ${b.cls}`} style={{ gridColumn: `${b.start + 1} / span ${b.span}` }}>
                    {b.label}
                  </div>
                ))}
              </div>
              <ul className="mt-8 grid gap-6 md:grid-cols-3">
                {EXAMINATION.semesters.map((s) => (
                  <li key={s.name} className="border-t-2 border-brass-500 pt-4">
                    <p className="font-display text-xl text-forest-900">{s.name}</p>
                    <p className="text-sm font-medium text-brass-700">{s.window}</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{s.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { v: "15", k: "weeks of teaching" },
                { v: "02", k: "weeks of final examinations" },
                { v: "01", k: "week mid-semester break / Sports Gala (may be)" },
              ].map((x) => (
                <div key={x.k} className="border border-line bg-sand-100 p-5">
                  <p className="font-display text-4xl text-forest-900">{x.v}</p>
                  <p className="mt-1 text-sm text-ink-muted">{x.k}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl leading-relaxed text-ink">{EXAMINATION.regularStructure}</p>
          </PolicyBlock>

          <PolicyBlock id="marks" title="Marks distribution of a semester" intro={EXAMINATION.marksNote}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-line bg-white p-6">
                <p className="font-display text-xl text-forest-900">{EXAMINATION.theoryCourse.title}</p>
                <div className="mt-4">
                  <MarksTable caption={EXAMINATION.theoryCourse.title} rows={EXAMINATION.theoryCourse.rows} />
                </div>
              </div>
              <div className="border border-line bg-white p-6">
                <p className="font-display text-xl text-forest-900">{EXAMINATION.labCourse.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{EXAMINATION.labCourse.intro}</p>
                <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">Lab — 25%</p>
                <MarksTable caption="Lab component" rows={EXAMINATION.labCourse.lab} />
                <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">Theory — 75%</p>
                <MarksTable caption="Theory component" rows={EXAMINATION.labCourse.theory} />
              </div>
            </div>
          </PolicyBlock>

          <PolicyBlock id="offences" title="Examination offences" intro={EXAMINATION.offencesIntro}>
            <p className="mb-6 max-w-3xl leading-relaxed text-ink">{EXAMINATION.unfairMeansIntro}</p>
            <ol className="space-y-4">
              {EXAMINATION.offences.map((o, i) => (
                <li key={o.penalty} className="border border-line bg-white">
                  <div className="flex items-center gap-3 border-b border-line bg-clay-50 px-5 py-3">
                    <span className="font-display text-clay-700">{i + 1}.</span>
                    <Gavel className="h-4 w-4 text-clay-700" aria-hidden="true" />
                    <p className="font-medium text-clay-700">{o.penalty}</p>
                  </div>
                  <div className="p-5">
                    <BulletList items={o.items} />
                  </div>
                </li>
              ))}
            </ol>
          </PolicyBlock>

          <PolicyBlock id="appeal" title="Appeals">
            <Callout tone="forest">{EXAMINATION.appeal}</Callout>
          </PolicyBlock>
        </div>
      </Container>

      <CtaBand title="Attendance decides eligibility for the final exam." body="A minimum of 75% attendance is required in each course." primary={{ label: "Attendance policy", href: "/policies/attendance" }} secondary={{ label: "All policies", href: "/policies" }} />
    </>
  );
}
