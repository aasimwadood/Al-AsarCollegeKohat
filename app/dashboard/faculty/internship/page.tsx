import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RespondInternshipButtons } from "@/components/features/internship/respond-internship-buttons";
import { ReviewReportButtons } from "@/components/features/internship/review-report-buttons";
import { EvaluationForm } from "@/components/features/internship/evaluation-form";
import { ActivityLogPanel } from "@/components/features/internship/activity-log-panel";
import { BreakdownCard } from "@/components/features/reports/breakdown-card";

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completion_pending: "Completion Pending",
  completed: "Completed",
};

export default async function FacultyInternshipPage() {
  const profile = await requireRole("faculty");
  const supabase = await createClient();

  const { data: pendingRequests } = await supabase
    .from("internship_supervisor_requests")
    .select("id, assignment_id, status, requested_at")
    .eq("supervisor_profile_id", profile.id)
    .eq("status", "pending")
    .order("requested_at", { ascending: false });

  const { data: activeAssignments } = await supabase
    .from("internship_assignments")
    .select("*")
    .eq("supervisor_profile_id", profile.id)
    .order("assigned_at", { ascending: false });

  const assignmentIdsForRequests = (pendingRequests ?? []).map((r) => r.assignment_id);
  const relevantAssignmentIds = [...new Set([...assignmentIdsForRequests, ...(activeAssignments ?? []).map((a) => a.id)])];
  const { data: assignments } =
    relevantAssignmentIds.length > 0
      ? await supabase.from("internship_assignments").select("id, student_profile_id, company_id, duration_weeks").in("id", relevantAssignmentIds)
      : { data: [] };
  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));

  const studentIds = [...new Set((assignments ?? []).map((a) => a.student_profile_id))];
  const companyIds = [...new Set((assignments ?? []).map((a) => a.company_id))];
  const [{ data: students }, { data: companies }] = await Promise.all([
    studentIds.length > 0 ? supabase.from("profiles").select("id, full_name").in("id", studentIds) : Promise.resolve({ data: [] }),
    companyIds.length > 0 ? supabase.from("internship_companies").select("id, name").in("id", companyIds) : Promise.resolve({ data: [] }),
  ]);
  const studentNames = new Map((students ?? []).map((s) => [s.id, s.full_name]));
  const companyNames = new Map((companies ?? []).map((c) => [c.id, c.name]));

  const activeAssignmentIds = (activeAssignments ?? []).map((a) => a.id);
  const { data: allReports } =
    activeAssignmentIds.length > 0
      ? await supabase.from("internship_reports").select("id, assignment_id, report_number, status").in("assignment_id", activeAssignmentIds)
      : { data: [] };
  const reportsByAssignment = new Map<string, { id: string; report_number: number }[]>();
  for (const r of allReports ?? []) {
    if (r.status !== "site_supervisor_submitted") continue;
    const list = reportsByAssignment.get(r.assignment_id) ?? [];
    list.push(r);
    reportsByAssignment.set(r.assignment_id, list);
  }

  const { data: attendanceRows } =
    activeAssignmentIds.length > 0
      ? await supabase.from("internship_attendance").select("assignment_id, status").in("assignment_id", activeAssignmentIds)
      : { data: [] };
  const attendancePercentByAssignment = new Map<string, number>();
  const byAssignment = new Map<string, { present: number; halfDay: number; total: number }>();
  for (const r of attendanceRows ?? []) {
    const entry = byAssignment.get(r.assignment_id) ?? { present: 0, halfDay: 0, total: 0 };
    entry.total += 1;
    if (r.status === "present") entry.present += 1;
    if (r.status === "half_day") entry.halfDay += 1;
    byAssignment.set(r.assignment_id, entry);
  }
  for (const [assignmentId, entry] of byAssignment) {
    attendancePercentByAssignment.set(assignmentId, entry.total > 0 ? ((entry.present + entry.halfDay * 0.5) / entry.total) * 100 : 0);
  }

  const { data: activityLogRows } =
    activeAssignmentIds.length > 0
      ? await supabase.from("internship_activity_logs").select("assignment_id, week_number, tasks_performed, hours").in("assignment_id", activeAssignmentIds)
      : { data: [] };
  const activityLogByAssignment = new Map<string, { week_number: number; tasks_performed: string | null; hours: number | null }[]>();
  for (const row of activityLogRows ?? []) {
    const list = activityLogByAssignment.get(row.assignment_id) ?? [];
    list.push(row);
    activityLogByAssignment.set(row.assignment_id, list);
  }

  const assignmentStatusCounts = new Map<string, number>();
  for (const a of activeAssignments ?? []) assignmentStatusCounts.set(a.status, (assignmentStatusCounts.get(a.status) ?? 0) + 1);
  const reportStatusCounts = new Map<string, number>();
  for (const r of allReports ?? []) reportStatusCounts.set(r.status, (reportStatusCounts.get(r.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      {(activeAssignments ?? []).length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          <BreakdownCard title="Internships by Status" counts={assignmentStatusCounts} />
          <BreakdownCard title="Reports by Status" counts={reportStatusCounts} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Internship Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(pendingRequests ?? []).length === 0 && <p className="text-gray-500">No pending requests.</p>}
          {(pendingRequests ?? []).map((r) => {
            const a = assignmentById.get(r.assignment_id);
            return (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-gray-900">{a ? studentNames.get(a.student_profile_id) : "—"}</p>
                  <p className="text-sm text-gray-500">
                    {a ? companyNames.get(a.company_id) : "—"} — {a?.duration_weeks} weeks
                  </p>
                </div>
                <RespondInternshipButtons requestId={r.id} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internships Under Supervision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(activeAssignments ?? []).length === 0 && <p className="text-gray-500">No active internships.</p>}
          {(activeAssignments ?? []).map((a) => {
            const pendingReports = reportsByAssignment.get(a.id) ?? [];
            return (
              <div key={a.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{studentNames.get(a.student_profile_id) ?? a.student_profile_id}</p>
                    <p className="text-sm text-gray-500">
                      {companyNames.get(a.company_id) ?? "—"} — {a.start_date ?? "—"} to {a.end_date ?? "—"}
                    </p>
                    {attendancePercentByAssignment.has(a.id) && (
                      <p className="text-xs text-gray-400">Attendance: {attendancePercentByAssignment.get(a.id)!.toFixed(1)}%</p>
                    )}
                  </div>
                  <Badge variant="secondary">{STATUS_LABELS[a.status] ?? a.status}</Badge>
                </div>
                {pendingReports.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    {pendingReports.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span>Report {r.report_number} — awaiting review</span>
                        <ReviewReportButtons reportId={r.id} />
                      </div>
                    ))}
                  </div>
                )}
                {(a.status === "assigned" || a.status === "in_progress" || a.status === "completion_pending") && (
                  <div className="border-t pt-3">
                    <p className="mb-2 text-sm font-medium text-gray-700">Activity Log</p>
                    <ActivityLogPanel
                      assignmentId={a.id}
                      durationWeeks={a.duration_weeks}
                      existing={activityLogByAssignment.get(a.id) ?? []}
                      viewerRole="faculty"
                      studentSignedAt={a.activity_log_student_signed_at}
                      siteSupervisorSignedAt={a.activity_log_site_supervisor_signed_at}
                      academicSignedAt={a.activity_log_academic_signed_at}
                    />
                  </div>
                )}
                {a.status === "completion_pending" && (
                  <div className="border-t pt-3">
                    <EvaluationForm assignmentId={a.id} />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
