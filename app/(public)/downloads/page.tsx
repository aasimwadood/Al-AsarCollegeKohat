import type { Metadata } from "next";
import { getDownloads } from "@/lib/site/data";
import { Container, PageHero, PendingInfo, Section } from "@/components/site/primitives";
import { DownloadBrowser } from "./download-browser";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Admission forms, notices and documents from Al-Asar Degree College, Kohat.",
  alternates: { canonical: "/downloads" },
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function DownloadsPage() {
  const { categories, files } = await getDownloads();

  return (
    <>
      <PageHero eyebrow="Admissions" title="Downloads" lede="Forms, notices and documents published by the college." crumbs={[{ label: "Admissions", href: "/admissions" }, { label: "Downloads" }]} />
      {categories.length > 0 ? (
        <DownloadBrowser
          categories={categories}
          documents={files.map((f) => ({ id: f.id, category_id: f.categoryId, title: f.title, uploaded_at: f.uploadedAt, url: f.url, sizeLabel: formatSize(f.sizeBytes) }))}
        />
      ) : (
        <Section>
          <Container className="max-w-3xl">
            <PendingInfo title="No documents have been published yet.">
              Admission forms and notices will be available here when the college publishes them. Fee details and fee slips are available from the
              Administration / Accounts Office.
            </PendingInfo>
          </Container>
        </Section>
      )}
    </>
  );
}
