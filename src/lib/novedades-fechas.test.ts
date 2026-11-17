import { describe, expect, it } from "vitest";
import { avisoEnCola, estaPublicada, fechaArgentina, formatearFecha, instanteDePublicacion } from "./novedades-fechas";

describe("novedades-fechas: bordes", () => {
  it.each(["2026-13-01T10:00", "2026-00-10T10:00", "2026-01-32T10:00", "2026-02-30T10:00", "2026-11-20T24:00", "2026-11-20T10:60"])(
    "%s fuera de rango deberia ser NaN",
    (f) => {
      expect(instanteDePublicacion(f)).toBeNaN();
    },
  );

  it("una fecha invalida nunca esta publicada ni da aviso de cola", () => {
    expect(estaPublicada("2026-13-01T10:00", Number.MAX_SAFE_INTEGER)).toBe(false);
    expect(avisoEnCola("2026-13-01T10:00", 0)).toBeNull();
  });

  it.each(["", "2026-11-20", "2026-11-20 10:00", "2026-11-20T10:00:00", "2026-11-20T10:00Z", " 2026-11-20T10:00", "2026-1-2T1:00"])(
    "formato raro %j -> NaN",
    (f) => {
      expect(instanteDePublicacion(f)).toBeNaN();
    },
  );

  it("medianoche: 00:00 argentina = 03:00 UTC del mismo dia", () => {
    expect(instanteDePublicacion("2026-11-20T00:00")).toBe(Date.UTC(2026, 10, 20, 3, 0));
    expect(instanteDePublicacion("2026-11-20T23:59")).toBe(Date.UTC(2026, 10, 21, 2, 59));
  });

  it("cruce de anio: 31/12 23:30 = 1/1 02:30 UTC", () => {
    expect(instanteDePublicacion("2026-12-31T23:30")).toBe(Date.UTC(2027, 0, 1, 2, 30));
  });

  it("29 de febrero en anio bisiesto es valido", () => {
    expect(instanteDePublicacion("2028-02-29T10:00")).toBe(Date.UTC(2028, 1, 29, 13, 0));
  });

  it("estaPublicada: exactamente en el instante si, un ms antes no", () => {
    const t = instanteDePublicacion("2026-11-20T10:00");
    expect(estaPublicada("2026-11-20T10:00", t)).toBe(true);
    expect(estaPublicada("2026-11-20T10:00", t - 1)).toBe(false);
    expect(estaPublicada("2026-11-20T10:00", t + 1)).toBe(true);
  });

  it("avisoEnCola: en el instante exacto es null; un ms antes avisa", () => {
    const t = instanteDePublicacion("2026-11-20T10:00");
    expect(avisoEnCola("2026-11-20T10:00", t)).toBeNull();
    expect(avisoEnCola("2026-11-20T10:00", t - 1)).toBe("En cola: se publica el 20 de noviembre de 2026 a las 10:00.");
  });

  it("avisoEnCola con null", () => {
    expect(avisoEnCola(null, 0)).toBeNull();
  });

  it("fechaArgentina cruza el dia hacia atras y es inversa de instanteDePublicacion", () => {
    expect(fechaArgentina(Date.UTC(2026, 10, 20, 2, 59))).toBe("2026-11-19T23:59");
    expect(fechaArgentina(Date.UTC(2026, 10, 20, 3, 0))).toBe("2026-11-20T00:00");
    for (const f of ["2026-01-01T00:00", "2026-12-31T23:59", "2028-02-29T12:34"]) {
      expect(fechaArgentina(instanteDePublicacion(f))).toBe(f);
    }
  });

  it("formatearFecha no corre el dia a medianoche", () => {
    expect(formatearFecha("2026-11-20T00:00")).toBe("20 de noviembre de 2026");
    expect(formatearFecha("2026-11-20T23:59")).toBe("20 de noviembre de 2026");
    expect(formatearFecha("2026-01-01")).toBe("1 de enero de 2026");
  });
});
