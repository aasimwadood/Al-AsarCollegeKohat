import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/auth", "/recruitment/portal", "/login", "/register", "/forgot-password", "/update-password"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
