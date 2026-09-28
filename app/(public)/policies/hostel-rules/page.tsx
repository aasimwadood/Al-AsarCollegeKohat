import type { Metadata } from "next";
import { HOSTEL_RULES } from "@/lib/site/content/policies";
import { HOSTELS } from "@/lib/site/content/campus";
import { Callout, Container, PageHero, RuleList, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Hostel Rules",
  description: "Hostel rules and regulations for students living in the Al-Asar hostels, Usterzai Payan, Kohat.",
  alternates: { canonical: "/policies/hostel-rules" },
};

export default function HostelRulesPage() {
  return (
    <>
      <PageHero eyebrow="Rules & Policies" title="Hostel rules and regulations" lede={HOSTELS.applicationNote} crumbs={[{ label: "Rules & Policies", href: "/policies" }, { label: "Hostel Rules" }]} />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <RuleList items={HOSTEL_RULES} />
          <aside>
            <Callout tone="forest" title="Visiting hours">
              Visitors are allowed only in the Warden Room between 4:30 p.m. and 6:30 p.m.
            </Callout>
            <Callout tone="sand" title="Lights out" className="mt-4">
              All lights must be switched off before 11 pm in the rooms. Only study lamps are permitted.
            </Callout>
          </aside>
        </Container>
      </Section>
    </>
  );
}
