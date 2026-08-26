import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { InternshipConfigForm, type InternshipConfigEntry } from "@/components/features/internship/internship-config-form";
import { BreakdownCard } from "@/components/features/reports/breakdown-card";

export default async function DepartmentInternshipPage() {
  const profile = await requireRole("department");
  const supabase = await createClient();

  if (!profile.departmentId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">Your department is not configured yet.</CardContent>
      </Card>
    );
  }

  const [{ data: programs }, { data: semesters }, { data: configs }] = await Promise.all([
    supabase.from("programs").select("id, name").eq("department_id", profile.departmentId).order("name"),
    supabase.from("semesters").select("id, number").order("number"),
    supabase.from("internship_configs").select("*").eq("department_id", profile.departmentId),
  ]);

  const configMap = new Map<string, InternshipConfigEntry>(
    (configs ?? []).map((c) => [
      `${c.program_id}-${c.semester_id}`,
      {
        isEnabled: c.is_enabled,
        eligibilityCriteria: c.eligibility_criteria,
        applicationOpenDate: c.application_open_date,
        applicationCloseDate: c.application_close_date,
        internshipStartDate: c.internship_start_date,
        internshipEndDate: c.internship_end_date,
        durationWeeks: c.duration_weeks,
        requiredReports: c.required_reports,
        reportIntervalWeeks: c.report_interval_weeks,
        allowCrossDepartmentSupervisor: c.allow_cross_department_supervisor,
        workingDays: c.working_days,
      },
    ]),
  );

  // Eligible students: same "matches an enabled config's program+semester"
  // logic apply_for_internship() itself enforces. Applications/assignments
  // by status give the HOD the same department-level progress view the
  // Departmental Focal Person sees, without granting any write access here
  // beyond the config form above.
  const enabledConfigs = (configs ?? []).filter((c) => c.is_enabled);
  let eligibleStudentCount = 0;
  for (const c of enabledConfigs) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("department_id", profile.departmentId)
      .eq("role", "student")
      .eq("student_status", "active")
      .eq("program_id", c.program_id)
      .eq("current_semester_id", c.semester_id);
    eligibleStudentCount += count ?? 0;
  }

  const { data: assignments } = await supabase.from("internship_assignments").select("status").eq("department_id", profile.departmentId);
  const statusCounts = new Map<string, number>();
  for (const a of assignments ?? []) statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internship Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Configure which program/semester is eligible for internships, the application window, internship dates, and
            the report schedule. Each program can have its own settings.
          </p>
          <InternshipConfigForm
            departmentId={profile.departmentId}
            programs={programs ?? []}
            semesters={semesters ?? []}
            configs={configMap}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Progress</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xl font-bold text-gray-900">{eligibleStudentCount}</p>
            <p className="text-sm text-gray-500">Eligible Students</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{(assignments ?? []).length}</p>
            <p className="text-sm text-gray-500">Total Applications</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{statusCounts.get("completed") ?? 0}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </CardContent>
      </Card>

      <BreakdownCard title="Applications by Status" counts={statusCounts} />
    </div>
  );
}
