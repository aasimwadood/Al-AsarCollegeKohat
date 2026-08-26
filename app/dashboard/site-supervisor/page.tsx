import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RespondSiteSupervisionButtons } from "@/components/features/internship/respond-site-supervision-buttons";
import { AttendanceWeekPanel } from "@/components/features/internship/attendance-week-panel";
import { ReviewSiteSupervisorReportButtons } from "@/components/features/internship/review-site-supervisor-report-buttons";
import { ActivityLogPanel } from "@/components/features/internship/activity-log-panel";

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completion_pending: "Completion Pending",
  completed: "Completed",
};

export default async function SiteSupervisorPage() {
  const profile = await requireRole("site_supervisor");
  const supabase = await createClient();

  const { data: pendingRequests } = await supabase
    .from("internship_site_supervisor_requests")
    .select("id, assignment_id, requested_at")
    .eq("site_supervisor_profile_id", profile.id)
    .eq("status", "pending")
    .order("requested_at", { ascending: false });

  const { data: myInterns } = await supabase
    .from("internship_assignments")
    .select("*")
    .eq("site_supervisor_profile_id", profile.id)
    .order("assigned_at", { ascending: false });

  const activeInternIds = (myInterns ?? []).filter((a) => a.status === "assigned" || a.status === "in_progress").map((a) => a.id);
  const configIds = [...new Set((myInterns ?? []).map((a) => a.config_id))];
  const [{ data: configs }, { data: attendanceRows }] = await Promise.all([
    configIds.length > 0 ? supabase.from("internship_configs").select("id, working_days").in("id", configIds) : Promise.resolve({ data: [] }),
    activeInternIds.length > 0
      ? supabase.from("internship_attendance").select("assignment_id, attendance_date, status, locked").in("assignment_id", activeInternIds)
      : Promise.resolve({ data: [] }),
  ]);
  const workingDaysByConfig = new Map((configs ?? []).map((c) => [c.id, c.working_days]));
  const attendanceByAssignment = new Map<string, { date: string; status: "present" | "absent" | "leave" | "half_day"; locked: boolean }[]>();
  for (const row of attendanceRows ?? []) {
    const list = attendanceByAssignment.get(row.assignment_id) ?? [];
    list.push({ date: row.attendance_date, status: row.status, locked: row.locked });
    attendanceByAssignment.set(row.assignment_id, list);
  }

  const allInternIds = (myInterns ?? []).map((a) => a.id);
  const { data: activityLogRows } =
    allInternIds.length > 0
      ? await supabase.from("internship_activity_logs").select("assignment_id, week_number, tasks_performed, hours").in("assignment_id", allInternIds)
      : { data: [] };
  const activityLogByAssignment = new Map<string, { week_number: number; tasks_performed: string | null; hours: number | null }[]>();
  for (const row of activityLogRows ?? []) {
    const list = activityLogByAssignment.get(row.assignment_id) ?? [];
    list.push(row);
    activityLogByAssignment.set(row.assignment_id, list);
  }

  const { data: pendingReports } =
    activeInternIds.length > 0
      ? await supabase
          .from("internship_reports")
          .select("id, assignment_id, report_number")
          .in("assignment_id", activeInternIds)
          .eq("status", "submitted")
      : { data: [] };
  const reportsByAssignment = new Map<string, { id: string; report_number: number }[]>();
  for (const r of pendingReports ?? []) {
    const list = reportsByAssignment.get(r.assignment_id) ?? [];
    list.push(r);
    reportsByAssignment.set(r.assignment_id, list);
  }

  const assignmentIdsForRequests = (pendingRequests ?? []).map((r) => r.assignment_id);
  const relevantAssignmentIds = [...new Set([...assignmentIdsForRequests, ...(myInterns ?? []).map((a) => a.id)])];
  const { data: assignments } =
    relevantAssignmentIds.length > 0
      ? await supabase
          .from("internship_assignments")
          .select("id, student_profile_id, company_id, supervisor_profile_id, duration_weeks")
          .in("id", relevantAssignmentIds)
      : { data: [] };
  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));

  const studentIds = [...new Set((assignments ?? []).map((a) => a.student_profile_id))];
  const academicSupervisorIds = [...new Set((assignments ?? []).map((a) => a.supervisor_profile_id).filter((id): id is string => !!id))];
  const companyIds = [...new Set((assignments ?? []).map((a) => a.company_id))];
  const [{ data: students }, { data: academicSupervisors }, { data: companies }] = await Promise.all([
    studentIds.length > 0 ? supabase.from("profiles").select("id, full_name").in("id", studentIds) : Promise.resolve({ data: [] }),
    academicSupervisorIds.length > 0 ? supabase.from("profiles").select("id, full_name").in("id", academicSupervisorIds) : Promise.resolve({ data: [] }),
    companyIds.length > 0 ? supabase.from("internship_companies").select("id, name").in("id", companyIds) : Promise.resolve({ data: [] }),
  ]);
  const studentNames = new Map((students ?? []).map((s) => [s.id, s.full_name]));
  const academicSupervisorNames = new Map((academicSupervisors ?? []).map((s) => [s.id, s.full_name]));
  const companyNames = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
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
                    Academic Supervisor: {a?.supervisor_profile_id ? (academicSupervisorNames.get(a.supervisor_profile_id) ?? "—") : "—"} —{" "}
                    {a?.duration_weeks} weeks
                  </p>
                </div>
                <RespondSiteSupervisionButtons requestId={r.id} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Interns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(myInterns ?? []).length === 0 && <p className="text-gray-500">No assigned interns yet.</p>}
          {(myInterns ?? []).map((a) => (
            <div key={a.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{studentNames.get(a.student_profile_id) ?? a.student_profile_id}</p>
                  <p className="text-sm text-gray-500">
                    {companyNames.get(a.company_id) ?? "—"} — {a.start_date ?? "—"} to {a.end_date ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Academic Supervisor: {a.supervisor_profile_id ? (academicSupervisorNames.get(a.supervisor_profile_id) ?? "—") : "—"}
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[a.status] ?? a.status}</Badge>
              </div>
              {(a.status === "assigned" || a.status === "in_progress") && a.start_date && (
                <AttendanceWeekPanel
                  assignmentId={a.id}
                  startDate={a.start_date}
                  durationWeeks={a.duration_weeks}
                  workingDays={workingDaysByConfig.get(a.config_id) ?? [1, 2, 3, 4, 5]}
                  existing={attendanceByAssignment.get(a.id) ?? []}
                />
              )}
              {(reportsByAssignment.get(a.id) ?? []).length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  {(reportsByAssignment.get(a.id) ?? []).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span>Report {r.report_number} — awaiting your review</span>
                      <ReviewSiteSupervisorReportButtons reportId={r.id} />
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
                    viewerRole="site_supervisor"
                    studentSignedAt={a.activity_log_student_signed_at}
                    siteSupervisorSignedAt={a.activity_log_site_supervisor_signed_at}
                    academicSignedAt={a.activity_log_academic_signed_at}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
