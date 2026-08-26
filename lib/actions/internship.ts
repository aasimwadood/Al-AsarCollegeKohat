"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole, type CurrentProfile } from "@/lib/auth/session";
import {
  internshipConfigSchema,
  internshipCompanySchema,
  updateInternshipCompanySchema,
  createInternshipMouSchema,
  setInternshipMouStatusSchema,
  applyForInternshipSchema,
  respondToInternshipSupervisionSchema,
  submitInternshipReportSchema,
  reviewInternshipReportSchema,
  submitSiteSupervisorReportSectionSchema,
  setInternshipReportEarlySubmissionSchema,
  submitInternshipEvaluationSchema,
  generateInternshipCertificateSchema,
  respondToInternshipSiteSupervisionSchema,
  provisionSiteSupervisorSchema,
  markInternshipAttendanceSchema,
  lockInternshipAttendanceWeekSchema,
  correctInternshipAttendanceSchema,
  updateInternshipActivityLogSchema,
  signInternshipActivityLogSchema,
} from "@/lib/validations/internship";
import type { ActionResult } from "@/lib/actions/auth";
import { getSignedUrl } from "@/lib/supabase/storage";
import { logAudit } from "@/lib/actions/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueUsername } from "@/lib/utils/username";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // matches the "internship-mou-documents" bucket's file_size_limit
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"];

// Broad allowlist matching who could plausibly hold the "Internship Focal
// Person" (department-scope) designation — same reasoning as
// PROCTOR_EXTRAS_ROLES/Library's per-layout wiring, plus admin as a
// college-wide override. RLS is still the real gate for every write below;
// this is only a friendlier error message and a fast-fail before hitting
// the database.
const INTERNSHIP_MANAGER_ROLES = ["admin", "faculty", "department", "coordinator", "controller"] as const;

async function isDepartmentalInternshipFocal(
  supabase: SupabaseClient<Database>,
  profileId: string,
  departmentId: string,
): Promise<boolean> {
  const { data: assignments } = await supabase
    .from("designation_assignments")
    .select("designation_type_id, department_id")
    .eq("profile_id", profileId)
    .eq("department_id", departmentId);
  const typeIds = (assignments ?? []).map((a) => a.designation_type_id);
  if (typeIds.length === 0) return false;
  const { data: types } = await supabase
    .from("designation_types")
    .select("id")
    .in("id", typeIds)
    .eq("name", "Internship Focal Person")
    .eq("scope", "department");
  return (types ?? []).length > 0;
}

async function requireDepartmentalFocalOrAdmin(
  supabase: SupabaseClient<Database>,
  profile: CurrentProfile,
  departmentId: string,
): Promise<string | null> {
  if (profile.role === "admin") return null;
  const ok = await isDepartmentalInternshipFocal(supabase, profile.id, departmentId);
  return ok ? null : "You are not the Internship Focal Person for this department";
}

