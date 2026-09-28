import type { Metadata } from "next";
import { LEADERSHIP } from "@/lib/site/content/institution";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { LeaderCard } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Leadership Messages",
  description:
    "Messages from Haji Ahmad Raza, Chairman Al-Asar Welfare Society; Prof. Engr. Iqbal Zeb Khattak, Coordinator; and Prof. Zafrullah Khan Wazir, Principal, Al-Asar Degree College.",
  alternates: { canonical: "/about/leadership" },
};

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Messages from our leadership"
        lede="The people who guide Al-Asar Welfare Society, Al-Asar Academy and the Degree College, in their own words."
        crumbs={[{ label: "About", href: "/about" }, { label: "Leadership" }]}
      />
      <Section>
        <Container className="grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP.map((l) => (
            <LeaderCard key={l.slug} leader={l} />
          ))}
        </Container>
      </Section>
    </>
  );
}
