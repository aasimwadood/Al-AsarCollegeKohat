import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ApplyInternshipDialog } from "@/components/features/internship/apply-internship-dialog";
import { SubmitReportForm } from "@/components/features/internship/submit-report-form";
import { CertificateSection } from "@/components/features/internship/certificate-section";
import { mouEffectiveStatus } from "@/lib/utils/internship";

const REPORT_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  submitted: "secondary",
  approved: "default",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  supervisor_pending: "Waiting for Supervisor Approval",
  supervisor_rejected: "Supervisor Declined — Resubmit",
  assigned: "Assigned",
  in_progress: "In Progress",
  completion_pending: "Completion Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function StudentInternshipPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: studentRow } = await supabase.from("profiles").select("program_id, full_name").eq("id", profile.id).single();

  if (!profile.departmentId || !profile.currentSemesterId || !studentRow?.program_id) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Your department/program/semester isn&apos;t fully set up yet — contact your department for internship
          eligibility.
        </CardContent>
      </Card>
    );
  }

  const { data: config } = await supabase
    .from("internship_configs")
    .select("*")
    .eq("department_id", profile.departmentId)
    .eq("program_id", studentRow.program_id)
    .eq("semester_id", profile.currentSemesterId)
    .maybeSingle();

  if (!config) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Internship has not been configured for your program/semester yet.
        </CardContent>
      </Card>
    );
  }

  const { data: assignment } = await supabase
    .from("internship_assignments")
    .select("*")
    .eq("student_profile_id", profile.id)
    .eq("config_id", config.id)
    .maybeSingle();

  const [{ data: companies }, { data: mous }, { data: supervisors }] = await Promise.all([
    supabase.from("internship_companies").select("*").eq("department_id", profile.departmentId).eq("is_active", true).order("name"),
    supabase.from("internship_mous").select("*").eq("department_id", profile.departmentId),
    config.allow_cross_department_supervisor
      ? supabase.from("profiles").select("id, full_name, department_id").eq("role", "faculty")
      : supabase.from("profiles").select("id, full_name, department_id").eq("role", "faculty").eq("department_id", profile.departmentId),
  ]);

  const activeCompanies = (companies ?? []).filter((c) =>
    (mous ?? []).some((m) => m.company_id === c.id && mouEffectiveStatus(m.status, m.mou_expiry_date) === "active"),
  );

  const today = new Date();
  const withinWindow =
    (!config.application_open_date || new Date(config.application_open_date) <= today) &&
    (!config.application_close_date || new Date(config.application_close_date) >= today);

  let company: { id: string; name: string } | null = null;
  let requests: { id: string; supervisor_profile_id: string; status: string; reason: string | null; requested_at: string }[] = [];
  let supervisorNames = new Map<string, string>();
  let reports: {
    id: string; report_number: number; period_start: string; period_end: string; status: string;
    early_submission_allowed: boolean; content: string | null; review_remarks: string | null;
  }[] = [];
  let evaluation: { completion_confirmed: boolean; final_status: string; remarks: string | null; recommendation: string | null } | null = null;
  let certificateExists = false;

  if (assignment) {
    const { data: c } = await supabase.from("internship_companies").select("id, name").eq("id", assignment.company_id).single();
    company = c;
    const { data: r } = await supabase
      .from("internship_supervisor_requests")
      .select("id, supervisor_profile_id, status, reason, requested_at")
      .eq("assignment_id", assignment.id)
      .order("requested_at", { ascending: false });
    requests = r ?? [];
    const supervisorIds = [...new Set(requests.map((x) => x.supervisor_profile_id))];
    if (supervisorIds.length > 0) {
      const { data: sups } = await supabase.from("profiles").select("id, full_name").in("id", supervisorIds);
      supervisorNames = new Map((sups ?? []).map((s) => [s.id, s.full_name]));
    }
    const { data: reportRows } = await supabase
      .from("internship_reports")
      .select("id, report_number, period_start, period_end, status, early_submission_allowed, content, review_remarks")
      .eq("assignment_id", assignment.id)
      .order("report_number");
    reports = reportRows ?? [];

    if (assignment.status === "completed") {
      const { data: evalRow } = await supabase
        .from("internship_evaluations")
        .select("completion_confirmed, final_status, remarks, recommendation")
        .eq("assignment_id", assignment.id)
        .maybeSingle();
      evaluation = evalRow ?? null;
      const { data: certRow } = await supabase.from("internship_certificates").select("id").eq("assignment_id", assignment.id).maybeSingle();
      certificateExists = !!certRow;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!assignment && (
            <>
              {!config.is_enabled ? (
                <p className="text-gray-500">Internship applications aren&apos;t open for your program/semester yet.</p>
              ) : !withinWindow ? (
                <p className="text-gray-500">
                  Applications are open {config.application_open_date ?? "—"} to {config.application_close_date ?? "—"}.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Select an approved company and an academic supervisor. Your application isn&apos;t confirmed until
                    the supervisor approves it.
                  </p>
                  <ApplyInternshipDialog
                    configId={config.id}
                    companies={activeCompanies.map((c) => ({ id: c.id, name: c.name, domain: c.internship_domain }))}
                    supervisors={(supervisors ?? []).map((s) => ({ id: s.id, name: s.full_name }))}
                  />
                </>
              )}
            </>
          )}

          {assignment && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{company?.name ?? "—"}</p>
                  <p className="text-sm text-gray-500">Duration: {assignment.duration_weeks} weeks</p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[assignment.status] ?? assignment.status}</Badge>
              </div>
              {assignment.status === "assigned" || assignment.status === "in_progress" || assignment.status === "completion_pending" || assignment.status === "completed" ? (
                <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>Supervisor: {supervisorNames.get(assignment.supervisor_profile_id ?? "") ?? "—"}</p>
                  <p>
                    Start: {assignment.start_date ?? "—"} — End: {assignment.end_date ?? "—"}
                  </p>
                </div>
              ) : assignment.status === "supervisor_pending" ? (
                <p className="text-sm text-gray-500">
                  Waiting for {supervisorNames.get(requests[0]?.supervisor_profile_id ?? "") ?? "your supervisor"} to
                  respond.
                </p>
              ) : assignment.status === "supervisor_rejected" ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-600">
                    {supervisorNames.get(requests[0]?.supervisor_profile_id ?? "")} declined: &ldquo;{requests[0]?.reason}
                    &rdquo;
                  </p>
                  <p className="text-sm text-gray-600">Select a different supervisor to resubmit.</p>
                  <ApplyInternshipDialog
                    configId={config.id}
                    companies={activeCompanies.map((c) => ({ id: c.id, name: c.name, domain: c.internship_domain }))}
                    supervisors={(supervisors ?? []).filter((s) => s.id !== requests[0]?.supervisor_profile_id).map((s) => ({ id: s.id, name: s.full_name }))}
                    defaultCompanyId={assignment.company_id}
                    triggerLabel="Select New Supervisor"
                  />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{supervisorNames.get(r.supervisor_profile_id) ?? r.supervisor_profile_id}</p>
                  {r.reason && <p className="text-xs text-gray-500">{r.reason}</p>}
                </div>
                <Badge variant={r.status === "agreed" ? "default" : r.status === "disagreed" ? "destructive" : "secondary"} className="capitalize">
                  {r.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map((r, i) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const windowOpen = r.early_submission_allowed || new Date(r.period_start) <= today;
              const previousApproved = i === 0 || reports[i - 1]?.status === "approved";
              const canSubmit = (r.status === "pending" || r.status === "rejected") && windowOpen && previousApproved;
              return (
                <div key={r.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      Report {r.report_number} — {r.period_start} to {r.period_end}
                    </p>
                    <Badge variant={REPORT_STATUS_VARIANT[r.status] ?? "secondary"} className="capitalize">
                      {r.status}
                    </Badge>
                  </div>
                  {r.status === "rejected" && r.review_remarks && (
                    <p className="text-sm text-red-600">Rejected: {r.review_remarks}</p>
                  )}
                  {canSubmit && <SubmitReportForm reportId={r.id} defaultContent={r.content} />}
                  {r.status === "pending" && !canSubmit && !windowOpen && (
                    <p className="text-sm text-gray-500">Available from {r.period_start}.</p>
                  )}
                  {r.status === "pending" && !canSubmit && windowOpen && !previousApproved && (
                    <p className="text-sm text-gray-500">Available once the previous report is approved.</p>
                  )}
                  {r.status === "submitted" && <p className="text-sm text-gray-500">Waiting for supervisor review.</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      {assignment?.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Final Evaluation & Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluation && (
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Status: <span className="font-medium text-gray-900 capitalize">{evaluation.final_status.replace(/_/g, " ")}</span>
                </p>
                {evaluation.remarks && <p>Remarks: {evaluation.remarks}</p>}
                {evaluation.recommendation && <p>Recommendation: {evaluation.recommendation}</p>}
              </div>
            )}
            <CertificateSection assignmentId={assignment.id} certificateExists={certificateExists} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
