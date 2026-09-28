import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookMarked, Briefcase, GraduationCap } from "lucide-react";
import { PROGRAMS, getDepartment, getProgram } from "@/lib/site/content/programs";
import { SITE } from "@/lib/site/config";
import { BulletList, ButtonLink, Callout, Container, CtaBand, OnThisPage, PageHero, PendingInfo } from "@/components/site/primitives";
import { DepartmentIcon, MeritFormula } from "@/components/site/blocks";
import { Curriculum } from "@/components/site/curriculum";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  const description = `${program.name} at ${SITE.name}, ${SITE.location}: ${program.duration}, ${program.semesters} semesters, ${program.creditHoursDetail.toLowerCase()}. Eligibility, scheme of studies and admission.`;
  return {
    title: program.name,
    description,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: { title: `${program.name} | ${SITE.name}`, description, images: [{ url: program.image.src, alt: program.image.alt }] },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  const department = getDepartment(program.departmentSlug)!;

  const toc = [
    { id: "overview", label: "Overview" },
    { id: "why", label: "Aims & objectives" },
    { id: "eligibility", label: "Eligibility" },
    { id: "curriculum", label: "Scheme of studies" },
    { id: "careers", label: "Career opportunities" },
    { id: "apply", label: "Admission" },
  ];

  return (
    <>
      <PageHero
        eyebrow={department.name}
        title={program.name}
        lede={program.summary}
        crumbs={[{ label: "Programs", href: "/programs" }, { label: program.name }]}
        image={program.image}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admissions">Apply for admission</ButtonLink>
          <ButtonLink href="#curriculum" variant="secondary">
            View curriculum
          </ButtonLink>
        </div>
      </PageHero>

      {/* Quick facts */}
      <div className="border-b border-line bg-white">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Duration", v: program.duration },
              { k: "Semesters", v: `${program.semesters} (2 per year)` },
              { k: "Credit hours", v: program.creditHoursDetail.startsWith("Minimum") ? `Min. ${program.creditHours}` : program.creditHours },
              { k: "Affiliation", v: SITE.affiliationShort },
            ].map((f, i) => (
              <div key={f.k} className={`py-6 pr-4 ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""}`}>
                <dt className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{f.k}</dt>
                <dd className="font-display mt-1 text-xl text-forest-900">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <OnThisPage items={toc} />
          </div>
        </aside>

        <div className="min-w-0 space-y-20">
          <section id="overview" className="scroll-mt-32" aria-labelledby="overview-title">
            <h2 id="overview-title" className="font-display text-[2rem] leading-tight font-medium text-forest-900">
              Program overview
            </h2>
            <div className="aa-prose mt-6 max-w-3xl">
              {department.introduction.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section id="why" className="scroll-mt-32" aria-labelledby="why-title">
            <div className="flex items-center gap-3">
              <DepartmentIcon icon={department.icon} className="h-6 w-6 text-brass-700" />
              <h2 id="why-title" className="font-display text-[2rem] leading-tight font-medium text-forest-900">
                Aims &amp; objectives
              </h2>
            </div>
            <div className="aa-prose mt-6 max-w-3xl">
              {department.aims.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section id="eligibility" className="scroll-mt-32" aria-labelledby="eligibility-title">
            <h2 id="eligibility-title" className="font-display text-[2rem] leading-tight font-medium text-forest-900">
              Eligibility
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="border border-line bg-white p-6">
                <p className="mb-4 flex items-center gap-2 font-medium text-forest-900">
                  <GraduationCap className="h-5 w-5 text-brass-700" aria-hidden="true" />
                  Requirement for admission
                </p>
                <BulletList items={program.eligibility} />
                {program.eligibilityNote && <p className="mt-4 text-sm text-ink-muted">{program.eligibilityNote}</p>}
              </div>
              <div className="border border-line bg-white p-6">
                <p className="mb-4 flex items-center gap-2 font-medium text-forest-900">
                  <BookMarked className="h-5 w-5 text-brass-700" aria-hidden="true" />
                  Duration &amp; credit hours
                </p>
                <p className="leading-relaxed text-ink">
                  {program.name} is a four-year degree program consisting of eight semesters, with two semesters each year.{" "}
                  {program.creditHoursDetail}.
                </p>
              </div>
            </div>
            <div className="mt-10 border border-line bg-sand-100 p-6 sm:p-8">
              <p className="mb-6 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">Merit determination — Bachelor / BS (4 year)</p>
              <MeritFormula compact />
            </div>
          </section>

          <section id="curriculum" className="scroll-mt-32" aria-labelledby="curriculum-title">
            <h2 id="curriculum-title" className="font-display text-[2rem] leading-tight font-medium text-forest-900">
              Scheme of studies
            </h2>
            <p className="mt-3 max-w-3xl text-ink-muted">
              Semester-by-semester courses as published in the prospectus. Credit hours are shown as total (theory + lab).
            </p>
            <div className="mt-8">
              <Curriculum semesters={program.curriculum} />
            </div>
            <div className="mt-6 space-y-1 text-sm text-ink-muted">
              {program.curriculumNotes.map((n) => (
                <p key={n}>
                  <span className="font-medium text-forest-900">Note:</span> {n}
                </p>
              ))}
            </div>
          </section>

          <section id="careers" className="scroll-mt-32" aria-labelledby="careers-title">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-brass-700" aria-hidden="true" />
              <h2 id="careers-title" className="font-display text-[2rem] leading-tight font-medium text-forest-900">
                Career opportunities
              </h2>
            </div>
            {department.careers ? (
              <>
                <p className="mt-6 max-w-3xl leading-relaxed text-ink">{department.careers.intro}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {department.careers.areas.map((a) => (
                    <li key={a} className="border border-line bg-white px-4 py-2 text-forest-900">
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <PendingInfo title="Career information has not been published for this program." className="mt-6 max-w-3xl">
                The prospectus does not list career pathways for {program.name}. Contact the {department.name} for guidance.
              </PendingInfo>
            )}
          </section>

          <section id="apply" className="scroll-mt-32" aria-labelledby="apply-title">
            <Callout tone="forest">
              <h2 id="apply-title" className="font-display text-2xl text-forest-900">
                Admission to {program.name}
              </h2>
              <p className="mt-2">
                Admissions are advertised in print and social media, and offers are made on merit. Fee details and fee slips are available from the
                Administration / Accounts Office.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                <Link href="/admissions" className="inline-flex items-center gap-1.5 text-forest-800 underline underline-offset-4">
                  Admission procedure <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={`/departments/${department.slug}`} className="inline-flex items-center gap-1.5 text-forest-800 underline underline-offset-4">
                  About the {department.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Callout>
          </section>
        </div>
      </Container>

      <CtaBand
        title={`Begin your ${program.name} at Al-Asar.`}
        primary={{ label: "Admissions", href: "/admissions" }}
        secondary={{ label: "Fee & refund policy", href: "/admissions/fee-structure" }}
      />
    </>
  );
}
