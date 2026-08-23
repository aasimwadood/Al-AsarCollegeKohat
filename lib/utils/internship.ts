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
