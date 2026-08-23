import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanyFormDialog } from "@/components/features/internship/company-form-dialog";
import { MouManageDialog } from "@/components/features/internship/mou-manage-dialog";
import { BreakdownCard } from "@/components/features/reports/breakdown-card";
import { mouEffectiveStatus } from "@/lib/utils/internship";

export default async function DepartmentInternshipFocalPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: myAssignments } = await supabase
    .from("designation_assignments")
    .select("designation_type_id, department_id")
    .eq("profile_id", profile.id);
  const typeIds = (myAssignments ?? []).map((a) => a.designation_type_id);
  const { data: myTypes } = typeIds.length
    ? await supabase.from("designation_types").select("id, name, scope").in("id", typeIds)
    : { data: [] };
  const myDeptTypeIds = new Set((myTypes ?? []).filter((t) => t.name === "Internship Focal Person" && t.scope === "department").map((t) => t.id));
  const assignment = (myAssignments ?? []).find((a) => myDeptTypeIds.has(a.designation_type_id) && a.department_id);

  if (!assignment?.department_id) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          You are not currently designated Internship Focal Person for a department.
        </CardContent>
      </Card>
    );
  }

  const departmentId = assignment.department_id;

  const [{ data: department }, { data: companies }] = await Promise.all([
    supabase.from("departments").select("name").eq("id", departmentId).single(),
    supabase.from("internship_companies").select("*").eq("department_id", departmentId).order("name"),
  ]);

  const companyIds = (companies ?? []).map((c) => c.id);
  const { data: mous } =
    companyIds.length > 0
      ? await supabase.from("internship_mous").select("*").in("company_id", companyIds).order("created_at", { ascending: false })
      : { data: [] };
  const mousByCompany = new Map<string, typeof mous>();
  for (const m of mous ?? []) {
    const list = mousByCompany.get(m.company_id) ?? [];
    list.push(m);
    mousByCompany.set(m.company_id, list);
  }
  const activeMouCompanyCount = (companies ?? []).filter((c) =>
    (mousByCompany.get(c.id) ?? []).some((m) => mouEffectiveStatus(m.status, m.mou_expiry_date) === "active"),
  ).length;

  // Overview stats: eligible students derived from every internship_configs
  // row for this department (same "match program+semester" logic
  // apply_for_internship() itself enforces), applications/assignments by
  // status, reports awaiting review, and a simple "overdue" signal (past
  // end date, not yet completed) -- read-only, additive, no migration
  // needed, same convention Shift Management's Phase 5 reports used.
  const [{ data: configs }, { data: assignments }] = await Promise.all([
    supabase.from("internship_configs").select("program_id, semester_id").eq("department_id", departmentId).eq("is_enabled", true),
    supabase.from("internship_assignments").select("id, status, end_date").eq("department_id", departmentId),
  ]);

  let eligibleStudentCount = 0;
  for (const c of configs ?? []) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId)
      .eq("role", "student")
      .eq("student_status", "active")
      .eq("program_id", c.program_id)
      .eq("current_semester_id", c.semester_id);
    eligibleStudentCount += count ?? 0;
  }

  const statusCounts = new Map<string, number>();
  for (const a of assignments ?? []) statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);

  const today = new Date();
  const overdueCount = (assignments ?? []).filter(
    (a) => a.status !== "completed" && a.status !== "cancelled" && a.end_date && new Date(a.end_date) < today,
  ).length;

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const { data: reports } =
    assignmentIds.length > 0 ? await supabase.from("internship_reports").select("status").in("assignment_id", assignmentIds) : { data: [] };
  const reportStatusCounts = new Map<string, number>();
  for (const r of reports ?? []) reportStatusCounts.set(r.status, (reportStatusCounts.get(r.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internship Overview — {department?.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{eligibleStudentCount}</p>
            <p className="text-sm text-gray-500">Eligible Students</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{(assignments ?? []).length}</p>
            <p className="text-sm text-gray-500">Applications Submitted</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{activeMouCompanyCount}</p>
            <p className="text-sm text-gray-500">Companies with Active MoU</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{overdueCount}</p>
            <p className="text-sm text-gray-500">Overdue Internships</p>
          </div>
        </CardContent>
      </Card>

      <BreakdownCard title="Applications by Status" counts={statusCounts} />
      {reports && reports.length > 0 && <BreakdownCard title="Reports by Status" counts={reportStatusCounts} />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Internship Companies — {department?.name}</CardTitle>
            <CompanyFormDialog departmentId={departmentId} />
          </div>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MoUs</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(companies ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.industry ?? c.company_type ?? "—"}</p>
                </TableCell>
                <TableCell className="text-sm">{c.internship_domain ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  <p>{c.contact_person ?? "—"}</p>
                  <p className="text-xs text-gray-500">{c.contact_number ?? c.contact_email ?? ""}</p>
                </TableCell>
                <TableCell className="text-sm">{c.available_seats ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? "default" : "outline"}>{c.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell>
                  <MouManageDialog
                    companyId={c.id}
                    companyName={c.name}
                    canManage
                    mous={(mousByCompany.get(c.id) ?? []).map((m) => ({
                      id: m.id,
                      mouStartDate: m.mou_start_date,
                      mouExpiryDate: m.mou_expiry_date,
                      status: m.status,
                      hasDocument: !!m.document_path,
                    }))}
                  />
                </TableCell>
                <TableCell>
                  <CompanyFormDialog
                    departmentId={departmentId}
                    company={{
                      id: c.id,
                      name: c.name,
                      companyType: c.company_type,
                      industry: c.industry,
                      address: c.address,
                      contactPerson: c.contact_person,
                      contactNumber: c.contact_number,
                      contactEmail: c.contact_email,
                      website: c.website,
                      internshipDomain: c.internship_domain,
                      availableSeats: c.available_seats,
                      isActive: c.is_active,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {(companies ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                  No companies added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
