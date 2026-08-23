import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NotificationBell } from "@/components/features/realtime/notification-bell";
import { requireRole } from "@/lib/auth/session";
import { getInitialNotifications } from "@/lib/services/notifications";
import { getNavigationForRole } from "@/lib/permissions/navigation";

// Internship Focal Person (college- and department-scope) is a designation
// (0054/0085), not a role, so any staff role could plausibly hold one —
// same reasoning and shape as app/dashboard/proctorial/layout.tsx. The page
// itself checks the actual designation and shows a "not currently
// designated" message if the caller doesn't hold it; this layout only
// renders the caller's own full dashboard sidebar (via getNavigationForRole)
// since this route segment sits outside any single role's /dashboard/<role>/*
// tree.
export default async function InternshipFocalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(
    "admin", "principal", "administration", "college_admin",
    "department", "coordinator", "controller", "faculty",
  );
  const [notifications, navigation] = await Promise.all([
    getInitialNotifications(profile.id),
    getNavigationForRole(profile),
  ]);

  return (
    <DashboardLayout
      userName={profile.fullName}
      userRole={profile.role}
      navigation={navigation}
      notificationBell={<NotificationBell userId={profile.id} initialNotifications={notifications} />}
    >
      {children}
    </DashboardLayout>
  );
}
