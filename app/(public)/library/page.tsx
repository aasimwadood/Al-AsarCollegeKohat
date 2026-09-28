import type { Metadata } from "next";
import Image from "next/image";
import { BookCopy, Clock3, Laptop, UserCheck } from "lucide-react";
import { LIBRARY } from "@/lib/site/content/policies";
import { IMAGES } from "@/lib/site/content/images";
import { BulletList, Callout, Container, PageHero, RuleList, Section, SectionHeading } from "@/components/site/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Library",
  description:
    "The Al-Asar Degree College library and digital library: membership, borrowing rules, loan periods, damage and loss, general rules, internet use and clearance.",
  alternates: { canonical: "/library" },
};

const TABS = [
  { value: "borrowing", label: "Borrowing" },
  { value: "loans", label: "Loan periods" },
  { value: "damage", label: "Damage & loss" },
  { value: "rules", label: "General rules" },
  { value: "digital", label: "Digital library" },
  { value: "clearance", label: "Clearance" },
];

export default function LibraryPage() {
  return (
    <>
      <PageHero eyebrow="Library" title="The Library" lede={LIBRARY.purpose} crumbs={[{ label: "Library" }]} image={IMAGES.libraryShelves} imagePosition="30% 50%" />

      <Section>
        <Container>
          <div className="grid gap-3 sm:grid-cols-3">
            {[IMAGES.libraryHall, IMAGES.libraryReading, IMAGES.libraryAssembly].map((img) => (
              <figure key={img.src} className="relative aspect-[4/3] overflow-hidden">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
              </figure>
            ))}
          </div>

          <dl className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserCheck, k: "Members", v: "All staff and students of the College" },
              { icon: BookCopy, k: "Students", v: "4 books for 14 days" },
              { icon: Clock3, k: "Overdue fine", v: "Rs. 50 per day" },
              { icon: Laptop, k: "Internet", v: "One hour per user" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex gap-4 bg-white p-6">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{k}</dt>
                  <dd className="font-display mt-1 text-lg leading-snug text-forest-900">{v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="white" className="border-y border-line">
        <Container>
          <SectionHeading eyebrow="Library Rules" title="Membership, loans and conduct" />
          <Tabs defaultValue="borrowing" className="mt-10 gap-0">
            <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-line bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-4 pt-2 pb-3 text-[0.9375rem] text-ink-muted shadow-none data-[state=active]:border-brass-500 data-[state=active]:bg-transparent data-[state=active]:text-forest-900 data-[state=active]:shadow-none"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="borrowing" className="pt-8">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <h3 className="font-display text-2xl text-forest-900">Loan privileges</h3>
                  <p className="mt-2 text-ink-muted">The following categories of members will be allowed to use the library:</p>
                  <BulletList items={LIBRARY.members} className="mt-4" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-forest-900">Borrowing of books</h3>
                  <RuleList items={LIBRARY.borrowing} className="mt-4" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loans" className="pt-8">
              <h3 className="font-display text-2xl text-forest-900">Loan period</h3>
              <p className="mt-2 text-ink-muted">The following categories of members shall observe the loan schedule mentioned against each:</p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full max-w-2xl text-left">
                  <caption className="sr-only">Library loan periods</caption>
                  <thead className="text-xs tracking-[0.08em] text-ink-muted uppercase">
                    <tr className="border-b border-line">
                      <th scope="col" className="py-3 font-medium">Member</th>
                      <th scope="col" className="py-3 font-medium">Books</th>
                      <th scope="col" className="py-3 font-medium">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LIBRARY.loanPeriods.map((l) => (
                      <tr key={l.member} className="border-b border-line">
                        <th scope="row" className="py-4 pr-4 font-medium text-forest-900">{l.member}</th>
                        <td className="font-display py-4 text-xl text-forest-900">{String(l.books).padStart(2, "0")}</td>
                        <td className="py-4 text-ink">{l.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="font-display mt-12 text-2xl text-forest-900">Consult in the library only</h3>
              <p className="mt-2 text-ink-muted">{LIBRARY.referenceOnlyIntro}</p>
              <BulletList items={LIBRARY.referenceOnly} columns={2} className="mt-5" />
            </TabsContent>

            <TabsContent value="damage" className="pt-8">
              <h3 className="font-display text-2xl text-forest-900">Damage and loss of books</h3>
              <RuleList items={LIBRARY.damageLoss} className="mt-4 max-w-3xl" />
            </TabsContent>

            <TabsContent value="rules" className="pt-8">
              <h3 className="font-display text-2xl text-forest-900">General rules</h3>
              <RuleList items={LIBRARY.generalRules} className="mt-4 max-w-3xl" />
            </TabsContent>

            <TabsContent value="digital" className="pt-8">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
                <div>
                  <h3 className="font-display text-2xl text-forest-900">Digital library &amp; internet use</h3>
                  <RuleList items={LIBRARY.digital} className="mt-4" />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={IMAGES.computerLab.src} alt={IMAGES.computerLab.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clearance" className="pt-8">
              <h3 className="font-display text-2xl text-forest-900">Clearance requirements</h3>
              <RuleList items={LIBRARY.clearance} className="mt-4 max-w-3xl" />
              <Callout tone="sand" className="mt-8 max-w-3xl">
                No student shall be allowed to appear in the examination held by the College without a library clearance slip.
              </Callout>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>
    </>
  );
}
