import { describe, expect, it } from "vitest";
import { DURACION_SESION_MS, crearToken, hashearToken, ipDelPedido, normalizarUsuario, tokenConFormaValida } from "./panel-token";

describe("token de sesión", () => {
  it("son 32 bytes al azar en base64url, distintos cada vez", () => {
    const a = crearToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(crearToken()).not.toBe(a);
    expect(tokenConFormaValida(a)).toBe(true);
  });

  it("se guarda el sha256 en hexa, no el token", () => {
    const t = crearToken();
    const h = hashearToken(t);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain(t);
    expect(hashearToken(t)).toBe(h);
    expect(hashearToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("rechaza basura antes de ir a la base", () => {
    for (const t of [undefined, "", "abc", "x".repeat(44), `${crearToken()}!`]) expect(tokenConFormaValida(t)).toBe(false);
  });

  it("dura 180 días", () => {
    expect(DURACION_SESION_MS).toBe(180 * 86_400_000);
  });
});

describe("normalizarUsuario", () => {
  it("pasa a minúsculas, recorta y limita a 64", () => {
    expect(normalizarUsuario("  Mati.P ")).toBe("mati.p");
    expect(normalizarUsuario("A".repeat(100))).toBe("a".repeat(64));
  });
});

describe("ipDelPedido", () => {
  const h = (o: Record<string, string>) => (n: string) => o[n] ?? null;

  it("usa la primera de x-forwarded-for", () => {
    expect(ipDelPedido(h({ "x-forwarded-for": "200.1.2.3, 10.0.0.1", "x-real-ip": "9.9.9.9" }))).toBe("200.1.2.3");
  });

  it("si no, x-real-ip; si no, 'desconocida'", () => {
    expect(ipDelPedido(h({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(ipDelPedido(h({ "x-forwarded-for": " " }))).toBe("desconocida");
    expect(ipDelPedido(h({}))).toBe("desconocida");
  });
});
