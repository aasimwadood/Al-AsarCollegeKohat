import { DashboardLayout, type DashboardNavItem } from "@/components/layout/dashboard-layout";
import { NotificationBell } from "@/components/features/realtime/notification-bell";
import { requireRole } from "@/lib/auth/session";
import { getInitialNotifications } from "@/lib/services/notifications";

// A real profiles.role, not a designation (unlike the Internship Focal
// Person tree) — a Site Supervisor is a genuinely new kind of account with
// no other role in the college system, so it gets its own plain
// /dashboard/<role> tree, same shape as student/faculty/department, rather
// than the cross-cutting getNavigationForRole() convention those designation
// pages use.
const NAVIGATION: DashboardNavItem[] = [
  { name: "Dashboard", icon: "LayoutDashboard", href: "/dashboard/site-supervisor" },
];

export default async function SiteSupervisorLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("site_supervisor");
  const notifications = await getInitialNotifications(profile.id);

  return (
    <DashboardLayout
      userName={profile.fullName}
      userRole={profile.role}
      navigation={NAVIGATION}
      notificationBell={<NotificationBell userId={profile.id} initialNotifications={notifications} />}
    >
      {children}
    </DashboardLayout>
  );
}
