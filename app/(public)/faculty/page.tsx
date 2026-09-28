import type { Metadata } from "next";
import Image from "next/image";
import { getFacultyDirectory } from "@/lib/site/data";
import { DEPARTMENTS } from "@/lib/site/content/programs";
import { Container, PageHero, PendingInfo, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Faculty",
  description: "Faculty of the Departments of English, Computer Science and Psychology at Al-Asar Degree College, Kohat.",
  alternates: { canonical: "/faculty" },
};

export default async function FacultyPage() {
  const faculty = await getFacultyDirectory();
  const groups = new Map<string, typeof faculty>();
  for (const f of faculty) {
    const key = f.department ?? "Faculty";
    groups.set(key, [...(groups.get(key) ?? []), f]);
  }

  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="Faculty"
        lede="The faculty will prove that they are mentors, leaders, guides, helpers and facilitators in your pursuit of academic achievements and leadership qualities."
        crumbs={[{ label: "Academics", href: "/academics" }, { label: "Faculty" }]}
      />
      <Section>
        <Container>
          {faculty.length === 0 ? (
            <div className="max-w-3xl space-y-6">
              <PendingInfo title="The faculty directory has not been published yet.">
                Profiles of faculty members will appear here once the college administration adds them. The prospectus names the following
                academic lead:
              </PendingInfo>
              <div className="border border-line bg-white p-6">
                <p className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{DEPARTMENTS[0]?.name}</p>
                <p className="font-display mt-2 text-2xl text-forest-900">Prof. Zafrullah Khan Wazir</p>
                <p className="mt-1 text-ink-muted">Leads the department&apos;s faculty; Principal, Al-Asar Degree College.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {[...groups.entries()].map(([dept, members]) => (
                <section key={dept} aria-labelledby={`dept-${dept}`}>
                  <h2 id={`dept-${dept}`} className="font-display border-b border-line pb-3 text-2xl text-forest-900">
                    {dept}
                  </h2>
                  <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((m) => (
                      <li key={m.id}>
                        <div className="aa-arch-sm relative aspect-[4/5] bg-sand-200">
                          {m.photoUrl ? (
                            <Image src={m.photoUrl} alt={m.name} fill sizes="(min-width: 1024px) 260px, 50vw" className="object-cover" />
                          ) : (
                            <span className="font-display absolute inset-0 flex items-center justify-center text-4xl text-forest-700" aria-hidden="true">
                              {m.name.split(/\s+/).filter((w) => !/^(prof|dr|mr|ms|mrs|engr)\.?$/i.test(w)).slice(0, 2).map((w) => w[0]).join("")}
                            </span>
                          )}
                        </div>
                        <p className="font-display mt-4 text-xl text-forest-900">{m.name}</p>
                        {m.designation && <p className="text-sm font-medium text-brass-700">{m.designation}</p>}
                        {m.qualification && <p className="mt-1 text-sm text-ink-muted">{m.qualification}</p>}
                        {m.specialization && <p className="text-sm text-ink-muted">{m.specialization}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
