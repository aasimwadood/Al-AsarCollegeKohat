import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DEPARTMENTS } from "@/lib/site/content/programs";
import { IMAGES } from "@/lib/site/content/images";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { DepartmentIcon } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Departments",
  description: "The Departments of English, Computer Science and Psychology at Al-Asar Degree College, Usterzai Payan, Kohat.",
  alternates: { canonical: "/departments" },
};

export default function DepartmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="Departments"
        lede="Three disciplines of the BS program, initially established under the umbrella of the Al-Asar Welfare Society, Al-Asar Academy, Usterzai Payan, Kohat."
        crumbs={[{ label: "Academics", href: "/academics" }, { label: "Departments" }]}
        image={IMAGES.englishSign}
      />
      <Section>
        <Container className="space-y-6">
          {DEPARTMENTS.map((d, i) => (
            <article key={d.slug} className="group relative grid overflow-hidden border border-line bg-white md:grid-cols-[320px_1fr]">
              <div className="relative aspect-[16/9] md:aspect-auto">
                <Image src={d.image.src} alt={d.image.alt} fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col p-7 sm:p-9">
                <div className="flex items-center gap-3 text-brass-700">
                  <DepartmentIcon icon={d.icon} className="h-6 w-6" />
                  <span className="font-display text-sm tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="font-display mt-3 text-[1.9rem] leading-tight font-medium text-forest-900">
                  <Link href={`/departments/${d.slug}`} className="after:absolute after:inset-0">
                    {d.name}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted">{d.tagline}</p>
                <p className="mt-6 inline-flex items-center gap-1.5 font-medium text-forest-800 group-hover:underline group-hover:underline-offset-4">
                  Visit department <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </p>
              </div>
            </article>
          ))}
        </Container>
      </Section>
    </>
  );
}
