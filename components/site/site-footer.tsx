import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { SITE } from "@/lib/site/config";
import { FOOTER_NAV } from "@/lib/site/navigation";
import { getContactDetails } from "@/lib/site/data";
import { BrandMark } from "./brand-mark";

export async function SiteFooter() {
  const contact = await getContactDetails();
  const year = new Date().getFullYear();

  return (
    <footer className="aa-lattice mt-auto bg-forest-950 text-sand-200">
      <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="h-14" />
              <span className="leading-tight">
                <span className="font-display block text-2xl text-sand-50">{SITE.name}</span>
                <span className="text-sm text-sand-200">{SITE.location}</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm leading-relaxed">
              Established under the {SITE.parentBody}, {SITE.parentInstitution}, and affiliated with {SITE.affiliation}.
            </p>

            <address className="mt-8 space-y-3 text-[0.9375rem] not-italic">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" aria-hidden="true" />
                <span>{contact.address ?? `${SITE.location}, ${SITE.region}`}</span>
              </p>
              {contact.phone && (
                <p className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" aria-hidden="true" />
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.email && (
                <p className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </p>
              )}
            </address>

            {(contact.facebookUrl || contact.youtubeUrl) && (
              <div className="mt-6 flex gap-2">
                {contact.facebookUrl && (
                  <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200/30 hover:border-brass-400 hover:text-white">
                    <Facebook className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Facebook</span>
                  </a>
                )}
                {contact.youtubeUrl && (
                  <a href={contact.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200/30 hover:border-brass-400 hover:text-white">
                    <Youtube className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">YouTube</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {FOOTER_NAV.map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-brass-400 uppercase">{col.heading}</p>
                <ul className="space-y-2.5 text-[0.9375rem]">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white hover:underline hover:underline-offset-4">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="mt-14 border-t border-sand-200/15 pt-8 text-center">
          <p className="font-display text-lg text-sand-50 italic">“Students of today, leaders of tomorrow.”</p>
          <footer className="mt-1 text-xs tracking-[0.16em] text-sand-200/70 uppercase">Motto of the Students Council</footer>
        </blockquote>

        <div className="mt-10 flex flex-col gap-3 border-t border-sand-200/15 pt-6 text-sm text-sand-200/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. {SITE.parentBody}.
          </p>
          <div className="flex gap-5">
            <Link href="/policies" className="hover:text-white">
              Rules &amp; Policies
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/login" className="hover:text-white">
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
