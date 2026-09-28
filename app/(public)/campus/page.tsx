import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAMPUS_GALLERY, FACILITIES, HOSTELS } from "@/lib/site/content/campus";
import { CAMPUS_AREA_NOTE, WELCOME } from "@/lib/site/content/institution";
import { IMAGES } from "@/lib/site/content/images";
import { BulletList, Container, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Campus & Facilities",
  description:
    "The Al-Asar campus on the green hills between Kohat and Hangu: computer lab, library and digital library, mosque, hostels, gym, dining halls, gardens, parks, grounds and parking.",
  alternates: { canonical: "/campus" },
};

export default function CampusPage() {
  return (
    <>
      <PageHero
        eyebrow="Campus Life"
        title="Campus & facilities"
        lede={WELCOME.paragraphs[5]}
        crumbs={[{ label: "Campus Life" }]}
        image={IMAGES.collegeAerial}
      />

      <section className="bg-forest-900">
        <div className="relative mx-auto aspect-[16/7] max-h-[560px] w-full max-w-[1600px] sm:aspect-[16/5]">
          <Image src={IMAGES.campusPanorama.src} alt={IMAGES.campusPanorama.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <Container className="py-6">
          <p className="text-sm text-sand-200">
            Located outside the city on the top of green hills in the middle of Kohat and Hangu district — its panoramic site, tranquil
            atmosphere and pollution free environment have made it charming and attractive for all.
          </p>
        </Container>
      </section>

      <Section id="facilities">
        <Container>
          <SectionHeading eyebrow="Facilities" title="What the campus offers" lede="Facilities as described in the college prospectus." />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map((f) => (
              <li key={f.name} className="flex flex-col border border-line bg-white">
                {f.image ? (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={f.image.src} alt={f.image.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center border-b border-dashed border-sand-300 bg-sand-100 text-sm text-ink-muted">
                    Photograph to be added
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-xl text-forest-900">{f.name}</h3>
                  <p className="mt-2 leading-relaxed text-ink-muted">{f.source}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 max-w-3xl border-l-2 border-sand-300 pl-5 text-sm leading-relaxed text-ink-muted">
            <p className="font-medium text-forest-900">About the campus area</p>
            <p className="mt-1">{CAMPUS_AREA_NOTE.welcome}</p>
            <p className="mt-1">{CAMPUS_AREA_NOTE.history}</p>
          </div>
        </Container>
      </Section>

      <Section id="hostels" tone="sand" className="border-y border-line">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Hostels" title="Four hostels, each with playground and gym." lede={HOSTELS.intro} />
            <BulletList items={HOSTELS.list} className="mt-8" />
            <div className="aa-prose mt-8">
              {HOSTELS.details.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </div>
            <Link href="/policies/hostel-rules" className="mt-8 inline-flex items-center gap-2 font-medium text-forest-800 underline underline-offset-4">
              Hostel rules and regulations <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            <div className="aa-arch-sm relative col-span-2 aspect-[16/10]">
              <Image src={IMAGES.hostelCorridor.src} alt={IMAGES.hostelCorridor.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={IMAGES.schoolHostelBoys.src} alt={IMAGES.schoolHostelBoys.alt} fill sizes="25vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={IMAGES.diningStudents.src} alt={IMAGES.diningStudents.alt} fill sizes="25vw" className="object-cover" />
            </div>
          </div>
        </Container>
      </Section>

      <Section id="gallery">
        <Container>
          <SectionHeading eyebrow="Gallery" title="Around the campus" />
          <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {CAMPUS_GALLERY.map(({ image, caption }) => (
              <li key={image.src} className="mb-4 break-inside-avoid">
                <figure>
                  <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="h-auto w-full" />
                  <figcaption className="mt-2 text-sm text-ink-muted">{caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand title="Pay us a visit." body="You will soon realize why we are so proud of our institutions." primary={{ label: "Contact & directions", href: "/contact" }} secondary={{ label: "Student life", href: "/student-life" }} />
    </>
  );
}
