import { describe, expect, it } from "vitest";
import config from "../../keystatic.config";
import { VERSION_KEYSTATIC, traducir, versionInstalada } from "../../scripts/traducir-keystatic.mjs";
import { TAMANOS_FOTO } from "@/lib/novedades-tamanos.mjs";

// El panel se traduce parcheando node_modules/@keystatic/core (scripts/traducir-keystatic.mjs, en postinstall). El mismo
// script monta la vista previa debajo del formulario: si Keystatic cambia FormForEntry, el segundo test lo avisa.
describe("traducción del panel de Keystatic", () => {
  it("la versión instalada es la que tiene traducciones", () => {
    expect(versionInstalada()).toBe(VERSION_KEYSTATIC);
  });

  it("todos los textos existen en el código instalado", () => {
    expect(traducir({ escribir: false }).faltan).toEqual([]);
  });

  it("ya están aplicadas (si falla: npm install, o node scripts/traducir-keystatic.mjs)", () => {
    expect(traducir({ escribir: false }).pendientes).toEqual([]);
  });
});

describe("campo tamano de las novedades", () => {
  it("ofrece los mismos tamaños que usa el sitio, con mediana por defecto", () => {
    const campo = config.collections?.novedades.schema.tamano;
    if (!campo || !("options" in campo)) throw new Error("falta el campo tamano en keystatic.config.ts");
    expect(campo.options.map((o) => o.value)).toEqual(TAMANOS_FOTO);
    expect(campo.defaultValue()).toBe("mediana");
  });
});
