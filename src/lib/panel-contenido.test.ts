import { describe, expect, it } from "vitest";
import {
  MAX_TEXTO,
  MAX_TITULO,
  esSlugValido,
  fotoPublica,
  generarSlug,
  jsonNovedad,
  jsonPrecios,
  rutaFoto,
  rutaNovedad,
  rutaPermitida,
  slugUnico,
  validarNovedad,
  validarPrecios,
} from "./panel-contenido";

const PRECIOS = { unaVez: "40000", dosVeces: "50000", tresVeces: "55000", paseLibre: "60000", dia: "15000" };

describe("validarPrecios", () => {
  it("acepta enteros positivos (como texto o número)", () => {
    expect(validarPrecios(PRECIOS)).toEqual({
      ok: true,
      valor: { unaVez: 40000, dosVeces: 50000, tresVeces: 55000, paseLibre: 60000, dia: 15000 },
    });
    expect(validarPrecios({ ...PRECIOS, dia: 1000 }).ok).toBe(true);
    expect(validarPrecios({ ...PRECIOS, dia: 10_000_000 }).ok).toBe(true);
  });

  it("explica un cero de más o de menos", () => {
    expect(validarPrecios({ ...PRECIOS, paseLibre: "5" })).toEqual({ ok: false, error: "Pase libre: $5 es muy poco. ¿Falta un cero? (mínimo $1.000)" });
    expect(validarPrecios({ ...PRECIOS, paseLibre: "600000000" })).toEqual({
      ok: false,
      error: "Pase libre: $600.000.000 es demasiado. ¿Sobra un cero? (máximo $10.000.000)",
    });
  });

  it.each(["", "0", "-5", "12,5", "12.5", "1e3", "abc", "12 000", "9999999999", "5", "999", "10000001"])("rechaza %j", (malo) => {
    const r = validarPrecios({ ...PRECIOS, paseLibre: malo });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("Pase libre");
  });

  it("rechaza si falta un campo", () => {
    expect(validarPrecios({ ...PRECIOS, dia: undefined }).ok).toBe(false);
    expect(validarPrecios({}).ok).toBe(false);
  });
});

const NOVEDAD = { titulo: "Feriado del lunes", fecha: "2026-11-23T09:00", texto: "El lunes abrimos de 9 a 13.", tamano: "chica" };

describe("validarNovedad", () => {
  it("acepta una novedad completa y recorta espacios", () => {
    const r = validarNovedad({ ...NOVEDAD, titulo: "  Feriado  ", texto: "\n Hola \r\n\r\nChau\n" });
    expect(r).toEqual({ ok: true, valor: { ...NOVEDAD, titulo: "Feriado", texto: "Hola \n\nChau" } });
  });

  it("el tamaño es opcional y queda en mediana", () => {
    const r = validarNovedad({ ...NOVEDAD, tamano: undefined });
    expect(r.ok && r.valor.tamano).toBe("mediana");
  });

  it("título: obligatorio y hasta 120", () => {
    expect(validarNovedad({ ...NOVEDAD, titulo: "   " }).ok).toBe(false);
    expect(validarNovedad({ ...NOVEDAD, titulo: "a".repeat(MAX_TITULO) }).ok).toBe(true);
    expect(validarNovedad({ ...NOVEDAD, titulo: "a".repeat(MAX_TITULO + 1) }).ok).toBe(false);
  });

  it("texto: obligatorio y hasta 5000", () => {
    expect(validarNovedad({ ...NOVEDAD, texto: " \n " }).ok).toBe(false);
    expect(validarNovedad({ ...NOVEDAD, texto: "a".repeat(MAX_TEXTO) }).ok).toBe(true);
    expect(validarNovedad({ ...NOVEDAD, texto: "a".repeat(MAX_TEXTO + 1) }).ok).toBe(false);
  });

  it.each(["", "2026-11-23", "2026-11-23 09:00", "2026-11-23T09:00:00", "2026-02-30T09:00", "2026-13-01T09:00", "2026-11-23T24:00", "ayer"])(
    "fecha inválida %j",
    (fecha) => {
      expect(validarNovedad({ ...NOVEDAD, fecha }).ok).toBe(false);
    },
  );

  it("tamaño fuera de la lista", () => {
    expect(validarNovedad({ ...NOVEDAD, tamano: "enorme" }).ok).toBe(false);
  });

  it("no acepta lo que no es texto", () => {
    expect(validarNovedad({ ...NOVEDAD, titulo: 5 }).ok).toBe(false);
    expect(validarNovedad({ ...NOVEDAD, texto: ["a"] }).ok).toBe(false);
  });
});

