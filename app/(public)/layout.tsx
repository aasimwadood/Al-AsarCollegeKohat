import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROLE_DASHBOARD_PATH } from "@/lib/permissions/roles";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="aa-site flex min-h-screen flex-col bg-sand-50 text-ink">
      <SiteHeader dashboardHref={profile ? ROLE_DASHBOARD_PATH[profile.role] : null} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
