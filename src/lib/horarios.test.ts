import { describe, expect, it } from "vitest";
import { grilla, planes, profes } from "@/data/site";
import { formatearNumero, precioPorClase } from "@/lib/formato";
import {
  NOMBRE_COLUMNA,
  diasDeApertura,
  formatearSegmentos,
  getEstado,
  horarioGeneral,
  horarioGeneralCorto,
  horariosDeProfe,
} from "@/lib/horarios";

// Todas las fechas llevan offset -03:00 para no depender de la zona horaria de la máquina.
describe("getEstado", () => {
  const casos: [string, string][] = [
    ["2026-09-28T06:59:00-03:00", "Cerrado · abrimos hoy a las 7"], // lunes
    ["2026-09-28T07:00:00-03:00", "Abierto ahora · te atiende César"], // lunes
    ["2026-09-28T16:30:00-03:00", "Abierto ahora"], // lunes, franja sin profe
    ["2026-09-29T16:30:00-03:00", "Abierto ahora · te atiende Mati"], // martes
    ["2026-09-29T22:00:00-03:00", "Cerrado · abrimos mañana a las 7"], // martes
    ["2026-09-30T12:30:00-03:00", "Cerrado · abrimos hoy a las 13"], // miércoles
    ["2026-10-01T08:00:00-03:00", "Abierto ahora · te atiende Gino"], // jueves
    ["2026-10-02T20:59:00-03:00", "Abierto ahora · te atiende Mati"], // viernes
    ["2026-10-02T21:00:00-03:00", "Cerrado · abrimos el lunes a las 7"], // viernes
    ["2026-09-26T10:00:00-03:00", "Cerrado · abrimos el lunes a las 7"], // sábado
    ["2026-09-27T10:00:00-03:00", "Cerrado · abrimos mañana a las 7"], // domingo
  ];

  it.each(casos)("%s → %s", (fecha, esperado) => {
    expect(getEstado(new Date(fecha))).toBe(esperado);
  });

  it("usa la hora de Córdoba aunque la fecha venga en UTC", () => {
    // 10:00 UTC = 07:00 en Córdoba, lunes.
    expect(getEstado(new Date("2026-09-28T10:00:00Z"))).toBe("Abierto ahora · te atiende César");
  });
});

describe("horariosDeProfe", () => {
  const formato = (id: string) => {
    const { lmv, mj } = horariosDeProfe(id);
    return `lmv ${formatearSegmentos(lmv)} · mj ${formatearSegmentos(mj)}`;
  };

  it.each([
    ["matias-salve", "lmv 17–21 · mj 15–17"],
    ["cesar-martinazzo", "lmv 7–9 y 13–16 · mj 13–15"],
    ["gino-magnani", "lmv 9–10 · mj 7–12"],
    ["valentina-salve", "lmv 10–12 · mj 17–21"],
  ])("%s → %s", (id, esperado) => {
    expect(formato(id)).toBe(esperado);
  });
});

describe("horario general", () => {
  it("se deriva de la grilla", () => {
    expect(horarioGeneral()).toBe("Lunes a viernes de 7 a 12 y de 13 a 21. Sábados y domingos cerrado.");
  });

  it("tiene una versión corta", () => {
    expect(horarioGeneralCorto()).toBe("Lun. a vie., 7 a 12 y 13 a 21 h");
  });

  it("nombra los días de apertura", () => {
    expect(diasDeApertura()).toBe("lunes a viernes");
  });

  it("nombra las columnas de la grilla desde columnaPorDia", () => {
    expect(NOMBRE_COLUMNA).toEqual({ lmv: "Lunes, miércoles y viernes", mj: "Martes y jueves" });
  });
});

describe("precio por clase", () => {
  it("divide el precio por las clases del mes y redondea", () => {
    expect(planes.map((p) => formatearNumero(precioPorClase(p)))).toEqual(["10.000", "6.250", "4.583", "3.000"]);
  });
});

describe("datos", () => {
  it("cada profe de la grilla existe en profes", () => {
    const ids = new Set(profes.map((p) => p.id));
    for (const franja of grilla) {
      if (franja.cerrado) continue;
      for (const id of [franja.lmv, franja.mj]) {
        if (id !== null) expect(ids.has(id), id).toBe(true);
      }
    }
  });
});
