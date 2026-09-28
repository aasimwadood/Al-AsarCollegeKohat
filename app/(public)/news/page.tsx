import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Megaphone } from "lucide-react";
import { getNews } from "@/lib/site/data";
import { formatDate } from "@/lib/site/format";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "News & Announcements",
  description: "News, notices and announcements from Al-Asar Degree College, Usterzai Payan, Kohat.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <PageHero
        eyebrow="Notice Board"
        title="News & announcements"
        lede="It is the responsibility of the student to read the notice boards regularly for important announcements made by the College authorities from time to time."
        crumbs={[{ label: "News" }]}
      />
      <Section>
        <Container className="max-w-4xl">
          {news.length > 0 ? (
            <ol className="divide-y divide-line border-y border-line">
              {news.map((item) => (
                <li key={item.id} className="group relative grid gap-2 py-7 sm:grid-cols-[180px_1fr] sm:gap-8">
                  <p className="flex items-center gap-2 text-sm text-ink-muted">
                    <CalendarDays className="h-4 w-4 text-brass-700" aria-hidden="true" />
                    <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                  </p>
                  <div>
                    {item.category && <p className="text-xs font-semibold tracking-[0.14em] text-brass-700 uppercase">{item.category}</p>}
                    <h2 className="font-display mt-1 text-2xl leading-snug text-forest-900">
                      <Link href={`/news/${item.id}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
                        {item.title}
                      </Link>
                    </h2>
                    {item.body && <p className="mt-2 line-clamp-2 leading-relaxed text-ink-muted">{item.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center border border-dashed border-sand-300 bg-white px-6 py-16 text-center">
              <Megaphone className="h-10 w-10 text-brass-700" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-display mt-5 text-2xl text-forest-900">No announcements yet</h2>
              <p className="mt-2 max-w-md text-ink-muted">
                Admission notices, merit lists, examination schedules and campus news will be posted here by the college administration.
              </p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
