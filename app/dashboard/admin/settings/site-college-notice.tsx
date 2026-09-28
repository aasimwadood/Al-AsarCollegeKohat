import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site/config";

/**
 * Warns when the college being edited is not the one the public website
 * reads (colleges.slug = SITE.collegeSlug) — i.e. migration 0095 has not been
 * applied — so admins aren't left wondering why edits don't appear.
 */
export async function SiteCollegeNotice({ collegeId }: { collegeId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from("colleges").select("slug").eq("id", collegeId).maybeSingle();
  if (data?.slug === SITE.collegeSlug) return null;
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        The public website reads content for the college with slug <code>{SITE.collegeSlug}</code>, but you are editing a different college.
        Apply migration <code>0095_al_asar_public_site_college.sql</code> to create the {SITE.name} record, then content edited here will
        appear on the website.
      </p>
    </div>
  );
}
