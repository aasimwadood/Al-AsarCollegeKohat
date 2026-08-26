// Mirrors mou_effective_status() (supabase/migrations/0085) exactly — the
// stored status only tracks draft/active/inactive; expiring_soon/expired
// are time-derived and computed here (and in SQL) rather than persisted,
// since this app has no scheduled-job infrastructure to keep a stored value
// from going stale between page loads.
export type MouEffectiveStatus = "draft" | "active" | "inactive" | "expiring_soon" | "expired";

export function mouEffectiveStatus(status: string, expiryDate: string): MouEffectiveStatus {
  if (status === "inactive") return "inactive";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  if (expiry < today) return "expired";
  const thirtyDaysOut = new Date(today);
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);
  if (expiry <= thirtyDaysOut) return "expiring_soon";
  return status as MouEffectiveStatus;
}

export const MOU_STATUS_LABELS: Record<MouEffectiveStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
};

export const MOU_STATUS_VARIANT: Record<MouEffectiveStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  active: "default",
  inactive: "outline",
  expiring_soon: "outline",
  expired: "destructive",
};

// The 9 Site Supervisor rubric criteria and 3 Academic Supervisor rubric
// criteria, verbatim from the college's own "Site Supervisor Evaluation
// Form" / "Student Internship Report Form Section-B" (scored 1-5 each:
// 1 = Does not meet expectations .. 5 = Far above expectations).
export const SITE_SUPERVISOR_CRITERIA: { key: string; label: string }[] = [
  { key: "punctuality", label: "Arrives to work on time" },
  { key: "respect_for_norms", label: "Demonstrates respect for organizational staff, policies, and norms" },
  { key: "organizational_understanding", label: "Shows requisite understanding and ability to learn about organization's work" },
  { key: "workplace_skills", label: "Exhibits basic skills required at the workplace" },
  { key: "professional_conduct", label: "Conducts self professionally in all work-related scenarios" },
  { key: "initiative", label: "Takes initiative and seeks opportunities to make contributions" },
  { key: "task_completion", label: "Completes tasks and reports to supervisor on time" },
  { key: "teamwork", label: "Demonstrates the ability to work with others in a team" },
  { key: "reliability", label: "Proves to be reliable and dependable" },
];

export const ACADEMIC_REPORT_CRITERIA: { key: string; label: string }[] = [
  { key: "tasks_performed", label: "Tasks performed" },
  { key: "learning_experience", label: "Learning experience" },
  { key: "overcoming_challenges", label: "Overcoming challenges" },
];

export type InternshipAttendanceStatus = "present" | "absent" | "leave" | "half_day";

export const ATTENDANCE_STATUS_LABELS: Record<InternshipAttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  half_day: "Half Day",
};

export const ATTENDANCE_STATUS_VARIANT: Record<InternshipAttendanceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  leave: "outline",
  half_day: "secondary",
};

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseDateOnly(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO weekday: 1 = Monday .. 7 = Sunday (JS's own getDay() is 0 = Sunday). */
function isoWeekday(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * The calendar dates (as 'YYYY-MM-DD' strings) that fall within week
 * `weekNumber` (1-indexed) of an internship starting on `startDate`,
 * restricted to whichever ISO weekdays `workingDays` names — e.g.
 * `[1,2,3,4,5]` for Monday-Friday. Purely a display/marking-scope
 * computation; no attendance rows are pre-created from this.
 */
export function getWorkingDatesForWeek(startDate: string, weekNumber: number, workingDays: number[]): { date: string; dayName: string }[] {
  const start = parseDateOnly(startDate);
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);

  const dates: { date: string; dayName: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const iso = isoWeekday(day);
    if (workingDays.includes(iso)) {
      dates.push({ date: formatDateOnly(day), dayName: WEEKDAY_NAMES[iso - 1] ?? "" });
    }
  }
  return dates;
}

export function getWeekDateRange(startDate: string, weekNumber: number): { weekStart: string; weekEnd: string } {
  const start = parseDateOnly(startDate);
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return { weekStart: formatDateOnly(weekStart), weekEnd: formatDateOnly(weekEnd) };
}
