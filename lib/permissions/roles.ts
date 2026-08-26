/**
 * Single source of truth for the role vocabulary. The legacy frontend had a
 * second, drifted vocabulary ("hod", "accountant") layered on top of this
 * one purely for UI labeling — `ROLE_LABELS` below is where that
 * presentation concern belongs now; it must never become a second code
 * path for authorization decisions.
 */
export const USER_ROLES = [
  "admin",
  "faculty",
  "student",
  "department",
  "controller",
  "coordinator",
  "principal",
  "administration",
  // Shift Management Phase 2 — a genuinely new role, not a reuse/rename of
  // "department": HOD-equivalent authority scoped only to Intermediate
  // students. Isolation from BS departments is enforced by a real
  // "Intermediate" department row + the existing department_id scoping,
  // not a parallel mechanism. See docs/MIGRATION_PLAN.md.
  "focal_person_intermediate",
  // HED hierarchy (Phase 15) — additive, none of the 8 roles above change
  // meaning or scope. See docs/MIGRATION_PLAN.md §9.
  "hed_admin",
  "directorate_admin",
  "jmc_admin",
  "college_admin",
  // Internship workflow update — a person from the host organization/
  // company where a student interns, distinct from the college's own
  // "faculty" Academic Supervisor. Access is scoped entirely to their own
  // assigned students via internship_assignments.site_supervisor_profile_id,
  // never department/college-wide. See docs/MIGRATION_PLAN.md.
  "site_supervisor",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Roles scoped to the HED org hierarchy (directorates/jmcs/colleges) rather than to a single college's academic departments. */
export const ORG_ROLES = ["hed_admin", "directorate_admin", "jmc_admin", "college_admin"] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  faculty: "Faculty",
  student: "Student",
  department: "Head of Department",
  controller: "Controller of Examinations",
  coordinator: "Coordinator",
  principal: "Principal",
  administration: "Administration",
  focal_person_intermediate: "Focal Person (Intermediate)",
  hed_admin: "HED Administrator",
  directorate_admin: "Directorate Administrator",
  jmc_admin: "JMC Administrator",
  college_admin: "College Administrator",
  site_supervisor: "Site Supervisor",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  faculty: "/dashboard/faculty",
  student: "/dashboard/student",
  department: "/dashboard/department",
  controller: "/dashboard/controller",
  coordinator: "/dashboard/coordinator",
  principal: "/dashboard/principal",
  administration: "/dashboard/administration",
  focal_person_intermediate: "/dashboard/focal-person",
  hed_admin: "/dashboard/hed",
  directorate_admin: "/dashboard/directorate",
  jmc_admin: "/dashboard/jmc",
  college_admin: "/dashboard/college-admin",
  site_supervisor: "/dashboard/site-supervisor",
};

/** Roles that may only be created by an admin through server-side provisioning — never via public self-registration. */
export const STAFF_ROLES = USER_ROLES.filter(
  (r): r is Exclude<UserRole, "student"> => r !== "student",
);

/**
 * The 8 pre-existing college-scoped staff roles, deliberately excluding the
 * 4 new org-level roles (hed_admin/directorate_admin/jmc_admin/
 * college_admin). This is what a college-level `admin`'s "Add Staff" flow
 * is allowed to create — a college admin must never be able to grant
 * themselves or anyone else org-hierarchy access by picking it from a role
 * dropdown. Provisioning the 4 org roles goes through their own
 * hierarchy-scoped actions (an hed_admin creates directorate_admin/
 * jmc_admin/college_admin; a directorate_admin creates jmc_admin; a
 * jmc_admin creates college_admin) — see lib/actions/provision-org-admin.ts.
 *
 * `site_supervisor` is excluded here too — it isn't provisioned through the
 * generic admin/principal "Add Staff" dropdown at all, since it must always
 * be linked to a specific host organization/company. It's provisioned
 * exclusively by that company's Departmental Internship Focal Person via
 * `provisionSiteSupervisorAction` (lib/actions/internship.ts).
 */
export const COLLEGE_STAFF_ROLES = STAFF_ROLES.filter(
  (r): r is Exclude<UserRole, "student" | (typeof ORG_ROLES)[number] | "site_supervisor"> =>
    !(ORG_ROLES as readonly UserRole[]).includes(r) && r !== "site_supervisor",
);

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
