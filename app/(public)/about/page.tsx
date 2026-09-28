import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, School } from "lucide-react";
import { SITE } from "@/lib/site/config";
import { IMAGES } from "@/lib/site/content/images";
import { ACADEMY_COMPONENTS, CAMPUS_AREA_NOTE, FACTS_IN_CONTEXT, LEADERSHIP, WELCOME } from "@/lib/site/content/institution";
import { BulletList, Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { LeaderCard } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Al-Asar Degree College, Usterzai Payan, Kohat — established by the Al-Asar Welfare Society as the degree-level milestone of Al-Asar Academy, founded in 1993.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Al-Asar"
        title={WELCOME.heading}
        lede={WELCOME.paragraphs[0]}
        crumbs={[{ label: "About" }]}
        image={IMAGES.campusCourtyard}
      />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-20">
          <div className="aa-prose max-w-3xl">
            {WELCOME.paragraphs.slice(1).map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="font-display !text-lg text-brass-700 italic">— {WELCOME.signature}</p>
          </div>
          <aside className="space-y-6">
            <div className="border border-line bg-white p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">At a glance</p>
              <dl className="mt-4 divide-y divide-line">
                {FACTS_IN_CONTEXT.map((f) => (
                  <div key={f.label} className="py-3">
                    <dt className="font-display text-2xl text-forest-900">{f.value}</dt>
                    <dd className="text-sm text-ink">{f.label}</dd>
                    <dd className="text-xs text-ink-muted">{f.context}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="border border-dashed border-sand-300 bg-sand-100 p-6 text-sm leading-relaxed text-ink-muted">
              <p className="mb-2 font-medium text-forest-900">On campus area</p>
              <p>The prospectus describes the land in two contexts:</p>
              <ul className="mt-2 list-disc space-y-2 pl-4">
                <li>{CAMPUS_AREA_NOTE.welcome}</li>
                <li>{CAMPUS_AREA_NOTE.history}</li>
              </ul>
            </div>
          </aside>
        </Container>
      </Section>

      <Section id="welfare-society" tone="sand" className="border-y border-line">
        <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <HandHeart className="h-8 w-8 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
            <SectionHeading className="mt-4" eyebrow={SITE.parentBody} title="A welfare society, not a business." />
            <div className="aa-prose mt-8">
              <p>
                Al-Asar Welfare Society is one of those providing educational opportunity on elementary, secondary and now on degree level too.
                It is not a private institution built for business purposes only, rather is a welfare society which every year offers free
                education (along with all academic expenses) for orphans and poor people in the shape of scholarships.
              </p>
              <p>
                Since its inception Al-Asar Academy has constantly supported the deserving orphan and poor students by completely or partially
                waiving the school fees. At present 700 orphan students are studying in the academy with some being supported by this institute.
                However, the majority of the students still need financial assistance.
              </p>
            </div>
          </div>
          <div>
            <School className="h-8 w-8 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
            <SectionHeading className="mt-4" eyebrow={SITE.parentInstitution} title="The Academy family." />
            <p className="mt-8 leading-relaxed text-ink">Apart from Al-Asar Degree College, the Academy comprises of:</p>
            <BulletList items={ACADEMY_COMPONENTS} columns={2} className="mt-5" />
            <div className="aa-arch-sm relative mt-8 aspect-[16/9]">
              <Image src={IMAGES.academyEntrance.src} alt={IMAGES.academyEntrance.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Leadership" title="Messages from our leadership" />
            <Link href="/about/leadership" className="inline-flex items-center gap-2 font-medium text-forest-800 underline-offset-4 hover:underline">
              All messages <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((l) => (
              <LeaderCard key={l.slug} leader={l} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Three decades of service to Usterzai and Kohat."
        body="Read how an idea of five dedicated people in 1993 grew into Al-Asar Degree College."
        primary={{ label: "Our history", href: "/about/history" }}
        secondary={{ label: "Visit the campus", href: "/campus" }}
      />
    </>
  );
}
