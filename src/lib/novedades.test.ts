import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  avisoEnCola,
  EXTENSIONES_FOTO,
  estaPublicada,
  formatearFecha,
  instanteDePublicacion,
  ordenarNovedades,
  publicadas,
  TAMANOS_FOTO,
  type Novedad,
} from "@/lib/novedades";
import { leerNovedadesCrudas } from "@/lib/novedades-datos.mjs";
import { fechaArgentina } from "@/lib/novedades-fechas";

/** "YYYY-MM-DDTHH:mm" con una fecha y una hora que existen. */
function fechaHoraReal(fecha: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(fecha);
  if (!m) return false;
  const [anio, mes, dia, hora, minuto] = m.slice(1).map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia, hora, minuto));
  return (
    d.getUTCFullYear() === anio &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia &&
    d.getUTCHours() === hora &&
    d.getUTCMinutes() === minuto
  );
}

const entradas = await leerNovedadesCrudas();

describe("content/novedades/", () => {
  it("se lee sin errores", () => {
    expect(Array.isArray(entradas)).toBe(true);
  });

  it.each(entradas.map((n) => [n.slug, n] as const))("la entrada %s está bien cargada", (_slug, n) => {
    expect(fechaHoraReal(n.fecha), `fecha y hora de publicación inválida: "${n.fecha}" (formato 2026-11-20T10:00)`).toBe(true);
    expect(n.titulo.trim()).not.toBe("");
    expect(n.texto.trim()).not.toBe("");
    if (n.tamano !== null) {
      expect(TAMANOS_FOTO as readonly string[], `tamano "${n.tamano}": tiene que ser ${TAMANOS_FOTO.join(", ")}`).toContain(n.tamano);
    }
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

  it("con fecha y hora muestra solo el día, también pasada la medianoche en Argentina", () => {
    expect(formatearFecha("2026-11-15T10:00")).toBe("15 de noviembre de 2026");
    expect(formatearFecha("2026-11-15T23:59")).toBe("15 de noviembre de 2026");
    expect(formatearFecha("2026-11-16T00:00")).toBe("16 de noviembre de 2026");
  });
});

describe("hora de publicación (Argentina, UTC-3)", () => {
  it("las 10:00 de Argentina son las 13:00 UTC", () => {
    expect(instanteDePublicacion("2026-11-20T10:00")).toBe(Date.UTC(2026, 10, 20, 13, 0));
    expect(instanteDePublicacion("2026-11-20T23:30")).toBe(Date.UTC(2026, 10, 21, 2, 30));
  });

  it("no se publica a las 10:00 UTC, sí a las 13:00 UTC", () => {
    const fecha = "2026-11-20T10:00";
    expect(estaPublicada(fecha, Date.UTC(2026, 10, 20, 10, 0))).toBe(false);
    expect(estaPublicada(fecha, Date.UTC(2026, 10, 20, 12, 59, 59))).toBe(false);
    expect(estaPublicada(fecha, Date.UTC(2026, 10, 20, 13, 0))).toBe(true);
    expect(estaPublicada(fecha, Date.UTC(2026, 10, 21))).toBe(true);
  });

  it("una fecha mal escrita no se publica nunca", () => {
    expect(instanteDePublicacion("2026-11-20")).toBeNaN();
    expect(estaPublicada("mañana", Date.UTC(2030, 0, 1))).toBe(false);
  });
});

describe("ordenarNovedades", () => {
  it("deja la más nueva primero, mira la hora y no toca la lista original", () => {
    const lista: Novedad[] = [
      { fecha: "2026-03-01T09:00", titulo: "b", texto: "x", tamano: "mediana" },
      { fecha: "2026-12-08T08:30", titulo: "a", texto: "x", tamano: "mediana" },
      { fecha: "2026-12-08T07:00", titulo: "d", texto: "x", tamano: "mediana" },
      { fecha: "2025-12-31T23:59", titulo: "c", texto: "x", tamano: "mediana" },
    ];
    expect(ordenarNovedades(lista).map((n) => n.titulo)).toEqual(["a", "d", "b", "c"]);
    expect(lista[0].titulo).toBe("b");
  });
});

describe("publicadas", () => {
  const lista: Novedad[] = [
    { fecha: "2026-11-10T09:00", titulo: "pasada", texto: "x", tamano: "mediana" },
    { fecha: "2026-11-20T10:00", titulo: "programada", texto: "x", tamano: "mediana" },
    { fecha: "2026-11-15T18:00", titulo: "reciente", texto: "x", tamano: "mediana" },
  ];

  it("saca las que están en cola y deja las otras, la más nueva primero", () => {
    const ahora = Date.UTC(2026, 10, 16, 15, 0);
    expect(publicadas(lista, ahora).map((n) => n.titulo)).toEqual(["reciente", "pasada"]);
  });

  it("la programada aparece recién a las 10:00 de Argentina", () => {
    expect(publicadas(lista, Date.UTC(2026, 10, 20, 12, 59)).map((n) => n.titulo)).toEqual(["reciente", "pasada"]);
    expect(publicadas(lista, Date.UTC(2026, 10, 20, 13, 0)).map((n) => n.titulo)).toEqual(["programada", "reciente", "pasada"]);
  });
});

describe("avisoEnCola", () => {
  const ahora = Date.UTC(2026, 10, 16, 15, 0);

  it("avisa día y hora de una novedad que todavía no llegó", () => {
    expect(avisoEnCola("2026-11-20T10:00", ahora)).toBe("En cola: se publica el 20 de noviembre de 2026 a las 10:00.");
  });

  it("no avisa si ya está publicada, si falta la fecha o si es inválida", () => {
    expect(avisoEnCola("2026-11-10T09:00", ahora)).toBeNull();
    expect(avisoEnCola(null, ahora)).toBeNull();
    expect(avisoEnCola("mañana", ahora)).toBeNull();
  });
});

describe("fechaArgentina", () => {
  it("pasa un instante UTC a la hora de Argentina y vuelve al mismo instante", () => {
    const instante = Date.UTC(2026, 10, 20, 13, 0);
    expect(fechaArgentina(instante)).toBe("2026-11-20T10:00");
    expect(instanteDePublicacion(fechaArgentina(instante))).toBe(instante);
  });

  it("cambia de día antes de las 3 UTC", () => {
    expect(fechaArgentina(Date.UTC(2026, 10, 21, 1, 30))).toBe("2026-11-20T22:30");
  });
});
