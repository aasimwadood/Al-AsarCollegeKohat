import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { resolveAdminCollegeId } from "@/lib/utils/college-scope";
import { SiteCollegeNotice } from "../settings/site-college-notice";
import { WebsiteNewsDialog } from "./news-dialog";
import { DeleteNewsButton } from "./delete-news-button";

export default async function WebsiteNewsPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const collegeId = await resolveAdminCollegeId(supabase, profile.collegeId);

  const { data: news } = await supabase
    .from("portal_news")
    .select("id, title, body, category, published_at")
    .eq("college_id", collegeId)
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-4">
      <SiteCollegeNotice collegeId={collegeId} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Website News &amp; Announcements</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Shown on the public homepage and at{" "}
                <Link href="/news" target="_blank" className="inline-flex items-center gap-1 underline">
                  /news <ExternalLink className="h-3 w-3" />
                </Link>
              </p>
            </div>
            <WebsiteNewsDialog />
          </div>
        </CardHeader>
        <CardContent>
          {news && news.length > 0 ? (
            <ul className="divide-y">
              {news.map((n) => (
                <li key={n.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {n.category && <Badge variant="outline">{n.category}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(`${n.published_at}T00:00:00`).toLocaleDateString()}</p>
                    {n.body && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>}
                  </div>
                  <div className="flex gap-2">
                    <WebsiteNewsDialog item={n} />
                    <DeleteNewsButton id={n.id} title={n.title} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>No website announcements yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
