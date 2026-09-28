import type { Metadata } from "next";
import { Building2, Receipt } from "lucide-react";
import { FEE } from "@/lib/site/content/admissions";
import { getPublishedFees } from "@/lib/site/data";
import { formatRupees } from "@/lib/site/format";
import { Callout, Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Fee Structure & Refund Policy",
  description:
    "Fee structure as per KUST regular class fee at Al-Asar Degree College, Kohat. Fee details and fee slips are available from the Administration / Accounts Office. Refund schedule and re-admission rules.",
  alternates: { canonical: "/admissions/fee-structure" },
};

export default async function FeeStructurePage() {
  const fees = await getPublishedFees();

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Fee structure & refund policy"
        lede={FEE.heading + "."}
        crumbs={[{ label: "Admissions", href: "/admissions" }, { label: "Fee Structure" }]}
      />

      <Section>
        <Container className="space-y-16">
          {fees.length > 0 ? (
            <div>
              <SectionHeading eyebrow="Published by the Accounts Office" title="Fee by program" />
              <div className="mt-8 overflow-x-auto border border-line bg-white">
                <table className="w-full min-w-[560px] text-left">
                  <caption className="sr-only">Fee by program</caption>
                  <thead className="bg-sand-100 text-xs tracking-[0.08em] text-ink-muted uppercase">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">Program</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Admission fee</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Tuition fee</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f) => (
                      <tr key={f.id} className="border-t border-line">
                        <th scope="row" className="px-5 py-3.5 font-medium text-forest-900">{f.programName}</th>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatRupees(f.admissionFee)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatRupees(f.tuitionFee)}</td>
                        <td className="px-5 py-3.5 text-right font-medium tabular-nums text-forest-900">{formatRupees(f.totalFee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-ink-muted">{FEE.availability}</p>
            </div>
          ) : (
            <div className="grid gap-6 border border-line bg-white p-8 sm:p-10 md:grid-cols-[auto_1fr] md:items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100">
                <Building2 className="h-7 w-7 text-forest-800" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl text-forest-900">Fee details are available from the Administration / Accounts Office.</h2>
                <p className="mt-2 leading-relaxed text-ink-muted">{FEE.availability}</p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Callout tone="forest" title="Students already registered with KUST">
              {FEE.registration}
            </Callout>
            <Callout tone="sand" title="Re-admission">
              {FEE.readmission}
            </Callout>
          </div>

          <div>
            <SectionHeading eyebrow="Refund of fee for fresh entry" title="Refund schedule" lede={FEE.refundIntro} />
            <ol className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
              {FEE.refundSchedule.map((r) => (
                <li key={r.refund} className="bg-white p-6">
                  <p className="font-display text-5xl text-forest-900 tabular-nums">{r.percent}%</p>
                  <p className="mt-2 font-medium text-forest-900">{r.refund} fee refund</p>
                  <p className="mt-1 text-ink-muted">{r.window}</p>
                  <div className="mt-5 h-1.5 w-full bg-sand-200" aria-hidden="true">
                    <div className="h-full bg-brass-500" style={{ width: `${r.percent}%` }} />
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex max-w-3xl gap-3 leading-relaxed text-ink">
              <Receipt className="mt-1 h-5 w-5 shrink-0 text-brass-700" aria-hidden="true" />
              {FEE.transfer}
            </p>
          </div>
        </Container>
      </Section>

      <CtaBand title="Need a fee slip?" body="Visit the Administration / Accounts Office of the college." primary={{ label: "Contact the college", href: "/contact" }} secondary={{ label: "Admissions", href: "/admissions" }} />
    </>
  );
}
