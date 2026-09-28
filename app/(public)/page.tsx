import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BellRing, CalendarDays, Dumbbell, Landmark, Library, Monitor, Trees, UtensilsCrossed } from "lucide-react";
import { SITE, fullTitle } from "@/lib/site/config";
import { IMAGES } from "@/lib/site/content/images";
import { LEADERSHIP, QUAID_MESSAGE, WELCOME, FACTS_IN_CONTEXT } from "@/lib/site/content/institution";
import { PROGRAMS } from "@/lib/site/content/programs";
import { getNews, getSiteSettings, SITE_SETTING_KEYS } from "@/lib/site/data";
import { ButtonLink, Container, CtaBand, Eyebrow, SectionHeading } from "@/components/site/primitives";
import { LeaderCard, MeritFormula, ProgramCard } from "@/components/site/blocks";
import { formatDate } from "@/lib/site/format";

export const metadata: Metadata = {
  title: { absolute: fullTitle },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const ADMISSION_STEPS = [
  { title: "Advertisement", body: "Admissions are advertised in local and national print media and on social media." },
  { title: "Application", body: "Applications are received and processed as per the procedure advertised at the time of admissions." },
  { title: "Merit list", body: "A general merit list is displayed online and/or on departmental notice boards, open for queries." },
  { title: "Provisional offer", body: "The HoD notifies offers of admission; second and third merit lists follow if seats remain." },
  { title: "Verification & confirmation", body: "Original documents are verified by the HoD's office before the admission is confirmed." },
];

export default async function HomePage() {
  const [settings, news] = await Promise.all([getSiteSettings(), getNews(3)]);
  const heroLede =
    settings[SITE_SETTING_KEYS.heroLede] ??
    "BS programs in English, Computer Science and Psychology, in affiliation with Kohat University of Science and Technology — on the green hills between Kohat and Hangu.";
  const admissionsNotice = settings[SITE_SETTING_KEYS.admissionsNotice];

  return (
    <>
      {admissionsNotice && (
        <div className="border-b border-brass-500/40 bg-brass-400/15">
          <Container className="flex items-center gap-3 py-3 text-sm text-forest-900">
            <BellRing className="h-4 w-4 shrink-0 text-brass-700" aria-hidden="true" />
            <p className="flex-1">{admissionsNotice}</p>
            <Link href="/admissions" className="shrink-0 font-medium underline underline-offset-4">
              Admissions
            </Link>
          </Container>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-sand-100">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] bg-forest-900 lg:block">
          <div className="aa-lattice absolute inset-0" />
        </div>
        <Container className="relative grid gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow>Usterzai Payan · Kohat · Khyber Pakhtunkhwa</Eyebrow>
            <h1 className="font-display mt-6 text-[3rem] leading-[0.98] font-medium tracking-[-0.025em] text-forest-900 sm:text-[4.25rem] lg:text-[5rem]">
              Al-Asar
              <span className="block text-[0.62em] leading-[1.1] tracking-[-0.01em] text-forest-700">Degree College</span>
            </h1>
            <p className="font-display mt-6 max-w-xl text-xl leading-snug text-brass-700 italic sm:text-2xl">
              A place of intellectual, moral and spiritual growth.
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{heroLede}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/programs">
                Explore Programs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/admissions" variant="secondary">
                Admissions
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
            <div className="aa-arch relative aspect-[5/6] border-[6px] border-sand-50 shadow-[0_40px_80px_-40px_rgb(14_29_22/0.7)]">
              <Image src={IMAGES.collegeAerial.src} alt={IMAGES.collegeAerial.alt} fill priority sizes="(min-width: 1024px) 520px, 90vw" className="object-cover" style={{ objectPosition: "50% 45%" }} />
            </div>
            <div className="absolute -bottom-6 left-4 max-w-[250px] border border-line bg-sand-50 px-5 py-4 shadow-lg sm:-left-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">Affiliated with</p>
              <p className="font-display mt-1 text-[1.05rem] leading-snug text-forest-900">Kohat University of Science &amp; Technology</p>
            </div>
          </div>
        </Container>

        <div className="relative border-t border-line bg-sand-50">
          <Container>
            <dl className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
              {[
                { k: "BS · 4 years", v: "8 semesters, 2 each year" },
                { k: "3 disciplines", v: "English · Computer Science · Psychology" },
                { k: "Since 1993", v: "Al-Asar Academy, Usterzai Payan" },
                { k: "Session 2024–25", v: "First-ever degree-level entry" },
              ].map((f) => (
                <div key={f.k} className="py-6 pr-4 lg:px-6 lg:first:pl-0">
                  <dt className="font-display text-xl text-forest-900">{f.k}</dt>
                  <dd className="mt-1 text-sm text-ink-muted">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      {/* ── Introduction ─────────────────────────────────────── */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="aa-reveal">
            <SectionHeading
              eyebrow="Welcome"
              title="Not a business — a welfare society's commitment to its community."
            />
            <div className="mt-10 grid grid-cols-5 gap-3">
              <div className="aa-arch-sm relative col-span-3 aspect-[3/4]">
                <Image src={IMAGES.campusCourtyard.src} alt={IMAGES.campusCourtyard.alt} fill sizes="(min-width: 1024px) 300px, 60vw" className="object-cover" />
              </div>
              <div className="col-span-2 flex flex-col gap-3 pt-10">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={IMAGES.mosque.src} alt={IMAGES.mosque.alt} fill sizes="200px" className="object-cover" />
                </div>
                <div className="relative aspect-square overflow-hidden">
                  <Image src={IMAGES.libraryShelves.src} alt={IMAGES.libraryShelves.alt} fill sizes="200px" className="object-cover" style={{ objectPosition: "30% 50%" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="aa-reveal lg:pt-14">
            <div className="aa-prose">
              <p className="font-display !text-[1.35rem] !leading-[1.55] text-forest-900">{WELCOME.paragraphs[1]}</p>
              <p>{WELCOME.paragraphs[2]}</p>
              <p>
                Al-Asar is not a private institution built for business purposes only, rather is a welfare society which every year offers free
                education (along with all academic expenses) for orphans and poor people in the shape of scholarships.
              </p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {FACTS_IN_CONTEXT.slice(0, 2).map((f) => (
                <div key={f.label} className="bg-white p-6">
                  <p className="font-display text-4xl text-forest-900">{f.value}</p>
                  <p className="mt-2 font-medium text-forest-900">{f.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">{f.context}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/about" className="inline-flex items-center gap-2 font-medium text-forest-800 underline-offset-4 hover:underline">
                Read the full welcome <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/about/history" className="inline-flex items-center gap-2 font-medium text-forest-800 underline-offset-4 hover:underline">
                Our history since 1993 <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Programs ─────────────────────────────────────────── */}
      <section className="border-y border-line bg-sand-100 py-20 sm:py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="BS Programs"
              title="Three disciplines to begin with."
              lede="Four-year BS degree programs of eight semesters, offered in affiliation with Kohat University of Science and Technology."
            />
            <ButtonLink href="/programs" variant="secondary" className="shrink-0">
              All programs
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program, i) => (
              <div key={program.slug} className="aa-reveal">
                <ProgramCard program={program} index={i} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-muted">
            The college building has capacity for more programs —{" "}
            <Link href="/programs#future-programs" className="font-medium text-forest-800 underline underline-offset-4">
              see planned future programs
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* ── Leadership ───────────────────────────────────────── */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Messages"
            title="From the leadership of Al-Asar"
            lede="The Chairman of the Al-Asar Welfare Society, the Coordinator of Al-Asar Academy and the Principal of the Degree College."
          />
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {LEADERSHIP.map((leader) => (
              <div key={leader.slug} className="aa-reveal">
                <LeaderCard leader={leader} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Quaid's message ──────────────────────────────────── */}
      <section className="aa-lattice relative overflow-hidden bg-forest-900 py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          <div className="aa-arch relative mx-auto aspect-[3/4] w-40 border-4 border-brass-500/60 lg:w-full">
            <Image src={IMAGES.quaid.src} alt={IMAGES.quaid.alt} fill sizes="220px" className="object-cover" />
          </div>
          <figure>
            <Eyebrow light>{QUAID_MESSAGE.heading}</Eyebrow>
            <blockquote className="font-display mt-6 text-[1.5rem] leading-[1.45] text-sand-50 sm:text-[1.9rem]">“{QUAID_MESSAGE.quote}”</blockquote>
            <figcaption className="mt-6 text-sand-200">
              <span className="font-medium text-brass-400">{QUAID_MESSAGE.attribution}</span> — {QUAID_MESSAGE.context.replace(" — ", ", ")}
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* ── Campus ───────────────────────────────────────────── */}
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <SectionHeading
              eyebrow="Campus"
              title="An eco-friendly campus on the hills between Kohat and Hangu."
            />
            <p className="text-lg leading-relaxed text-ink-muted">
              Open air building, gardens, parks, grounds, parking areas, hostels and gym — its panoramic site, tranquil atmosphere and
              pollution free environment have made it charming and attractive for all.
            </p>
          </div>

          <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
            <figure className="relative col-span-2 row-span-2 overflow-hidden">
              <Image src={IMAGES.campusPanorama.src} alt={IMAGES.campusPanorama.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" style={{ objectPosition: "60% 50%" }} />
            </figure>
            <figure className="relative overflow-hidden">
              <Image src={IMAGES.mosque.src} alt={IMAGES.mosque.alt} fill sizes="25vw" className="object-cover" />
            </figure>
            <figure className="relative overflow-hidden">
              <Image src={IMAGES.computerLab.src} alt={IMAGES.computerLab.alt} fill sizes="25vw" className="object-cover" />
            </figure>
            <figure className="relative overflow-hidden">
              <Image src={IMAGES.libraryHall.src} alt={IMAGES.libraryHall.alt} fill sizes="25vw" className="object-cover" />
            </figure>
            <figure className="relative overflow-hidden">
              <Image src={IMAGES.diningStudents.src} alt={IMAGES.diningStudents.alt} fill sizes="25vw" className="object-cover" />
            </figure>
          </div>

          <ul className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-6">
            {[
              { icon: Monitor, label: "Computer Lab", href: "/campus#facilities" },
              { icon: Library, label: "Library & Digital Library", href: "/library" },
              { icon: Landmark, label: "Mosque", href: "/campus#facilities" },
              { icon: UtensilsCrossed, label: "Dining Halls", href: "/campus#facilities" },
              { icon: Dumbbell, label: "Hostels & Gym", href: "/campus#hostels" },
              { icon: Trees, label: "Gardens & Grounds", href: "/campus#facilities" },
            ].map(({ icon: Icon, label, href }) => (
              <li key={label} className="bg-white">
                <Link href={href} className="flex h-full items-center gap-3 px-5 py-4 text-[0.9375rem] text-forest-900 transition-colors hover:bg-sand-100">
                  <Icon className="h-5 w-5 shrink-0 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Admissions ───────────────────────────────────────── */}
      <section className="border-y border-line bg-white py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Admissions"
              title="Admission on merit."
              lede="For Bachelor/BS (4-year) programs, merit is determined from SSC, HSSC and the entrance test."
            />
            <div className="mt-10">
              <MeritFormula />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/admissions">How admission works</ButtonLink>
              <ButtonLink href="/admissions/fee-structure" variant="secondary">
                Fee &amp; refund policy
              </ButtonLink>
            </div>
          </div>
          <ol className="relative space-y-0 border-l border-line pl-8">
            {ADMISSION_STEPS.map((step, i) => (
              <li key={step.title} className="relative pb-8 last:pb-0">
                <span className="font-display absolute top-0 -left-[49px] flex h-8 w-8 items-center justify-center rounded-full border border-brass-500 bg-sand-50 text-sm text-brass-700">
                  {i + 1}
                </span>
                <p className="font-display text-xl text-forest-900">{step.title}</p>
                <p className="mt-1 leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Announcements ────────────────────────────────────── */}
      <section className="bg-sand-50 py-20">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Notice Board" title="News & announcements" />
            <Link href="/news" className="hidden shrink-0 items-center gap-2 font-medium text-forest-800 underline-offset-4 hover:underline sm:inline-flex">
              All announcements <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {news.length > 0 ? (
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {news.map((item) => (
                <li key={item.id} className="group relative border-t-2 border-forest-800 bg-white p-6">
                  <p className="flex items-center gap-2 text-sm text-ink-muted">
                    <CalendarDays className="h-4 w-4 text-brass-700" aria-hidden="true" />
                    <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                    {item.category && <span className="ml-auto text-xs font-semibold tracking-[0.12em] text-brass-700 uppercase">{item.category}</span>}
                  </p>
                  <h3 className="font-display mt-3 text-xl leading-snug text-forest-900">
                    <Link href={`/news/${item.id}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                      {item.title}
                    </Link>
                  </h3>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 max-w-2xl border-l-2 border-brass-500 pl-5 text-ink-muted">
              Announcements about admissions, merit lists, examinations and campus events will appear here as they are published by the
              college. Students are expected to read the notice boards regularly.
            </p>
          )}
        </Container>
      </section>

      <CtaBand
        title="Come and see Al-Asar for yourself."
        body="To really understand the warm and welcoming atmosphere that makes Al-Asar different, you have to experience the college in person."
        primary={{ label: "Admissions", href: "/admissions" }}
        secondary={{ label: "Contact the college", href: "/contact" }}
      />
    </>
  );
}
