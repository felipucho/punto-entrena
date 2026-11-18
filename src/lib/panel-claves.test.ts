import { describe, expect, it } from "vitest";
import { HASH_FALSO, LARGO_MINIMO_CLAVE, hashearClave, problemaConClave, verificarClave } from "./panel-claves";

const CLAVE = "una-clave-larga-de-prueba";

describe("hashearClave / verificarClave", () => {
  it("guarda 'scrypt$N$r$p$sal$hash' y la clave correcta verifica", async () => {
    const h = await hashearClave(CLAVE);
    expect(h).toMatch(/^scrypt\$16384\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/);
    expect(h).not.toContain(CLAVE);
    expect(await verificarClave(CLAVE, h)).toBe(true);
  });

  it("rechaza una clave distinta, vacía o con un espacio de más", async () => {
    const h = await hashearClave(CLAVE);
    expect(await verificarClave(`${CLAVE} `, h)).toBe(false);
    expect(await verificarClave("", h)).toBe(false);
    expect(await verificarClave("otra-clave-larga-123", h)).toBe(false);
  });

  it("la sal es al azar: dos hashes de la misma clave difieren y ambos verifican", async () => {
    const [a, b] = await Promise.all([hashearClave(CLAVE), hashearClave(CLAVE)]);
    expect(a).not.toBe(b);
    expect(await verificarClave(CLAVE, b)).toBe(true);
  });

  it("sin hash (usuario inexistente o inactivo) o con un hash roto devuelve false", async () => {
    expect(await verificarClave(CLAVE, null)).toBe(false);
    expect(await verificarClave(CLAVE, undefined)).toBe(false);
    expect(await verificarClave(CLAVE, "")).toBe(false);
    expect(await verificarClave(CLAVE, "basura")).toBe(false);
    expect(await verificarClave(CLAVE, "scrypt$16384$8$1$AAAA$BBBB")).toBe(false);
    expect(await verificarClave(CLAVE, "bcrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$39dtdfwweJbn0cMy0Wvr3nUIUxwiBcJMMw3NkMJA5Ew")).toBe(false);
  });

  it("no acepta costos descomunales de un hash guardado", async () => {
    expect(await verificarClave(CLAVE, "scrypt$1073741824$8$1$AAAAAAAAAAAAAAAAAAAAAA$39dtdfwweJbn0cMy0Wvr3nUIUxwiBcJMMw3NkMJA5Ew")).toBe(false);
  });

  it("el hash de relleno es válido y nunca verifica", async () => {
    expect(await verificarClave(CLAVE, HASH_FALSO)).toBe(false);
  });
});

describe("problemaConClave", () => {
  it(`exige ${LARGO_MINIMO_CLAVE} caracteres o más`, () => {
    expect(problemaConClave("a".repeat(LARGO_MINIMO_CLAVE - 1))).toMatch(/al menos 12/);
    expect(problemaConClave("a".repeat(LARGO_MINIMO_CLAVE))).toBeNull();
    expect(problemaConClave("a".repeat(201))).toMatch(/demasiado larga/);
  });
});
