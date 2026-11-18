import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel de edición no es para buscadores (además lleva noindex en su layout y en los headers).
    rules: { userAgent: "*", allow: "/", disallow: ["/panel"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
