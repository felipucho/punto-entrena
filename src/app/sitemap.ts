import type { MetadataRoute } from "next";
import { rutas } from "@/lib/rutas";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return rutas.map((ruta) => ({
    url: ruta === "/" ? `${siteUrl}/` : `${siteUrl}${ruta}`,
  }));
}
