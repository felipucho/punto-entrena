import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel de edición no es para buscadores (además lleva noindex en su layout).
    rules: { userAgent: "*", allow: "/", disallow: ["/keystatic", "/api/keystatic"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
