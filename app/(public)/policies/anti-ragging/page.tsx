import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { ANTI_RAGGING } from "@/lib/site/content/policies";
import { Container, PageHero, RuleList, Section } from "@/components/site/primitives";
import { PolicyBlock } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Anti-Ragging Policy",
  description:
    "Al-Asar Degree College, Kohat has a zero tolerance policy towards ragging. What constitutes ragging and the administrative action taken against students found guilty.",
  alternates: { canonical: "/policies/anti-ragging" },
};

export default function AntiRaggingPage() {
  return (
    <>
      <PageHero eyebrow="Rules & Policies" title="Anti-ragging policy" crumbs={[{ label: "Rules & Policies", href: "/policies" }, { label: "Anti-Ragging" }]} tone="dark" />

      <div className="border-b border-clay-700/30 bg-clay-50">
        <Container className="flex flex-col gap-5 py-10 sm:flex-row sm:items-center">
          <ShieldAlert className="h-12 w-12 shrink-0 text-clay-700" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="font-display text-3xl text-clay-700">Zero tolerance.</p>
            <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ink">{ANTI_RAGGING.statement}</p>
          </div>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-16 lg:grid-cols-2 lg:gap-16">
          <PolicyBlock id="definition" title="What constitutes ragging?" intro={ANTI_RAGGING.definitionIntro}>
            <RuleList items={ANTI_RAGGING.definitions} />
          </PolicyBlock>
          <PolicyBlock id="action" title="Administrative action in the event of ragging" intro={ANTI_RAGGING.actionIntro}>
            <ol className="space-y-2">
              {ANTI_RAGGING.actions.map((a, i) => (
                <li key={a} className="flex gap-4 border-l-[3px] border-clay-700 bg-white px-5 py-4">
                  <span className="font-display text-clay-700 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed text-ink">{a}</span>
                </li>
              ))}
            </ol>
          </PolicyBlock>
        </Container>
      </Section>
    </>
  );
}
