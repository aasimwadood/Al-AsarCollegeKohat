import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DashboardNavItem } from "@/components/layout/dashboard-layout";

/**
 * Internship Focal Person (0054/0085) is a designation, not a profiles.role
 * value, so nav visibility can't come from the role-based filterNavByAccess
 * map — same reasoning as getLibraryNavExtras (lib/permissions/proctorial.ts),
 * which this mirrors. Unlike Chief Proctor/Staff Proctor/Librarian, this
 * designation name is seeded TWICE (once college-scope, once
 * department-scope) — selecting scope alongside name (not just name) is
 * required to tell the two apart.
 */
export async function getInternshipNavExtras(profileId: string): Promise<DashboardNavItem[]> {
  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("designation_assignments")
    .select("designation_type_id")
    .eq("profile_id", profileId);

  const typeIds = (assignments ?? []).map((a) => a.designation_type_id);
  const { data: types } =
    typeIds.length > 0
      ? await supabase.from("designation_types").select("id, name, scope").in("id", typeIds)
      : { data: [] };

  const scopes = new Set((types ?? []).filter((t) => t.name === "Internship Focal Person").map((t) => t.scope));
  const items: DashboardNavItem[] = [];

  if (scopes.has("college")) {
    items.push({ name: "Internship Oversight", icon: "Building2", href: "/dashboard/internship-focal/central" });
  }
  if (scopes.has("department")) {
    items.push({ name: "Internship (Focal Person)", icon: "Building2", href: "/dashboard/internship-focal/department" });
  }
  return items;
}