describe("generarSlug", () => {
  it("minúsculas, sin tildes, a-z0-9 y guiones", () => {
    expect(generarSlug("Feriado del lunes")).toBe("feriado-del-lunes");
    expect(generarSlug("¡Nueva clase de Funcional! (sábados)")).toBe("nueva-clase-de-funcional-sabados");
    expect(generarSlug("Niño pingüino — año 2026")).toBe("nino-pinguino-ano-2026");
  });

  it("cae en 'novedad' si no queda nada", () => {
    expect(generarSlug("¡¡¡???")).toBe("novedad");
    expect(generarSlug("")).toBe("novedad");
  });

  it("no pasa de 60 caracteres ni termina en guion", () => {
    const slug = generarSlug(`${"palabra ".repeat(20)}fin`);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
    expect(esSlugValido(slug)).toBe(true);
  });
});

describe("slugUnico", () => {
  it("devuelve el mismo si está libre", () => {
    expect(slugUnico("feriado", ["otro"])).toBe("feriado");
  });

  it("agrega -2, -3 si ya existe", () => {
    expect(slugUnico("feriado", ["feriado"])).toBe("feriado-2");
    expect(slugUnico("feriado", ["feriado", "feriado-2"])).toBe("feriado-3");
    expect(slugUnico("feriado", new Set(["feriado", "feriado-3"]))).toBe("feriado-2");
  });

  it("evita 'nueva', que es una ruta del panel", () => {
    expect(slugUnico("nueva", [])).toBe("nueva-2");
  });
});

describe("rutas", () => {
  it("esSlugValido frena rutas armadas", () => {
    for (const malo of ["", "../x", "a/b", "a b", "A", "-a", "a-", "a--b", "a.json", "a\\b", "x".repeat(201), 3, null, undefined]) {
      expect(esSlugValido(malo)).toBe(false);
    }
    expect(esSlugValido("feriado-del-lunes-2")).toBe(true);
  });

  it("rutaPermitida solo deja los archivos del panel", () => {
    expect(rutaPermitida("content/precios.json")).toBe(true);
    expect(rutaPermitida(rutaNovedad("feriado"))).toBe(true);
    expect(rutaPermitida(rutaFoto("feriado"))).toBe(true);
    expect(rutaPermitida("public/fotos/novedades/feriado/foto.png")).toBe(true);
    for (const mala of [
      "package.json",
      ".github/workflows/sync-fork.yml",
      "content/novedades/../precios.json",
      "content/novedades/a/b.json",
      "public/fotos/novedades/a/../../../x",
      "public/fotos/novedades/a/..",
      "/content/precios.json",
      "src/app/page.tsx",
    ]) {
      expect(rutaPermitida(mala)).toBe(false);
    }
  });

  it("la ruta pública de la foto es la que lee el sitio", () => {
    expect(fotoPublica("feriado")).toBe("/fotos/novedades/feriado/foto.webp");
  });
});

describe("formato de los JSON", () => {
  it("la novedad conserva el orden de campos de siempre", () => {
    const json = jsonNovedad(
      { titulo: "Hola", fecha: "2026-11-23T09:00", texto: "a\n\nb", tamano: "grande" },
      "/fotos/novedades/hola/foto.webp",
    );
    expect(Object.keys(JSON.parse(json))).toEqual(["titulo", "fecha", "texto", "foto", "tamano"]);
    expect(json.endsWith("}\n")).toBe(true);
    expect(JSON.parse(jsonNovedad({ titulo: "H", fecha: "2026-11-23T09:00", texto: "t", tamano: "chica" }, null)).foto).toBeNull();
  });

  it("los precios, igual que content/precios.json", () => {
    expect(jsonPrecios({ unaVez: 1, dosVeces: 2, tresVeces: 3, paseLibre: 4, dia: 5 })).toBe(
      '{\n  "unaVez": 1,\n  "dosVeces": 2,\n  "tresVeces": 3,\n  "paseLibre": 4,\n  "dia": 5\n}\n',
    );
  });
});
