import { z } from "zod";
import { SITE_SUPERVISOR_CRITERIA, ACADEMIC_REPORT_CRITERIA } from "@/lib/utils/internship";

function scoresSchema(criteria: { key: string }[]) {
  const shape = Object.fromEntries(criteria.map((c) => [c.key, z.coerce.number().int().min(1).max(5)]));
  return z.object(shape);
}

export const MOU_STATUSES = ["draft", "active", "inactive"] as const;

export const internshipConfigSchema = z.object({
  departmentId: z.string().uuid(),
  programId: z.string().uuid(),
  semesterId: z.string().uuid(),
  isEnabled: z.boolean(),
  eligibilityCriteria: z.string().trim().max(2000).optional().or(z.literal("")),
  applicationOpenDate: z.string().trim().optional().or(z.literal("")),
  applicationCloseDate: z.string().trim().optional().or(z.literal("")),
  internshipStartDate: z.string().trim().optional().or(z.literal("")),
  internshipEndDate: z.string().trim().optional().or(z.literal("")),
  durationWeeks: z.coerce.number().int().positive(),
  requiredReports: z.coerce.number().int().positive(),
  reportIntervalWeeks: z.coerce.number().int().positive(),
  allowCrossDepartmentSupervisor: z.boolean(),
  workingDays: z.array(z.coerce.number().int().min(1).max(7)).min(1, "Select at least one working day"),
});

export const internshipCompanySchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().trim().min(1, "Company name is required").max(200),
  companyType: z.string().trim().max(100).optional().or(z.literal("")),
  industry: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  contactPerson: z.string().trim().max(200).optional().or(z.literal("")),
  contactNumber: z.string().trim().max(30).optional().or(z.literal("")),
  contactEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  website: z.string().trim().max(300).optional().or(z.literal("")),
  internshipDomain: z.string().trim().max(200).optional().or(z.literal("")),
  availableSeats: z.coerce.number().int().nonnegative().optional(),
});

export const updateInternshipCompanySchema = internshipCompanySchema.extend({
  companyId: z.string().uuid(),
  isActive: z.boolean(),
});

export const createInternshipMouSchema = z
  .object({
    companyId: z.string().uuid(),
    mouStartDate: z.string().trim().min(1, "Start date is required"),
    mouExpiryDate: z.string().trim().min(1, "Expiry date is required"),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((v) => new Date(v.mouExpiryDate) > new Date(v.mouStartDate), {
    message: "Expiry date must be after the start date",
    path: ["mouExpiryDate"],
  });

export const setInternshipMouStatusSchema = z.object({
  mouId: z.string().uuid(),
  status: z.enum(MOU_STATUSES),
});

export const uploadInternshipMouDocumentSchema = z.object({
  mouId: z.string().uuid(),
});

export const applyForInternshipSchema = z.object({
  configId: z.string().uuid(),
  companyId: z.string().uuid(),
  supervisorProfileId: z.string().uuid(),
  siteSupervisorProfileId: z.string().uuid(),
});

export const respondToInternshipSupervisionSchema = z
  .object({
    requestId: z.string().uuid(),
    approve: z.boolean(),
    reason: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine((v) => v.approve || (v.reason && v.reason.length > 0), {
    message: "A reason is required when declining",
    path: ["reason"],
  });

export const respondToInternshipSiteSupervisionSchema = z
  .object({
    requestId: z.string().uuid(),
    approve: z.boolean(),
    reason: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine((v) => v.approve || (v.reason && v.reason.length > 0), {
    message: "A reason is required when declining",
    path: ["reason"],
  });

export const provisionSiteSupervisorSchema = z.object({
  companyId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Enter a full name").max(200),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const submitInternshipReportSchema = z.object({
  reportId: z.string().uuid(),
  tasksPerformed: z.string().trim().min(1, "Tasks performed is required").max(8000),
  learningExperience: z.string().trim().min(1, "Learning experience is required").max(8000),
  challenges: z.string().trim().min(1, "Challenges is required").max(8000),
  studentRemarks: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const reviewInternshipReportSchema = z
  .object({
    reportId: z.string().uuid(),
    approve: z.boolean(),
    remarks: z.string().trim().max(2000).optional().or(z.literal("")),
    scores: scoresSchema(ACADEMIC_REPORT_CRITERIA).optional(),
  })
  .refine((v) => v.approve || (v.remarks && v.remarks.length > 0), {
    message: "Remarks are required when rejecting",
    path: ["remarks"],
  })
  .refine((v) => !v.approve || v.scores, {
    message: "Scores are required when approving",
    path: ["scores"],
  });

export const submitSiteSupervisorReportSectionSchema = z
  .object({
    reportId: z.string().uuid(),
    approve: z.boolean(),
    scores: scoresSchema(SITE_SUPERVISOR_CRITERIA).optional(),
    remarks: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((v) => v.approve || (v.remarks && v.remarks.length > 0), {
    message: "Remarks are required when rejecting",
    path: ["remarks"],
  })
  .refine((v) => !v.approve || v.scores, {
    message: "Scores are required when approving",
    path: ["scores"],
  });

export const updateInternshipActivityLogSchema = z.object({
  assignmentId: z.string().uuid(),
  weekNumber: z.coerce.number().int().positive(),
  tasksPerformed: z.string().trim().max(4000).optional().or(z.literal("")),
  hours: z.coerce.number().min(0).max(168).optional(),
});

export const signInternshipActivityLogSchema = z.object({
  assignmentId: z.string().uuid(),
});

export const uploadInternshipReportDocumentSchema = z.object({
  reportId: z.string().uuid(),
});

export const setInternshipReportEarlySubmissionSchema = z.object({
  reportId: z.string().uuid(),
  allow: z.boolean(),
});

export const submitInternshipEvaluationSchema = z.object({
  assignmentId: z.string().uuid(),
  completionConfirmed: z.boolean(),
  overallPerformance: z.string().trim().max(2000).optional().or(z.literal("")),
  attendanceNote: z.string().trim().max(1000).optional().or(z.literal("")),
  remarks: z.string().trim().max(2000).optional().or(z.literal("")),
  recommendation: z.string().trim().max(2000).optional().or(z.literal("")),
  finalStatus: z.enum(["successfully_completed", "not_completed"]),
});

export const generateInternshipCertificateSchema = z.object({
  assignmentId: z.string().uuid(),
});

export const ATTENDANCE_STATUSES = ["present", "absent", "leave", "half_day"] as const;

export const markInternshipAttendanceSchema = z.object({
  assignmentId: z.string().uuid(),
  entries: z
    .array(z.object({ date: z.string().trim().min(1), status: z.enum(ATTENDANCE_STATUSES) }))
    .min(1, "Mark at least one day"),
});

export const lockInternshipAttendanceWeekSchema = z.object({
  assignmentId: z.string().uuid(),
  weekStart: z.string().trim().min(1),
  weekEnd: z.string().trim().min(1),
});

export const correctInternshipAttendanceSchema = z.object({
  attendanceId: z.string().uuid(),
  newStatus: z.enum(ATTENDANCE_STATUSES),
  reason: z.string().trim().min(1, "A reason is required"),
});
