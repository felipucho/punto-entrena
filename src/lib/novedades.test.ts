import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXTENSIONES_FOTO, formatearFecha, leerNovedades, ordenarNovedades, type Novedad } from "@/lib/novedades";

function fechaReal(fecha: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

const entradas = await leerNovedades();

describe("content/novedades/", () => {
  it("se lee sin errores", () => {
    expect(Array.isArray(entradas)).toBe(true);
  });

  it.each(entradas.map((n) => [n.slug, n] as const))("la entrada %s está bien cargada", (_slug, n) => {
    expect(fechaReal(n.fecha)).toBe(true);
    expect(n.titulo.trim()).not.toBe("");
    expect(n.texto.trim()).not.toBe("");
    if (n.foto !== null) {
      expect(n.foto.startsWith("/fotos/novedades/"), `la foto ${n.foto} tiene que estar en public/fotos/novedades/`).toBe(true);
      expect(
        EXTENSIONES_FOTO.includes(path.extname(n.foto).toLowerCase()),
        `la foto ${n.foto} no es ${EXTENSIONES_FOTO.join(", ")} (un HEIC del iPhone no se puede mostrar: exportarlo como JPG)`,
      ).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", n.foto)), `no existe public${n.foto}`).toBe(true);
    }
  });
});

describe("formatearFecha", () => {
  it("escribe la fecha en español sin correrla un día", () => {
    expect(formatearFecha("2026-11-15")).toBe("15 de noviembre de 2026");
    expect(formatearFecha("2026-01-01")).toBe("1 de enero de 2026");
  });
});

describe("ordenarNovedades", () => {
  it("deja la más nueva primero y no toca la lista original", () => {
    const lista: Novedad[] = [
      { fecha: "2026-03-01", titulo: "b", texto: "x" },
      { fecha: "2026-12-08", titulo: "a", texto: "x" },
      { fecha: "2025-12-31", titulo: "c", texto: "x" },
    ];
    expect(ordenarNovedades(lista).map((n) => n.titulo)).toEqual(["a", "b", "c"]);
    expect(lista[0].titulo).toBe("b");
  });
});
