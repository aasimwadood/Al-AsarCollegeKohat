import type { Metadata } from "next";
import Image from "next/image";
import { HISTORY, JOURNEY, FUTURE, ACADEMY_COMPONENTS } from "@/lib/site/content/institution";
import { IMAGES } from "@/lib/site/content/images";
import { BulletList, Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Our History",
  description:
    "The history of Al-Asar Academy and Al-Asar Degree College, Usterzai Payan, Kohat — from an idea of five dedicated people in 1993 to degree-level education.",
  alternates: { canonical: "/about/history" },
};

export default function HistoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Our History"
        title="From a community idea in 1993 to a degree college."
        lede={HISTORY.paragraphs[0]}
        crumbs={[{ label: "About", href: "/about" }, { label: "Our History" }]}
        image={IMAGES.campusBuildings}
      />

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="How it began" title="Helping the needy and deserving students of Usterzai." />
            <div className="aa-prose mt-8">
              {HISTORY.paragraphs.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>{HISTORY.closing}</p>
            </div>
          </div>
          <ol className="relative border-l border-brass-500/50 pl-8">
            {JOURNEY.map((j) => (
              <li key={j.title} className="relative pb-12 last:pb-0">
                <span aria-hidden="true" className="absolute top-2 -left-[37px] h-3 w-3 rotate-45 border border-brass-500 bg-sand-50" />
                <p className="font-display text-sm tracking-[0.12em] text-brass-700 uppercase">{j.marker}</p>
                <h3 className="font-display mt-1 text-2xl text-forest-900">{j.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{j.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="sand" className="border-y border-line">
        <Container>
          <SectionHeading eyebrow="Our Community" title="The Academy today" lede="Apart from Al-Asar Degree College, the Academy comprises of:" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <BulletList items={ACADEMY_COMPONENTS} columns={2} />
            <div className="grid grid-cols-2 gap-3">
              {[IMAGES.mosque, IMAGES.diningTeachers, IMAGES.schoolHostelBoys, IMAGES.campusHillside].map((img) => (
                <figure key={img.src} className="relative aspect-[4/3] overflow-hidden">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                </figure>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="future">
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Our Future" title="Room for more programs." />
            <div className="aa-prose mt-8">
              {FUTURE.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brass-500/60 px-4 py-1.5 text-sm text-brass-700">
              Future / planned — not currently offered
            </p>
            <ul className="grid gap-px overflow-hidden border border-dashed border-sand-300 bg-sand-300/60 sm:grid-cols-2">
              {FUTURE.plannedPrograms.map((name) => (
                <li key={name} className="bg-sand-50 px-5 py-3.5 text-forest-900">
                  {name}
                </li>
              ))}
              <li className="bg-sand-50 px-5 py-3.5 text-ink-muted italic">{FUTURE.plannedProgramsNote}</li>
            </ul>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Be part of the next chapter."
        body="Al-Asar Degree College welcomes its first-ever BS students."
        primary={{ label: "Explore programs", href: "/programs" }}
        secondary={{ label: "Admissions", href: "/admissions" }}
      />
    </>
  );
}
