import type { MetadataRoute } from "next";
import { rutas } from "@/lib/rutas";
import { avisarSiFaltaDominio, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  avisarSiFaltaDominio();
  return rutas.map((ruta) => ({
    url: ruta === "/" ? `${siteUrl}/` : `${siteUrl}${ruta}`,
  }));
}
