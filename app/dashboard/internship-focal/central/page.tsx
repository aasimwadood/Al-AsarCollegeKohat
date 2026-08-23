import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mouEffectiveStatus, MOU_STATUS_LABELS } from "@/lib/utils/internship";
import { BreakdownCard } from "@/components/features/reports/breakdown-card";

export default async function CentralInternshipFocalPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: myAssignments } = await supabase
    .from("designation_assignments")
    .select("designation_type_id")
    .eq("profile_id", profile.id);
  const typeIds = (myAssignments ?? []).map((a) => a.designation_type_id);
  const { data: myTypes } = typeIds.length
    ? await supabase.from("designation_types").select("id, name, scope").in("id", typeIds)
    : { data: [] };
  const isCentralFocal = (myTypes ?? []).some((t) => t.name === "Internship Focal Person" && t.scope === "college");

  if (!isCentralFocal) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          You are not currently designated Internship Focal Person for the college.
        </CardContent>
      </Card>
    );
  }

  // Read-only by design: the Central Internship Focal Person has oversight,
  // not automatic write access to every department's records — this page
  // renders no write controls at all. RLS (is_central_internship_focal())
  // already grants the SELECT this page relies on.
  const [{ data: companies }, { data: departments }] = await Promise.all([
    supabase.from("internship_companies").select("*").order("department_id"),
    supabase.from("departments").select("id, name"),
  ]);
  const departmentNames = new Map((departments ?? []).map((d) => [d.id, d.name]));

  const companyIds = (companies ?? []).map((c) => c.id);
  const { data: mous } =
    companyIds.length > 0 ? await supabase.from("internship_mous").select("*").in("company_id", companyIds) : { data: [] };
  const mousByCompany = new Map<string, typeof mous>();
  for (const m of mous ?? []) {
    const list = mousByCompany.get(m.company_id) ?? [];
    list.push(m);
    mousByCompany.set(m.company_id, list);
  }

  const byDepartment = new Map<string, typeof companies>();
  for (const c of companies ?? []) {
    const list = byDepartment.get(c.department_id) ?? [];
    list.push(c);
    byDepartment.set(c.department_id, list);
  }

  // College-wide oversight stats -- read-only, additive, RLS already scopes
  // every query below to the caller's own college via is_central_internship_
  // focal() (internship_assignments_select_scoped, §56).
  const { data: assignments } = await supabase.from("internship_assignments").select("id, department_id, student_profile_id, status");
  const activeMouCompanyIds = new Set(
    (companies ?? [])
      .filter((c) => (mousByCompany.get(c.id) ?? []).some((m) => mouEffectiveStatus(m.status, m.mou_expiry_date) === "active"))
      .map((c) => c.id),
  );
  const departmentsWithActivity = new Set([...byDepartment.keys(), ...(assignments ?? []).map((a) => a.department_id)]);
  const distinctStudents = new Set((assignments ?? []).map((a) => a.student_profile_id));

  const statusCounts = new Map<string, number>();
  const byDepartmentCounts = new Map<string, number>();
  for (const a of assignments ?? []) {
    statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);
    const deptName = departmentNames.get(a.department_id) ?? "Unknown";
    byDepartmentCounts.set(deptName, (byDepartmentCounts.get(deptName) ?? 0) + 1);
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const { data: reports } =
    assignmentIds.length > 0 ? await supabase.from("internship_reports").select("status").in("assignment_id", assignmentIds) : { data: [] };
  const reportStatusCounts = new Map<string, number>();
  for (const r of reports ?? []) reportStatusCounts.set(r.status, (reportStatusCounts.get(r.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internship Oversight — All Departments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Read-only view of every department&apos;s internship companies, MoUs, and assignments. Company/MoU/report
            management stays with each department&apos;s own Internship Focal Person and supervisors.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xl font-bold text-gray-900">{departmentsWithActivity.size}</p>
              <p className="text-sm text-gray-500">Departments</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{(companies ?? []).length}</p>
              <p className="text-sm text-gray-500">Companies</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{activeMouCompanyIds.size}</p>
              <p className="text-sm text-gray-500">Companies with Active MoU</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{distinctStudents.size}</p>
              <p className="text-sm text-gray-500">Internship Students</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BreakdownCard title="Internships by Status (College-Wide)" counts={statusCounts} />
      <BreakdownCard title="Internships by Department" counts={byDepartmentCounts} />
      {reports && reports.length > 0 && <BreakdownCard title="Reports by Status (College-Wide)" counts={reportStatusCounts} />}

      {[...byDepartment.entries()].map(([departmentId, deptCompanies]) => (
        <Card key={departmentId}>
          <CardHeader>
            <CardTitle className="text-base">{departmentNames.get(departmentId) ?? "Unknown Department"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active MoUs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(deptCompanies ?? []).map((c) => {
                  const companyMous = mousByCompany.get(c.id) ?? [];
                  const activeCount = companyMous.filter((m) => mouEffectiveStatus(m.status, m.mou_expiry_date) === "active").length;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm">{c.internship_domain ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "outline"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {activeCount} / {companyMous.length}
                        {companyMous.length > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            {companyMous
                              .map((m) => MOU_STATUS_LABELS[mouEffectiveStatus(m.status, m.mou_expiry_date)])
                              .join(", ")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {byDepartment.size === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">No internship companies added yet, college-wide.</CardContent>
        </Card>
      )}
    </div>
  );
}
