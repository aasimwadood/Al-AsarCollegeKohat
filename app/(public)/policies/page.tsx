import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { POLICY_PAGES } from "@/lib/site/policy-index";
import { LIBRARY } from "@/lib/site/content/policies";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Rules & Policies",
  description:
    "Student handbook of Al-Asar Degree College, Kohat: code of honor, discipline rules, attendance, anti-ragging policy, examination rules, uniform and hostel rules.",
  alternates: { canonical: "/policies" },
};

export default function PoliciesPage() {
  return (
    <>
      <PageHero
        eyebrow="Student Handbook"
        title="Rules & policies"
        lede="Students and their parents are expected to abide by the college rules. Matters not covered under the existing rules or KUST rules rest at the absolute discretion of the Principal."
        crumbs={[{ label: "Rules & Policies" }]}
      />
      <Section>
        <Container>
          <ul className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {[...POLICY_PAGES, { slug: "library", href: "/library", title: "Library Rules", summary: LIBRARY.purpose.slice(0, 120) + "…" }].map((p, i) => (
              <li key={p.slug} className="group relative flex flex-col bg-white p-7">
                <span className="font-display text-sm text-brass-700 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="font-display mt-3 text-2xl text-forest-900">
                  <Link href={p.href} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 leading-relaxed text-ink-muted">{p.summary}</p>
                <ArrowUpRight className="mt-5 h-5 w-5 text-forest-800" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
