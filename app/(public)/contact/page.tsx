import type { Metadata } from "next";
import { Clock, Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { SITE } from "@/lib/site/config";
import { getContactDetails } from "@/lib/site/data";
import { Container, PageHero, PendingInfo, Section } from "@/components/site/primitives";
import { SiteContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.name}, ${SITE.location}, ${SITE.region}.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const contact = await getContactDetails();
  const rows = [
    { icon: MapPin, label: "Address", value: contact.address ?? `${SITE.name}, ${SITE.location}, ${SITE.region}` },
    contact.phone && { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, "")}` },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.officeHours && { icon: Clock, label: "Office hours", value: contact.officeHours },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];
  const missing = [!contact.phone && "phone number", !contact.email && "email address", !contact.officeHours && "office hours"].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Visit or write to us"
        lede="To really understand the warm and welcoming atmosphere that makes Al-Asar different, you have to experience the college in person."
        crumbs={[{ label: "Contact" }]}
      />
      <Section>
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <h2 className="font-display text-[1.75rem] text-forest-900">{SITE.name}</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {rows.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-4 py-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass-700" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{label}</dt>
                    <dd className="mt-1 whitespace-pre-line text-forest-900">
                      {href ? (
                        <a href={href} className="underline-offset-4 hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            {missing.length > 0 && (
              <PendingInfo title="More contact details coming soon" className="mt-6">
                The college&apos;s {missing.join(", ")} will be listed here once published by the administration.
              </PendingInfo>
            )}

            {(contact.facebookUrl || contact.youtubeUrl) && (
              <div className="mt-6 flex gap-3">
                {contact.facebookUrl && (
                  <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-forest-900 hover:border-forest-700">
                    <Facebook className="h-4 w-4" aria-hidden="true" /> Facebook
                  </a>
                )}
                {contact.youtubeUrl && (
                  <a href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-forest-900 hover:border-forest-700">
                    <Youtube className="h-4 w-4" aria-hidden="true" /> YouTube
                  </a>
                )}
              </div>
            )}

            <div className="mt-8">
              {contact.mapEmbedUrl ? (
                <iframe
                  src={contact.mapEmbedUrl}
                  title={`Map showing ${SITE.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full border border-line"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center border border-dashed border-sand-300 bg-sand-100 p-6 text-center">
                  <MapPin className="h-8 w-8 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
                  <p className="font-display mt-3 text-lg text-forest-900">{SITE.location}</p>
                  <p className="mt-1 text-sm text-ink-muted">On the green hills in the middle of Kohat and Hangu district.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border border-line bg-white p-6 sm:p-10">
            <h2 className="font-display text-[1.75rem] text-forest-900">Send an enquiry</h2>
            <p className="mt-2 mb-8 text-ink-muted">Questions about admissions, programs or the campus — the college office will get back to you.</p>
            <SiteContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
