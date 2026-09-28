import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getNewsItem } from "@/lib/site/data";
import { formatDate } from "@/lib/site/format";
import { Breadcrumbs, Container } from "@/components/site/primitives";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) return { title: "Announcement" };
  return { title: item.title, description: item.body?.slice(0, 160) ?? undefined, alternates: { canonical: `/news/${item.id}` } };
}

export default async function NewsItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) notFound();

  return (
    <article>
      <header className="border-b border-line bg-sand-100">
        <Container className="max-w-3xl py-12 sm:py-16">
          <Breadcrumbs items={[{ label: "News", href: "/news" }, { label: "Announcement" }]} />
          {item.category && <p className="aa-eyebrow mt-8">{item.category}</p>}
          <h1 className="font-display mt-4 text-[2.25rem] leading-[1.12] font-medium text-forest-900 sm:text-[2.9rem]">{item.title}</h1>
          <p className="mt-5 flex items-center gap-2 text-ink-muted">
            <CalendarDays className="h-4 w-4 text-brass-700" aria-hidden="true" />
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          </p>
        </Container>
      </header>
      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="aa-prose">
          {(item.body ?? "").split(/\n{2,}/).filter(Boolean).map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
        <Link href="/news" className="mt-12 inline-flex items-center gap-2 font-medium text-forest-800 underline underline-offset-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All announcements
        </Link>
      </Container>
    </article>
  );
}
