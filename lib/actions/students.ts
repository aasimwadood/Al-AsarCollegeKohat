"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { bulkAssignStudentShiftSchema, bulkAssignStudentPlacementSchema, graduateStudentsSchema } from "@/lib/validations/students";
import type { ActionResult } from "@/lib/actions/auth";

export async function bulkAssignStudentShiftAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin", "department", "focal_person_intermediate");

  const parsed = bulkAssignStudentShiftSchema.safeParse({
    studentIds: formData.getAll("studentIds").map(String),
    shiftId: formData.get("shiftId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("bulk_assign_student_shift", {
    p_student_ids: parsed.data.studentIds,
    p_shift_id: parsed.data.shiftId || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/students");
  return {};
}

export async function bulkAssignStudentPlacementAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin", "department", "focal_person_intermediate");

  const parsed = bulkAssignStudentPlacementSchema.safeParse({
    studentIds: formData.getAll("studentIds").map(String),
    groupId: formData.get("groupId"),
    sectionId: formData.get("sectionId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("bulk_assign_student_placement", {
    p_student_ids: parsed.data.studentIds,
    p_group_id: parsed.data.groupId || null,
    p_section_id: parsed.data.sectionId || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/students");
  return {};
}

export async function graduateStudentsAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin", "department", "focal_person_intermediate");

  const parsed = graduateStudentsSchema.safeParse({
    studentIds: formData.getAll("studentIds").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("graduate_students", {
    p_student_ids: parsed.data.studentIds,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function setStudentIdentifiersAction(formData: FormData): Promise<ActionResult> {
  await requireRole("admin", "department", "focal_person_intermediate");

  const studentId = formData.get("studentId");
  if (typeof studentId !== "string" || !studentId) return { error: "Invalid student" };
  const admissionNumber = formData.get("admissionNumber");
  const boardRegistrationNumber = formData.get("boardRegistrationNumber");

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_student_identifiers", {
    p_student_id: studentId,
    p_admission_number: typeof admissionNumber === "string" ? admissionNumber : null,
    p_board_registration_number: typeof boardRegistrationNumber === "string" ? boardRegistrationNumber : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/students");
  return {};
}
