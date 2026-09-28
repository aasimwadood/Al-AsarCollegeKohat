import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DEPARTMENTS, getDepartment, getProgram } from "@/lib/site/content/programs";
import { SITE } from "@/lib/site/config";
import { getFacultyDirectory } from "@/lib/site/data";
import { BulletList, ButtonLink, Container, CtaBand, PageHero, PendingInfo, Section, SectionHeading } from "@/components/site/primitives";
import { DepartmentIcon, ProgramCard } from "@/components/site/blocks";

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = getDepartment(slug);
  if (!d) return {};
  return {
    title: d.name,
    description: `${d.name}, ${SITE.name}, ${SITE.location}. ${d.tagline}`,
    alternates: { canonical: `/departments/${d.slug}` },
    openGraph: { images: [{ url: d.image.src, alt: d.image.alt }] },
  };
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = getDepartment(slug);
  if (!d) notFound();
  const program = getProgram(d.programSlug)!;
  const faculty = (await getFacultyDirectory()).filter((f) => f.department?.toLowerCase().includes(program.shortName.toLowerCase()));

  return (
    <>
      <PageHero
        eyebrow="Department"
        title={d.name}
        lede={d.tagline}
        crumbs={[{ label: "Academics", href: "/academics" }, { label: "Departments", href: "/departments" }, { label: d.name }]}
        image={d.image}
      >
        <ButtonLink href={`/programs/${program.slug}`}>
          {program.name} program <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </PageHero>

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Introduction" title={`About the ${d.name}`} />
            <div className="aa-prose mt-8">
              {d.introduction.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-16">
              <SectionHeading eyebrow="Aims & Objectives" title="What we aim for" />
              <div className="aa-prose mt-8">
                {d.aims.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>

            {d.careers && (
              <div className="mt-16">
                <SectionHeading eyebrow="Career Opportunities" title="Where graduates go" />
                <p className="mt-6 leading-relaxed text-ink">{d.careers.intro}</p>
                <BulletList items={d.careers.areas} columns={2} className="mt-6" />
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:pt-4">
            <div className="flex h-40 items-center justify-center border border-line bg-forest-900">
              <DepartmentIcon icon={d.icon} className="h-16 w-16 text-brass-400" />
            </div>
            <ProgramCard program={program} index={0} />
            <div className="border border-line bg-white p-6">
              <p className="font-display text-xl text-forest-900">Faculty</p>
              {faculty.length > 0 ? (
                <ul className="mt-4 divide-y divide-line">
                  {faculty.map((f) => (
                    <li key={f.id} className="py-3">
                      <p className="font-medium text-forest-900">{f.name}</p>
                      <p className="text-sm text-ink-muted">{[f.designation, f.qualification].filter(Boolean).join(" · ")}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <PendingInfo title="Faculty profiles to be published" className="mt-4">
                  Faculty members will be listed here once the college publishes the department&apos;s faculty directory.
                </PendingInfo>
              )}
              <Link href="/faculty" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-800 underline underline-offset-4">
                Faculty directory <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </Container>
      </Section>

      <CtaBand
        title={`Study ${program.shortName} at Al-Asar.`}
        primary={{ label: `${program.name} details`, href: `/programs/${program.slug}` }}
        secondary={{ label: "Admissions", href: "/admissions" }}
      />
    </>
  );
}
