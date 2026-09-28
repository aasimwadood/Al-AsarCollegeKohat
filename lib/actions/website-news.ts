"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { resolveAdminCollegeId } from "@/lib/utils/college-scope";
import type { ActionResult } from "@/lib/actions/auth";

// Public-site announcements live in `portal_news` (0009/0021), scoped to the
// admin's college (0042). RLS already limits writes to admin.

const newsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  body: z.string().trim().max(10000).optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a publish date"),
});

function parse(formData: FormData) {
  return newsSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
    publishedAt: formData.get("publishedAt"),
  });
}

function revalidateNews() {
  revalidatePath("/dashboard/admin/website-news");
  revalidatePath("/news", "layout");
  revalidatePath("/");
}

export async function createWebsiteNewsAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const collegeId = await resolveAdminCollegeId(supabase, profile.collegeId);
  const { error } = await supabase.from("portal_news").insert({
    college_id: collegeId,
    title: parsed.data.title,
    body: parsed.data.body || null,
    category: parsed.data.category || null,
    published_at: parsed.data.publishedAt,
  });
  if (error) return { error: error.message };

  revalidateNews();
  return {};
}

export async function updateWebsiteNewsAction(id: string, formData: FormData): Promise<ActionResult> {
  const profile = await requireRole("admin");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const collegeId = await resolveAdminCollegeId(supabase, profile.collegeId);
  const { error } = await supabase
    .from("portal_news")
    .update({
      title: parsed.data.title,
      body: parsed.data.body || null,
      category: parsed.data.category || null,
      published_at: parsed.data.publishedAt,
    })
    .eq("id", id)
    .eq("college_id", collegeId);
  if (error) return { error: error.message };

  revalidateNews();
  return {};
}

export async function deleteWebsiteNewsAction(id: string): Promise<ActionResult> {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const collegeId = await resolveAdminCollegeId(supabase, profile.collegeId);
  const { error } = await supabase.from("portal_news").delete().eq("id", id).eq("college_id", collegeId);
  if (error) return { error: error.message };

  revalidateNews();
  return {};
}
