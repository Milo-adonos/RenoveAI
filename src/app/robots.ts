import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/upload", "/loading", "/pricing", "/dashboard", "/auth"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
