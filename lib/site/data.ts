import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "./config";

/**
 * Admin-managed content for the public site, read from the existing public
 * CMS tables (0009/0042) scoped to this deployment's college row
 * (`colleges.slug = SITE.collegeSlug`). Every reader degrades to "nothing
 * published yet" — never to another college's data and never to invented
 * values — when the row, the table or the network isn't there.
 */

export const getSiteCollege = cache(async () => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("colleges")
      .select("id, name, address, contact_number, email, facebook_url, twitter_url, youtube_url")
      .eq("slug", SITE.collegeSlug)
      .eq("status", "active")
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
});

/** site_settings keys the public site reads (edited under Dashboard → System Settings). */
export const SITE_SETTING_KEYS = {
  heroLede: "WelcomeToOurInstitution",
  admissionsNotice: "AdmissionsNotice",
  contactPhone: "ContactPhone",
  contactEmail: "ContactEmail",
  contactAddress: "ContactAddress",
  officeHours: "OfficeHours",
  mapEmbedUrl: "MapEmbedUrl",
  facebookUrl: "FacebookUrl",
  youtubeUrl: "YoutubeUrl",
} as const;

export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  const college = await getSiteCollege();
  if (!college) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("key, value").eq("college_id", college.id);
    return Object.fromEntries((data ?? []).filter((s) => s.value?.trim()).map((s) => [s.key, s.value.trim()]));
  } catch {
    return {};
  }
});

export type ContactDetails = {
  phone: string | null;
  email: string | null;
  address: string | null;
  officeHours: string | null;
  mapEmbedUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
};

/** Contact details exist only if an admin has entered them — none are hardcoded. */
export const getContactDetails = cache(async (): Promise<ContactDetails> => {
  const [college, settings] = await Promise.all([getSiteCollege(), getSiteSettings()]);
  const k = SITE_SETTING_KEYS;
  const mapUrl = settings[k.mapEmbedUrl] ?? null;
  return {
    phone: settings[k.contactPhone] ?? college?.contact_number ?? null,
    email: settings[k.contactEmail] ?? college?.email ?? null,
    address: settings[k.contactAddress] ?? college?.address ?? null,
    officeHours: settings[k.officeHours] ?? null,
    // Only embed Google Maps URLs; anything else is ignored rather than framed.
    mapEmbedUrl: mapUrl && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(mapUrl) ? mapUrl : null,
    facebookUrl: settings[k.facebookUrl] ?? college?.facebook_url ?? null,
    youtubeUrl: settings[k.youtubeUrl] ?? college?.youtube_url ?? null,
  };
});

export type NewsItem = { id: string; title: string; body: string | null; category: string | null; publishedAt: string };

export async function getNews(limit?: number): Promise<NewsItem[]> {
  const college = await getSiteCollege();
  if (!college) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("portal_news")
      .select("id, title, body, category, published_at")
      .eq("college_id", college.id)
      .order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return (data ?? []).map((n) => ({ id: n.id, title: n.title, body: n.body, category: n.category, publishedAt: n.published_at }));
  } catch {
    return [];
  }
}

export async function getNewsItem(id: string): Promise<NewsItem | null> {
  const college = await getSiteCollege();
  if (!college || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("portal_news")
      .select("id, title, body, category, published_at")
      .eq("college_id", college.id)
      .eq("id", id)
      .maybeSingle();
    return data ? { id: data.id, title: data.title, body: data.body, category: data.category, publishedAt: data.published_at } : null;
  } catch {
    return null;
  }
}

export type FeeRow = { id: string; programName: string; admissionFee: number; tuitionFee: number; totalFee: number };

/** Actual fee figures, only when the administration has published them in `program_fees`. */
export async function getPublishedFees(): Promise<FeeRow[]> {
  const college = await getSiteCollege();
  if (!college) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("program_fees")
      .select("id, program_name, admission_fee, tuition_fee, total_fee")
      .eq("college_id", college.id)
      .order("display_order");
    return (data ?? []).map((f) => ({
      id: f.id,
      programName: f.program_name,
      admissionFee: Number(f.admission_fee),
      tuitionFee: Number(f.tuition_fee),
      totalFee: Number(f.total_fee),
    }));
  } catch {
    return [];
  }
}

export type FacultyMember = {
  id: string;
  name: string;
  designation: string | null;
  qualification: string | null;
  specialization: string | null;
  department: string | null;
  photoUrl: string | null;
};

export async function getFacultyDirectory(): Promise<FacultyMember[]> {
  const college = await getSiteCollege();
  if (!college) return [];
  try {
    const supabase = await createClient();
    const [{ data: members }, { data: departments }] = await Promise.all([
      supabase
        .from("faculty_directory")
        .select("id, name, designation, qualification, specialization, department_id, photo_path")
        .eq("college_id", college.id)
        .order("display_order"),
      supabase.from("departments").select("id, name").eq("college_id", college.id),
    ]);
    const deptName = new Map((departments ?? []).map((d) => [d.id, d.name]));
    return (members ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      designation: m.designation,
      qualification: m.qualification,
      specialization: m.specialization,
      department: m.department_id ? deptName.get(m.department_id) ?? null : null,
      photoUrl: m.photo_path ? supabase.storage.from("public-assets").getPublicUrl(m.photo_path).data.publicUrl : null,
    }));
  } catch {
    return [];
  }
}

export type ImportantDate = { id: string; event: string; startDate: string | null; endDate: string | null };

export async function getImportantDates(): Promise<ImportantDate[]> {
  const college = await getSiteCollege();
  if (!college) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("important_dates")
      .select("id, event, start_date, end_date")
      .eq("college_id", college.id)
      .order("display_order");
    return (data ?? []).map((d) => ({ id: d.id, event: d.event, startDate: d.start_date, endDate: d.end_date }));
  } catch {
    return [];
  }
}

export type DownloadFile = { id: string; categoryId: string | null; title: string; uploadedAt: string; url: string; sizeBytes: number | null };

export async function getDownloads(): Promise<{ categories: { id: string; name: string }[]; files: DownloadFile[] }> {
  const college = await getSiteCollege();
  if (!college) return { categories: [], files: [] };
  try {
    const supabase = await createClient();
    const [{ data: categories }, { data: files }] = await Promise.all([
      supabase.from("download_categories").select("id, name").eq("college_id", college.id).order("display_order"),
      supabase.from("downloads").select("*").eq("college_id", college.id).order("uploaded_at", { ascending: false }),
    ]);
    return {
      categories: categories ?? [],
      files: (files ?? []).map((d) => ({
        id: d.id,
        categoryId: d.category_id,
        title: d.title,
        uploadedAt: d.uploaded_at,
        url: supabase.storage.from("public-assets").getPublicUrl(d.file_path).data.publicUrl,
        sizeBytes: d.file_size_bytes,
      })),
    };
  } catch {
    return { categories: [], files: [] };
  }
}
