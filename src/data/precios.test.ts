import precios from "@content/precios.json";
import { describe, expect, it } from "vitest";
import { claseSuelta, planes } from "@/data/site";

describe("precios.json", () => {
  it("tiene exactamente las 5 claves, cada una un entero positivo", () => {
    expect(Object.keys(precios).sort()).toEqual(["dia", "dosVeces", "paseLibre", "tresVeces", "unaVez"]);
    for (const valor of Object.values(precios)) {
      expect(Number.isInteger(valor)).toBe(true);
      expect(valor).toBeGreaterThan(0);
    }
  });

  it("los planes salen del JSON y suben con las clases por mes", () => {
    expect(planes.map((plan) => plan.precio)).toEqual([
      precios.unaVez,
      precios.dosVeces,
      precios.tresVeces,
      precios.paseLibre,
    ]);
    expect(claseSuelta.precio).toBe(precios.dia);
    const ordenados = [...planes].sort((a, b) => a.clasesPorMes - b.clasesPorMes).map((plan) => plan.precio);
    expect(planes.map((plan) => plan.precio)).toEqual([...ordenados].sort((a, b) => a - b));
  });
});
