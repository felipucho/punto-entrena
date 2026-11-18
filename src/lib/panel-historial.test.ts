import { describe, expect, it } from "vitest";
import { describirCambio, esHuella, formatearMomento, queSeDeshizo } from "./panel-historial";

describe("describirCambio", () => {
  it("dice quién y qué", () => {
    expect(describirCambio({ accion: "precios", detalle: null, nombre: "Mati" })).toBe("Mati cambió los precios");
    expect(describirCambio({ accion: "novedad_crear", detalle: "Feriado", nombre: "Mati" })).toBe("Mati creó la novedad «Feriado»");
    expect(describirCambio({ accion: "novedad_editar", detalle: "Feriado", nombre: "Feli" })).toBe("Feli editó la novedad «Feriado»");
    expect(describirCambio({ accion: "novedad_borrar", detalle: "Feriado", nombre: "Feli" })).toBe("Feli borró la novedad «Feriado»");
  });

  it("sin nombre (usuario borrado) o con acción desconocida no falla", () => {
    expect(describirCambio({ accion: "precios", detalle: null, nombre: null })).toBe("Alguien cambió los precios");
    expect(describirCambio({ accion: "novedad_crear", detalle: null, nombre: "Mati" })).toBe("Mati creó la novedad");
    expect(describirCambio({ accion: "otra", detalle: null, nombre: "Mati" })).toBe("Mati hizo un cambio");
  });
});

describe("formatearMomento", () => {
  it("pasa de UTC a hora de Argentina (UTC-3)", () => {
    expect(formatearMomento("2026-11-17T13:32:00+00:00")).toBe("17 nov, 10:32");
    expect(formatearMomento("2026-11-17T13:32:00.123456Z")).toBe("17 nov, 10:32");
  });

  it("cruza el día hacia atrás", () => {
    expect(formatearMomento("2026-12-01T01:05:00Z")).toBe("30 nov, 22:05");
  });

  it("una fecha ilegible no rompe", () => {
    expect(formatearMomento("nada")).toBe("—");
  });
});

describe("deshacer en el historial", () => {
  it("nombra lo deshecho", () => {
    expect(describirCambio({ accion: "deshacer", detalle: queSeDeshizo("precios", null), nombre: "Mati" })).toBe("Mati deshizo el cambio de precios");
    expect(queSeDeshizo("novedad_crear", "Feriado")).toBe("la creación de «Feriado»");
    expect(queSeDeshizo("novedad_editar", "Feriado")).toBe("la edición de «Feriado»");
    expect(queSeDeshizo("novedad_borrar", null)).toBe("el borrado de una novedad");
  });

  it("esHuella acepta solo lo que guarda el panel", () => {
    const v = (sha: string | null) => [{ ruta: "content/precios.json", sha }];
    expect(esHuella({ antes: v("a".repeat(40)), despues: v(null) })).toBe(true);
    expect(esHuella({ antes: v("nada"), despues: v(null) })).toBe(false);
    expect(esHuella({ antes: [], despues: [] })).toBe(false);
    expect(esHuella({ antes: v(null), despues: [...v(null), ...v(null)] })).toBe(false);
    expect(esHuella(null)).toBe(false);
  });
});
