import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import datos from "@content/novedades.json";
import { formatearFecha, ordenarNovedades, type Novedad } from "@/lib/novedades";

/** Mismas extensiones que busca Foto (src/components/Foto.tsx). */
const EXTENSIONES = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const CLAVES = ["fecha", "titulo", "texto", "foto"];

function fechaReal(fecha: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) return false;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

describe("content/novedades.json", () => {
  it("es una lista", () => {
    expect(Array.isArray(datos)).toBe(true);
  });

  it.each((datos as Novedad[]).map((n, i) => [i, n.titulo, n] as const))("la entrada %i (%s) está bien cargada", (_i, _t, n) => {
    expect(fechaReal(n.fecha)).toBe(true);
    expect(typeof n.titulo === "string" && n.titulo.trim() !== "").toBe(true);
    expect(typeof n.texto === "string" && n.texto.trim() !== "").toBe(true);
    expect(Object.keys(n).filter((k) => !CLAVES.includes(k))).toEqual([]);
    if (n.foto !== undefined) {
      const existe = EXTENSIONES.some((ext) => existsSync(path.join(process.cwd(), "public", "fotos", n.foto + ext)));
      expect(existe, `no existe public/fotos/${n.foto} con extensión ${EXTENSIONES.join(", ")}`).toBe(true);
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
