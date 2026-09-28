import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { SITE } from "@/lib/site/config";

/**
 * Resolves which college an admin content-management page/action should
 * read/write. `admin` predates the multi-college schema and typically has
 * no `profiles.college_id` (only `college_admin`/org roles reliably do).
 * Such accounts manage this deployment's own college — the `colleges` row
 * whose slug is SITE.collegeSlug (Al-Asar Degree College). The legacy
 * GPGC-KOH code remains as a last-resort fallback so a database that has
 * not yet been given an Al-Asar row keeps behaving exactly as before.
 */
export async function resolveAdminCollegeId(
  supabase: SupabaseClient<Database>,
  profileCollegeId: string | null,
): Promise<string> {
  if (profileCollegeId) return profileCollegeId;

  const { data: site } = await supabase.from("colleges").select("id").eq("slug", SITE.collegeSlug).maybeSingle();
  if (site) return site.id;

  const { data } = await supabase.from("colleges").select("id").eq("code", "GPGC-KOH").maybeSingle();
  if (!data) throw new Error("No default college configured");
  return data.id;
}
