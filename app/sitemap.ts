import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site/config";
import { DEPARTMENTS, PROGRAMS } from "@/lib/site/content/programs";
import { LEADERSHIP } from "@/lib/site/content/institution";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/about", priority: 0.8 },
    { path: "/about/history", priority: 0.6 },
    { path: "/about/leadership", priority: 0.6 },
    { path: "/academics", priority: 0.7 },
    { path: "/academics/examinations", priority: 0.6 },
    { path: "/programs", priority: 0.9 },
    { path: "/departments", priority: 0.7 },
    { path: "/admissions", priority: 0.9 },
    { path: "/admissions/fee-structure", priority: 0.7 },
    { path: "/campus", priority: 0.7 },
    { path: "/student-life", priority: 0.6 },
    { path: "/library", priority: 0.6 },
    { path: "/policies", priority: 0.5 },
    { path: "/policies/conduct", priority: 0.4 },
    { path: "/policies/attendance", priority: 0.5 },
    { path: "/policies/anti-ragging", priority: 0.5 },
    { path: "/policies/uniform", priority: 0.4 },
    { path: "/policies/hostel-rules", priority: 0.4 },
    { path: "/faculty", priority: 0.5 },
    { path: "/news", priority: 0.7 },
    { path: "/downloads", priority: 0.5 },
    { path: "/contact", priority: 0.7 },
    { path: "/recruitment", priority: 0.4 },
  ];
  const dynamicPaths = [
    ...PROGRAMS.map((p) => ({ path: `/programs/${p.slug}`, priority: 0.9 })),
    ...DEPARTMENTS.map((d) => ({ path: `/departments/${d.slug}`, priority: 0.7 })),
    ...LEADERSHIP.map((l) => ({ path: `/about/leadership/${l.slug}`, priority: 0.5 })),
  ];
  return [...staticPaths, ...dynamicPaths].map(({ path, priority }) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: path === "/news" ? "weekly" : "monthly",
    priority,
  }));
}
