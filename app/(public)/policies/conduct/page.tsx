import type { Metadata } from "next";
import { CODE_OF_HONOR, DISCIPLINE_GUIDELINES, INDISCIPLINE, PENALTIES, POINTS_TO_REMEMBER, PROHIBITED_ACTS } from "@/lib/site/content/policies";
import { Callout, Container, OnThisPage, PageHero, RuleList } from "@/components/site/primitives";
import { PolicyBlock } from "@/components/site/blocks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Code of Honor & Discipline",
  description: "Students' code of honor, discipline guidelines, prohibited acts, acts of indiscipline and penalties at Al-Asar Degree College, Kohat.",
  alternates: { canonical: "/policies/conduct" },
};

export default function ConductPage() {
  const toc = [
    { id: "honor", label: "Code of honor" },
    { id: "guidelines", label: "Guidelines" },
    { id: "remember", label: "Points to remember" },
    { id: "misconduct", label: "Action against misconduct" },
    { id: "penalties", label: "Penalties" },
  ];
  return (
    <>
      <PageHero eyebrow="Rules & Policies" title="Students code of honor and discipline rules" crumbs={[{ label: "Rules & Policies", href: "/policies" }, { label: "Code of Honor & Discipline" }]} />
      <Container className="grid gap-12 py-16 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
        <aside className="hidden lg:block">
          <div className="sticky top-32">
            <OnThisPage items={toc} />
          </div>
        </aside>
        <div className="min-w-0 space-y-20">
          <PolicyBlock id="honor" title="Students code of honor" intro="Every student shall observe the following code of honor:">
            <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {CODE_OF_HONOR.map((item, i) => (
                <li key={item} className="bg-white p-5">
                  <span className="font-display text-sm text-brass-700">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 leading-relaxed text-forest-900">{item}</p>
                </li>
              ))}
            </ul>
          </PolicyBlock>

          <PolicyBlock id="guidelines" title="Guidelines" intro="Students seeking admission must acquaint themselves with the following rules and regulations:">
            <RuleList items={DISCIPLINE_GUIDELINES} />
          </PolicyBlock>

          <PolicyBlock id="remember" title="Points to remember">
            <RuleList items={POINTS_TO_REMEMBER} />
          </PolicyBlock>

          <PolicyBlock id="misconduct" title="Action against misconduct">
            <Accordion type="multiple" defaultValue={["prohibited", "indiscipline"]} className="border-t border-line">
              <AccordionItem value="prohibited" className="border-line">
                <AccordionTrigger className="font-display py-5 text-xl text-forest-900 hover:no-underline">Prohibited acts</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4 text-ink-muted">{PROHIBITED_ACTS.intro}</p>
                  <RuleList items={PROHIBITED_ACTS.items} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="indiscipline" className="border-line">
                <AccordionTrigger className="font-display py-5 text-xl text-forest-900 hover:no-underline">Acts of indiscipline</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4 text-ink-muted">{INDISCIPLINE.intro}</p>
                  <RuleList items={INDISCIPLINE.items} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </PolicyBlock>

          <PolicyBlock id="penalties" title="Penalties">
            <Callout tone="clay">{PENALTIES}</Callout>
          </PolicyBlock>
        </div>
      </Container>
    </>
  );
}
