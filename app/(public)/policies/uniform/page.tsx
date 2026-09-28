import type { Metadata } from "next";
import { Snowflake, Sun } from "lucide-react";
import { UNIFORM } from "@/lib/site/content/policies";
import { BulletList, Callout, Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Uniform",
  description: "Summer and winter uniform for boys and girls at Al-Asar Degree College, Kohat, and general uniform rules.",
  alternates: { canonical: "/policies/uniform" },
};

function UniformCard({ title, data }: { title: string; data: { summer: string[]; winter: string } }) {
  return (
    <article className="border border-line bg-white">
      <h2 className="font-display border-b border-line bg-sand-100 px-6 py-4 text-2xl text-forest-900">{title}</h2>
      <div className="space-y-6 p-6">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">
            <Sun className="h-4 w-4" aria-hidden="true" /> Summer
          </p>
          <BulletList items={data.summer} />
        </div>
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">
            <Snowflake className="h-4 w-4" aria-hidden="true" /> Winter
          </p>
          <p className="leading-relaxed text-ink">{data.winter}</p>
        </div>
      </div>
    </article>
  );
}

export default function UniformPage() {
  return (
    <>
      <PageHero eyebrow="Rules & Policies" title="Uniform" lede="Neat and complete uniform, according to the season, is a must for all. College students are not allowed to enter the college gate without uniform." crumbs={[{ label: "Rules & Policies", href: "/policies" }, { label: "Uniform" }]} />
      <Section>
        <Container className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <UniformCard title="Boys" data={UNIFORM.boys} />
            <UniformCard title="Girls" data={UNIFORM.girls} />
          </div>
          <Callout tone="sand" title="General">
            <BulletList items={UNIFORM.general} className="mt-2" />
          </Callout>
        </Container>
      </Section>
    </>
  );
}