export async function setInternshipConfigAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole("department", "admin");

  const parsed = internshipConfigSchema.safeParse({
    departmentId: formData.get("departmentId"),
    programId: formData.get("programId"),
    semesterId: formData.get("semesterId"),
    isEnabled: formData.get("isEnabled") === "true",
    eligibilityCriteria: formData.get("eligibilityCriteria"),
    applicationOpenDate: formData.get("applicationOpenDate"),
    applicationCloseDate: formData.get("applicationCloseDate"),
    internshipStartDate: formData.get("internshipStartDate"),
    internshipEndDate: formData.get("internshipEndDate"),
    durationWeeks: formData.get("durationWeeks"),
    requiredReports: formData.get("requiredReports"),
    reportIntervalWeeks: formData.get("reportIntervalWeeks"),
    allowCrossDepartmentSupervisor: formData.get("allowCrossDepartmentSupervisor") === "true",
    workingDays: formData.getAll("workingDays"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (profile.role === "department" && parsed.data.departmentId !== profile.departmentId) {
    return { error: "You can only configure internships for your own department" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internship_configs")
    .upsert(
      {
        department_id: parsed.data.departmentId,
        program_id: parsed.data.programId,
        semester_id: parsed.data.semesterId,
        is_enabled: parsed.data.isEnabled,
        eligibility_criteria: parsed.data.eligibilityCriteria || null,
        application_open_date: parsed.data.applicationOpenDate || null,
        application_close_date: parsed.data.applicationCloseDate || null,
        internship_start_date: parsed.data.internshipStartDate || null,
        internship_end_date: parsed.data.internshipEndDate || null,
        duration_weeks: parsed.data.durationWeeks,
        required_reports: parsed.data.requiredReports,
        report_interval_weeks: parsed.data.reportIntervalWeeks,
        allow_cross_department_supervisor: parsed.data.allowCrossDepartmentSupervisor,
        working_days: parsed.data.workingDays,
        updated_by: profile.id,
      },
      { onConflict: "department_id,program_id,semester_id" },
    )
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(profile.id, "set_internship_config", "internship_configs", data.id);
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function createInternshipCompanyAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = internshipCompanySchema.safeParse({
    departmentId: formData.get("departmentId"),
    name: formData.get("name"),
    companyType: formData.get("companyType"),
    industry: formData.get("industry"),
    address: formData.get("address"),
    contactPerson: formData.get("contactPerson"),
    contactNumber: formData.get("contactNumber"),
    contactEmail: formData.get("contactEmail"),
    website: formData.get("website"),
    internshipDomain: formData.get("internshipDomain"),
    availableSeats: formData.get("availableSeats") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, parsed.data.departmentId);
  if (gateError) return { error: gateError };

  const { data, error } = await supabase
    .from("internship_companies")
    .insert({
      department_id: parsed.data.departmentId,
      name: parsed.data.name,
      company_type: parsed.data.companyType || null,
      industry: parsed.data.industry || null,
      address: parsed.data.address || null,
      contact_person: parsed.data.contactPerson || null,
      contact_number: parsed.data.contactNumber || null,
      contact_email: parsed.data.contactEmail || null,
      website: parsed.data.website || null,
      internship_domain: parsed.data.internshipDomain || null,
      available_seats: parsed.data.availableSeats ?? null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(profile.id, "create_internship_company", "internship_companies", data.id, { name: parsed.data.name });
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function updateInternshipCompanyAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = updateInternshipCompanySchema.safeParse({
    companyId: formData.get("companyId"),
    departmentId: formData.get("departmentId"),
    name: formData.get("name"),
    companyType: formData.get("companyType"),
    industry: formData.get("industry"),
    address: formData.get("address"),
    contactPerson: formData.get("contactPerson"),
    contactNumber: formData.get("contactNumber"),
    contactEmail: formData.get("contactEmail"),
    website: formData.get("website"),
    internshipDomain: formData.get("internshipDomain"),
    availableSeats: formData.get("availableSeats") || undefined,
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, parsed.data.departmentId);
  if (gateError) return { error: gateError };

  const { error } = await supabase
    .from("internship_companies")
    .update({
      name: parsed.data.name,
      company_type: parsed.data.companyType || null,
      industry: parsed.data.industry || null,
      address: parsed.data.address || null,
      contact_person: parsed.data.contactPerson || null,
      contact_number: parsed.data.contactNumber || null,
      contact_email: parsed.data.contactEmail || null,
      website: parsed.data.website || null,
      internship_domain: parsed.data.internshipDomain || null,
      available_seats: parsed.data.availableSeats ?? null,
      is_active: parsed.data.isActive,
    })
    .eq("id", parsed.data.companyId);
  if (error) return { error: error.message };

  await logAudit(profile.id, "update_internship_company", "internship_companies", parsed.data.companyId);
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function createInternshipMouAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = createInternshipMouSchema.safeParse({
    companyId: formData.get("companyId"),
    mouStartDate: formData.get("mouStartDate"),
    mouExpiryDate: formData.get("mouExpiryDate"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("internship_companies")
    .select("id, department_id, name")
    .eq("id", parsed.data.companyId)
    .single();
  if (!company) return { error: "Company not found" };

  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, company.department_id);
  if (gateError) return { error: gateError };

  const { data: mou, error } = await supabase
    .from("internship_mous")
    .insert({
      company_id: company.id,
      department_id: company.department_id,
      mou_start_date: parsed.data.mouStartDate,
      mou_expiry_date: parsed.data.mouExpiryDate,
      notes: parsed.data.notes || null,
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await logAudit(profile.id, "create_internship_mou", "internship_mous", mou.id, { companyName: company.name });

  // Notify every college-scope "Internship Focal Person" holder — plain
  // insert, not an RPC: notifications_insert_staff already permits this
  // caller (their underlying profiles.role is always staff/faculty/
  // department/etc., never a bare student).
  const { data: centralType } = await supabase
    .from("designation_types")
    .select("id")
    .eq("name", "Internship Focal Person")
    .eq("scope", "college")
    .maybeSingle();
  if (centralType) {
    const { data: holders } = await supabase
      .from("designation_assignments")
      .select("profile_id")
      .eq("designation_type_id", centralType.id);
    if (holders && holders.length > 0) {
      await supabase.from("notifications").insert(
        holders.map((h) => ({
          profile_id: h.profile_id,
          title: "New internship MoU uploaded",
          body: `${company.name} — MoU created and pending activation`,
          related_entity: "internship_mous",
          related_id: mou.id,
        })),
      );
    }
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function uploadInternshipMouDocumentAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const mouId = formData.get("mouId");
  if (typeof mouId !== "string" || !mouId) return { error: "Invalid MoU" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Select a file to upload" };
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) return { error: "File is too large (max 10MB)" };
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) return { error: "Accepted formats: PDF, PNG, JPEG" };

  const supabase = await createClient();
  const { data: mou } = await supabase.from("internship_mous").select("id, department_id").eq("id", mouId).single();
  if (!mou) return { error: "MoU not found" };

  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, mou.department_id);
  if (gateError) return { error: gateError };

  const path = `${mou.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("internship-mou-documents")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "Upload failed. Please try again." };

  const { error } = await supabase
    .from("internship_mous")
    .update({ document_path: path, uploaded_at: new Date().toISOString() })
    .eq("id", mou.id);
  if (error) return { error: error.message };

  await logAudit(profile.id, "upload_internship_mou_document", "internship_mous", mou.id);
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function setInternshipMouStatusAction(formData: FormData): Promise<ActionResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = setInternshipMouStatusSchema.safeParse({
    mouId: formData.get("mouId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { data: mou } = await supabase.from("internship_mous").select("id, department_id").eq("id", parsed.data.mouId).single();
  if (!mou) return { error: "MoU not found" };

  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, mou.department_id);
  if (gateError) return { error: gateError };

  const { error } = await supabase.from("internship_mous").update({ status: parsed.data.status }).eq("id", mou.id);
  if (error) return { error: error.message };

  await logAudit(profile.id, "set_internship_mou_status", "internship_mous", mou.id, { status: parsed.data.status });
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function getInternshipMouDocumentUrlAction(mouId: string): Promise<string | null> {
  await requireRole(...INTERNSHIP_MANAGER_ROLES, "principal");
  const supabase = await createClient();
  const { data: mou } = await supabase.from("internship_mous").select("document_path").eq("id", mouId).single();
  if (!mou?.document_path) return null;
  return getSignedUrl("internship-mou-documents", mou.document_path);
}

export async function applyForInternshipAction(formData: FormData): Promise<ActionResult> {
  await requireRole("student");

  const parsed = applyForInternshipSchema.safeParse({
    configId: formData.get("configId"),
    companyId: formData.get("companyId"),
    supervisorProfileId: formData.get("supervisorProfileId"),
    siteSupervisorProfileId: formData.get("siteSupervisorProfileId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_for_internship", {
    p_config_id: parsed.data.configId,
    p_company_id: parsed.data.companyId,
    p_supervisor_profile_id: parsed.data.supervisorProfileId,
    p_site_supervisor_profile_id: parsed.data.siteSupervisorProfileId,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function submitInternshipReportAction(formData: FormData): Promise<ActionResult> {
  await requireRole("student");

  const parsed = submitInternshipReportSchema.safeParse({
    reportId: formData.get("reportId"),
    tasksPerformed: formData.get("tasksPerformed"),
    learningExperience: formData.get("learningExperience"),
    challenges: formData.get("challenges"),
    studentRemarks: formData.get("studentRemarks"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_internship_report", {
    p_report_id: parsed.data.reportId,
    p_tasks_performed: parsed.data.tasksPerformed,
    p_learning_experience: parsed.data.learningExperience,
    p_challenges: parsed.data.challenges,
    p_student_remarks: parsed.data.studentRemarks || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function uploadInternshipReportDocumentAction(formData: FormData): Promise<ActionResult> {
  await requireRole("student");

  const reportId = formData.get("reportId");
  if (typeof reportId !== "string" || !reportId) return { error: "Invalid report" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Select a file to upload" };
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) return { error: "File is too large (max 10MB)" };
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) return { error: "Accepted formats: PDF, PNG, JPEG" };

  const supabase = await createClient();
  const path = `${reportId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("internship-report-documents")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: "Upload failed. Please try again." };

  const { error } = await supabase.from("internship_reports").update({ document_path: path }).eq("id", reportId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function getInternshipReportDocumentUrlAction(reportId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: report } = await supabase.from("internship_reports").select("document_path").eq("id", reportId).single();
  if (!report?.document_path) return null;
  return getSignedUrl("internship-report-documents", report.document_path);
}

function parseScoresField(formData: FormData): unknown {
  const raw = formData.get("scores");
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function reviewInternshipReportAction(formData: FormData): Promise<ActionResult> {
  await requireRole("faculty");

  const parsed = reviewInternshipReportSchema.safeParse({
    reportId: formData.get("reportId"),
    approve: formData.get("approve") === "true",
    remarks: formData.get("remarks"),
    scores: parseScoresField(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_internship_report", {
    p_report_id: parsed.data.reportId,
    p_approve: parsed.data.approve,
    p_remarks: parsed.data.remarks || null,
    p_scores: parsed.data.scores ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function submitSiteSupervisorReportSectionAction(formData: FormData): Promise<ActionResult> {
  await requireRole("site_supervisor");

  const parsed = submitSiteSupervisorReportSectionSchema.safeParse({
    reportId: formData.get("reportId"),
    approve: formData.get("approve") === "true",
    scores: parseScoresField(formData),
    remarks: formData.get("remarks"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_site_supervisor_report_section", {
    p_report_id: parsed.data.reportId,
    p_approve: parsed.data.approve,
    p_scores: parsed.data.scores ?? null,
    p_remarks: parsed.data.remarks || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function updateInternshipActivityLogAction(formData: FormData): Promise<ActionResult> {
  await requireRole("student");

  const parsed = updateInternshipActivityLogSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    weekNumber: formData.get("weekNumber"),
    tasksPerformed: formData.get("tasksPerformed"),
    hours: formData.get("hours") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_internship_activity_log", {
    p_assignment_id: parsed.data.assignmentId,
    p_week_number: parsed.data.weekNumber,
    p_tasks_performed: parsed.data.tasksPerformed || null,
    p_hours: parsed.data.hours ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function signInternshipActivityLogAction(formData: FormData): Promise<ActionResult> {
  await requireRole("student", "site_supervisor", "faculty");

  const parsed = signInternshipActivityLogSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("sign_internship_activity_log", {
    p_assignment_id: parsed.data.assignmentId,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function setInternshipReportEarlySubmissionAction(formData: FormData): Promise<ActionResult> {
  await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = setInternshipReportEarlySubmissionSchema.safeParse({
    reportId: formData.get("reportId"),
    allow: formData.get("allow") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_internship_report_early_submission", {
    p_report_id: parsed.data.reportId,
    p_allow: parsed.data.allow,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function submitInternshipEvaluationAction(formData: FormData): Promise<ActionResult> {
  await requireRole("faculty");

  const parsed = submitInternshipEvaluationSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    completionConfirmed: formData.get("completionConfirmed") === "true",
    overallPerformance: formData.get("overallPerformance"),
    attendanceNote: formData.get("attendanceNote"),
    remarks: formData.get("remarks"),
    recommendation: formData.get("recommendation"),
    finalStatus: formData.get("finalStatus"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_internship_evaluation", {
    p_assignment_id: parsed.data.assignmentId,
    p_completion_confirmed: parsed.data.completionConfirmed,
    p_overall_performance: parsed.data.overallPerformance || null,
    p_attendance_note: parsed.data.attendanceNote || null,
    p_remarks: parsed.data.remarks || null,
    p_recommendation: parsed.data.recommendation || null,
    p_final_status: parsed.data.finalStatus,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function generateInternshipCertificateAction(formData: FormData): Promise<ActionResult> {
  const parsed = generateInternshipCertificateSchema.safeParse({ assignmentId: formData.get("assignmentId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("generate_internship_certificate", { p_assignment_id: parsed.data.assignmentId });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function respondToInternshipSupervisionAction(formData: FormData): Promise<ActionResult> {
  await requireRole("faculty");

  const parsed = respondToInternshipSupervisionSchema.safeParse({
    requestId: formData.get("requestId"),
    approve: formData.get("approve") === "true",
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_internship_supervision", {
    p_request_id: parsed.data.requestId,
    p_approve: parsed.data.approve,
    p_reason: parsed.data.reason || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function respondToInternshipSiteSupervisionAction(formData: FormData): Promise<ActionResult> {
  await requireRole("site_supervisor");

  const parsed = respondToInternshipSiteSupervisionSchema.safeParse({
    requestId: formData.get("requestId"),
    approve: formData.get("approve") === "true",
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_internship_site_supervision", {
    p_request_id: parsed.data.requestId,
    p_approve: parsed.data.approve,
    p_reason: parsed.data.reason || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export type ProvisionSiteSupervisorResult = { error: string; username?: undefined } | { error?: undefined; username: string };

/**
 * Creates a Site Supervisor account linked to a specific host organization.
 * A direct structural copy of provisionStaffAction (lib/actions/
 * provision-staff.ts) — invite-by-email, then overwrite the trigger-created
 * default 'student' profile with the real role/department — except the
 * caller must be that company's own Departmental Internship Focal Person
 * (or admin), not a blanket admin/principal, and the new profile is also
 * linked to the company via internship_company_supervisors in the same
 * call.
 */
export async function provisionSiteSupervisorAction(formData: FormData): Promise<ProvisionSiteSupervisorResult> {
  const profile = await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = provisionSiteSupervisorSchema.safeParse({
    companyId: formData.get("companyId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("internship_companies")
    .select("id, department_id, name")
    .eq("id", parsed.data.companyId)
    .single();
  if (!company) return { error: "Company not found" };

  const gateError = await requireDepartmentalFocalOrAdmin(supabase, profile, company.department_id);
  if (gateError) return { error: gateError };

  const { fullName, email, phone } = parsed.data;
  const username = await generateUniqueUsername(fullName);
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, username },
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });
  if (inviteError || !invited.user) {
    return { error: inviteError?.message ?? "Could not invite user" };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "site_supervisor", department_id: company.department_id, phone: phone || null })
    .eq("id", invited.user.id);
  if (profileError) return { error: profileError.message };

  const { error: linkError } = await admin
    .from("internship_company_supervisors")
    .insert({ company_id: company.id, supervisor_profile_id: invited.user.id });
  if (linkError) return { error: linkError.message };

  await logAudit(profile.id, "provision_site_supervisor", "profiles", invited.user.id, { email, username, companyName: company.name });
  revalidatePath("/dashboard", "layout");
  return { username };
}

export async function markInternshipAttendanceAction(formData: FormData): Promise<ActionResult> {
  await requireRole("site_supervisor");

  const entriesRaw = formData.get("entries");
  let entries: unknown;
  try {
    entries = JSON.parse(typeof entriesRaw === "string" ? entriesRaw : "[]");
  } catch {
    return { error: "Invalid input" };
  }

  const parsed = markInternshipAttendanceSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    entries,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_internship_attendance", {
    p_assignment_id: parsed.data.assignmentId,
    p_entries: parsed.data.entries,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function lockInternshipAttendanceWeekAction(formData: FormData): Promise<ActionResult> {
  await requireRole("site_supervisor");

  const parsed = lockInternshipAttendanceWeekSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    weekStart: formData.get("weekStart"),
    weekEnd: formData.get("weekEnd"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("lock_internship_attendance_week", {
    p_assignment_id: parsed.data.assignmentId,
    p_week_start: parsed.data.weekStart,
    p_week_end: parsed.data.weekEnd,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function correctInternshipAttendanceAction(formData: FormData): Promise<ActionResult> {
  await requireRole(...INTERNSHIP_MANAGER_ROLES);

  const parsed = correctInternshipAttendanceSchema.safeParse({
    attendanceId: formData.get("attendanceId"),
    newStatus: formData.get("newStatus"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("correct_internship_attendance", {
    p_attendance_id: parsed.data.attendanceId,
    p_new_status: parsed.data.newStatus,
    p_reason: parsed.data.reason,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}
