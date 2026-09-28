import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LEADERSHIP, getLeader } from "@/lib/site/content/institution";
import { SITE } from "@/lib/site/config";
import { Breadcrumbs, Container, Eyebrow } from "@/components/site/primitives";

export function generateStaticParams() {
  return LEADERSHIP.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = getLeader(slug);
  if (!l) return {};
  return {
    title: `${l.designation}'s Message — ${l.name}`,
    description: `Message from ${l.name}, ${l.designation}, ${l.office} — ${SITE.name}.`,
    alternates: { canonical: `/about/leadership/${l.slug}` },
  };
}

export default async function LeaderMessagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leader = getLeader(slug);
  if (!leader) notFound();
  const others = LEADERSHIP.filter((l) => l.slug !== leader.slug);

  return (
    <article>
      <header className="border-b border-line bg-sand-100">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-16">
          <div>
            <Breadcrumbs items={[{ label: "About", href: "/about" }, { label: "Leadership", href: "/about/leadership" }, { label: leader.designation }]} />
            <Eyebrow className="mt-8">
              {leader.designation}&apos;s Message · {leader.office}
            </Eyebrow>
            <h1 className="font-display mt-4 text-[2.4rem] leading-[1.08] font-medium tracking-[-0.015em] text-forest-900 sm:text-[3.25rem]">{leader.name}</h1>
            <p className="mt-3 text-lg text-ink-muted">
              {leader.designation}, {leader.office}
            </p>
            {leader.credentials && <p className="mt-1 text-sm text-ink-muted">{leader.credentials}</p>}
            {leader.motto && (
              <blockquote className="font-display mt-8 max-w-2xl border-l-2 border-brass-500 pl-6 text-2xl leading-snug text-forest-800 italic">
                “{leader.motto}”
              </blockquote>
            )}
          </div>
          <div className="aa-arch relative mx-auto aspect-[4/5] w-full max-w-[320px] border-4 border-sand-50 bg-forest-800 shadow-[0_24px_48px_-24px_rgb(22_48_36/0.45)] lg:max-w-none">
            <Image
              src={leader.photo.src}
              alt={leader.photo.alt}
              fill
              priority
              sizes="360px"
              className="object-cover"
              style={leader.photoPosition ? { objectPosition: leader.photoPosition } : undefined}
            />
          </div>
        </Container>
      </header>

      <Container className="py-16 sm:py-20">
        <div className="aa-prose mx-auto max-w-[68ch]">
          {leader.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "font-display !text-[1.3rem] !leading-[1.6] text-forest-900" : undefined}>
              {p}
            </p>
          ))}
          {leader.closing && <p className="italic">{leader.closing}</p>}
          {leader.signature && (
            <p className="!mt-10 border-t border-line pt-6">
              <span className="font-display block text-2xl text-forest-900">{leader.signature}</span>
              <span className="text-sm text-ink-muted">
                {leader.designation}, {leader.office}
              </span>
            </p>
          )}
        </div>
      </Container>

      <aside className="border-t border-line bg-sand-100">
        <Container className="grid gap-6 py-12 sm:grid-cols-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/about/leadership/${o.slug}`} className="group flex items-center gap-5 border border-line bg-sand-50 p-5 hover:border-sand-300">
              <span className="aa-arch-sm relative h-20 w-16 shrink-0 bg-forest-800">
                <Image src={o.photo.src} alt="" fill sizes="64px" className="object-cover" style={o.photoPosition ? { objectPosition: o.photoPosition } : undefined} />
              </span>
              <span>
                <span className="block text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{o.designation}&apos;s message</span>
                <span className="font-display mt-1 block text-xl text-forest-900 group-hover:underline group-hover:underline-offset-4">{o.name}</span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 text-forest-800" aria-hidden="true" />
            </Link>
          ))}
        </Container>
      </aside>
    </article>
  );
}
