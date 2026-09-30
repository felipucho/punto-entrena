import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import type { Ruta } from "@/lib/rutas";

/** Cada página con su metadata: si una ruta nueva se olvida acá, el sitemap la tiene y este test no la mira. */
const paginas: Record<Ruta, () => Promise<{ metadata: Metadata }>> = {
  "/": () => import("@/app/page"),
  "/planes": () => import("@/app/planes/page"),
  "/horarios": () => import("@/app/horarios/page"),
  "/instalaciones": () => import("@/app/instalaciones/page"),
  "/equipo": () => import("@/app/equipo/page"),
  "/objetivos": () => import("@/app/objetivos/page"),
  "/faq": () => import("@/app/faq/page"),
  "/contacto": () => import("@/app/contacto/page"),
  "/privacidad": () => import("@/app/privacidad/page"),
  "/terminos": () => import("@/app/terminos/page"),
};

describe.each(Object.entries(paginas))("metadata de %s", (ruta, cargar) => {
  it("tiene descripción de hasta 155 caracteres", async () => {
    const { metadata } = await cargar();
    expect(typeof metadata.description).toBe("string");
    expect(metadata.description?.length ?? 0).toBeLessThanOrEqual(155);
  });

  it("usa su propia ruta como canonical", async () => {
    const { metadata } = await cargar();
    expect(metadata.alternates?.canonical).toBe(ruta);
  });
});
