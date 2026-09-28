import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileCheck2, Scale, ShieldAlert } from "lucide-react";
import {
  ADMISSIONS_INTRO,
  ADMISSION_PROCEDURE,
  APPEALS,
  CANCELLATION,
  CONFIRMATION,
  INELIGIBILITY,
  MERIT_PROCESS,
  REQUIRED_DOCUMENTS,
} from "@/lib/site/content/admissions";
import { PROGRAMS } from "@/lib/site/content/programs";
import { IMAGES } from "@/lib/site/content/images";
import { getImportantDates, getSiteSettings, SITE_SETTING_KEYS } from "@/lib/site/data";
import { formatDate } from "@/lib/site/format";
import { BulletList, Callout, Container, CtaBand, OnThisPage, PageHero, RuleList } from "@/components/site/primitives";
import { MeritFormula, PolicyBlock } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Admission to BS English, Computer Science and Psychology at Al-Asar Degree College, Kohat: procedure, eligibility, merit formula (SSC 10%, HSSC 40%, entrance test 50%), confirmation, cancellation and appeals.",
  alternates: { canonical: "/admissions" },
};

export default async function AdmissionsPage() {
  const [dates, settings] = await Promise.all([getImportantDates(), getSiteSettings()]);
  const notice = settings[SITE_SETTING_KEYS.admissionsNotice];

  const toc = [
    { id: "procedure", label: "Admission procedure" },
    { id: "eligibility", label: "Eligibility by program" },
    { id: "merit", label: "Merit calculation" },
    { id: "documents", label: "Documents" },
    { id: "rules", label: "Confirmation & cancellation" },
    { id: "appeals", label: "Appeals" },
    { id: "fees", label: "Fees & refunds" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Admissions · BS 4-Year Programs"
        title="Admissions"
        lede={ADMISSIONS_INTRO}
        crumbs={[{ label: "Admissions" }]}
        image={IMAGES.libraryReading}
      />

      {(notice || dates.length > 0) && (
        <div className="border-b border-line bg-white">
          <Container className="grid gap-6 py-8 md:grid-cols-[1fr_1fr]">
            {notice && (
              <Callout tone="sand" title="Admission notice">
                {notice}
              </Callout>
            )}
            {dates.length > 0 && (
              <div>
                <p className="mb-3 flex items-center gap-2 font-medium text-forest-900">
                  <CalendarDays className="h-5 w-5 text-brass-700" aria-hidden="true" /> Important dates
                </p>
                <ul className="divide-y divide-line border-y border-line">
                  {dates.map((d) => (
                    <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-[0.9375rem]">
                      <span className="text-ink">{d.event}</span>
                      <span className="text-ink-muted">
                        {formatDate(d.startDate)}
                        {d.endDate && d.endDate !== d.startDate ? ` – ${formatDate(d.endDate)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </div>
      )}

      <Container className="grid gap-12 py-16 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <OnThisPage items={toc} />
          </div>
        </aside>

        <div className="min-w-0 space-y-20">
          <PolicyBlock id="procedure" title="Admission procedure / rules for BS (4 years)">
            <RuleList items={ADMISSION_PROCEDURE} />
          </PolicyBlock>

          <PolicyBlock id="eligibility" title="Eligibility by program">
            <div className="grid gap-4 md:grid-cols-3">
              {PROGRAMS.map((p) => (
                <div key={p.slug} className="flex flex-col border border-line bg-white p-6">
                  <p className="font-display text-xl text-forest-900">{p.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {p.duration} · {p.semesters} semesters · {p.creditHours} credit hours
                  </p>
                  <div className="mt-4 flex-1">
                    <BulletList items={p.eligibility} className="text-[0.9375rem]" />
                  </div>
                  {p.eligibilityNote && <p className="mt-3 text-sm text-ink-muted">{p.eligibilityNote}</p>}
                  <Link href={`/programs/${p.slug}#eligibility`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest-800 underline underline-offset-4">
                    Program details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </PolicyBlock>

          <PolicyBlock id="merit" title="Merit determination — Bachelor / BS (4 year)">
            <div className="border border-line bg-white p-6 sm:p-8">
              <MeritFormula />
            </div>
            <h3 className="font-display mt-10 text-xl text-forest-900">Merit lists and offers</h3>
            <RuleList items={MERIT_PROCESS} className="mt-4" />
          </PolicyBlock>

          <PolicyBlock id="documents" title="Documents" intro="Documents named in the admission regulations:">
            <ul className="grid gap-4 md:grid-cols-2">
              {REQUIRED_DOCUMENTS.map((d) => (
                <li key={d.item} className="flex gap-4 border border-line bg-white p-5">
                  <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-brass-700" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-forest-900">{d.item}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{d.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-muted">
              The full list of documents to attach is given in the admission advertisement and application form for each session.
            </p>
          </PolicyBlock>

          <PolicyBlock id="rules" title="Confirmation, ineligibility & cancellation">
            <div className="grid gap-6 lg:grid-cols-2">
              <Callout tone="forest" title="Confirmation of admissions">
                {CONFIRMATION}
              </Callout>
              <Callout tone="clay" title="Ineligibility for admission">
                {INELIGIBILITY}
              </Callout>
            </div>
            <h3 className="mt-10 flex items-center gap-2 font-display text-xl text-forest-900">
              <ShieldAlert className="h-5 w-5 text-clay-700" aria-hidden="true" /> Cancellation of admission
            </h3>
            <RuleList items={CANCELLATION} className="mt-4" />
          </PolicyBlock>

          <PolicyBlock id="appeals" title="Admission Appellate Committee">
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
              <p className="leading-relaxed text-ink">{APPEALS}</p>
              <div className="flex flex-col items-start justify-center border border-line bg-forest-900 p-6 text-sand-50">
                <Scale className="h-6 w-6 text-brass-400" aria-hidden="true" />
                <p className="font-display mt-3 text-4xl">03 days</p>
                <p className="mt-1 text-sm text-sand-200">to appeal, in person to the Principal, from the notice-board notification.</p>
              </div>
            </div>
          </PolicyBlock>

          <PolicyBlock id="fees" title="Fees & refunds">
            <Callout tone="sand">
              Separate fee details and fee slip will be available from the admin/account office for each discipline/program/department.{" "}
              <Link href="/admissions/fee-structure" className="font-medium text-forest-800 underline underline-offset-4">
                Fee structure &amp; refund policy
              </Link>
            </Callout>
          </PolicyBlock>
        </div>
      </Container>

      <CtaBand
        title="Questions about admission?"
        body="Contact the college administration, or download forms as they are published."
        primary={{ label: "Contact", href: "/contact" }}
        secondary={{ label: "Downloads", href: "/downloads" }}
      />
    </>
  );
}
