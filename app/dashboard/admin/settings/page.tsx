import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { resolveAdminCollegeId } from "@/lib/utils/college-scope";
import { SiteSettingsForm } from "./site-settings-form";
import { SiteCollegeNotice } from "./site-college-notice";

const SETTINGS_KEYS = [
  { key: "InstitutionName", label: "Institution Name" },
  { key: "AboutUs", label: "About Us (homepage)", multiline: true },
  // Public website (Al-Asar). Leave a field empty to hide it on the site —
  // nothing is shown in its place, so no contact detail is ever invented.
  { key: "WelcomeToOurInstitution", label: "Website — homepage hero text", multiline: true, hint: "Short line under the college name on the homepage. Empty uses the default." },
  { key: "AdmissionsNotice", label: "Website — admissions notice banner", multiline: true, hint: "Shown at the top of the homepage and on the Admissions page while filled in." },
  { key: "ContactPhone", label: "Website — contact phone" },
  { key: "ContactEmail", label: "Website — contact email" },
  { key: "ContactAddress", label: "Website — postal address", multiline: true },
  { key: "OfficeHours", label: "Website — office hours", multiline: true, hint: "e.g. one line per day range." },
  { key: "MapEmbedUrl", label: "Website — Google Maps embed URL", hint: "Must start with https://www.google.com/maps/embed" },
  { key: "FacebookUrl", label: "Website — Facebook page URL" },
  { key: "YoutubeUrl", label: "Website — YouTube channel URL" },
];

export default async function AdminSettingsPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const collegeId = await resolveAdminCollegeId(supabase, profile.collegeId);

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("college_id", collegeId)
    .in("key", SETTINGS_KEYS.map((s) => s.key));
  const values = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <div className="space-y-4">
      <SiteCollegeNotice collegeId={collegeId} />
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm fields={SETTINGS_KEYS} values={values} collegeId={collegeId} />
        </CardContent>
      </Card>
    </div>
  );
}
