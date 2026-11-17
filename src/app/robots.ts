import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // El panel de edición y su vista previa no son para buscadores (además llevan noindex en su layout).
    rules: { userAgent: "*", allow: "/", disallow: ["/keystatic", "/api/keystatic", "/vista-previa-novedad"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
