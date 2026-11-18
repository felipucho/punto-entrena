import { describe, expect, it } from "vitest";
import { calcularBloqueo, mensajeBloqueo, type Intento } from "./panel-bloqueo";

const AHORA = Date.UTC(2026, 10, 17, 12, 0);
const MIN = 60_000;
const fallo = (haceMin: number, usuario = "mati", ip = "1.1.1.1"): Intento => ({ usuario, ip, exito: false, creado_el: AHORA - haceMin * MIN });
const exito = (haceMin: number, usuario = "mati", ip = "1.1.1.1"): Intento => ({ usuario, ip, exito: true, creado_el: AHORA - haceMin * MIN });

describe("calcularBloqueo por usuario", () => {
  it("4 fallos no bloquean, 5 sí", () => {
    expect(calcularBloqueo([1, 2, 3, 4].map((m) => fallo(m)), "mati", "1.1.1.1", AHORA)).toEqual({ bloqueado: false });
    expect(calcularBloqueo([1, 2, 3, 4, 5].map((m) => fallo(m)), "mati", "9.9.9.9", AHORA).bloqueado).toBe(true);
  });

  it("dice cuánto falta: hasta que venza el fallo más viejo que mantiene el bloqueo", () => {
    // El más viejo fue hace 10 min: se libera a los 5 min.
    expect(calcularBloqueo([10, 4, 3, 2, 1].map((m) => fallo(m)), "mati", "x", AHORA)).toEqual({ bloqueado: true, minutos: 5 });
  });

  it("con más de 5 fallos hay que esperar a que venzan varios", () => {
    // 7 fallos (14, 13, 12, 5, 4, 3, 2): hay que quedar con 4, o sea que venzan los 3 más viejos; el de hace 12 vence en 3 min.
    expect(calcularBloqueo([14, 13, 12, 5, 4, 3, 2].map((m) => fallo(m)), "mati", "x", AHORA)).toEqual({ bloqueado: true, minutos: 3 });
  });

  it("redondea para arriba y nunca devuelve menos de 1", () => {
    expect(calcularBloqueo([14.9, 3, 2, 1, 0.5].map((m) => fallo(m)), "mati", "x", AHORA)).toEqual({ bloqueado: true, minutos: 1 });
  });

  it("los fallos de hace más de 15 minutos no cuentan", () => {
    expect(calcularBloqueo([16, 17, 18, 19, 20, 1].map((m) => fallo(m)), "mati", "x", AHORA)).toEqual({ bloqueado: false });
    expect(calcularBloqueo([14.5, 14, 13, 12, 11].map((m) => fallo(m)), "mati", "x", AHORA)).toEqual({ bloqueado: true, minutos: 1 });
  });

  it("un éxito reinicia la cuenta: solo cuentan los fallos posteriores", () => {
    const intentos = [fallo(9), fallo(8), fallo(7), fallo(6), exito(5), fallo(4), fallo(3)];
    expect(calcularBloqueo(intentos, "mati", "x", AHORA)).toEqual({ bloqueado: false });
    expect(calcularBloqueo([...intentos, fallo(2), fallo(1), fallo(0.5)], "mati", "x", AHORA).bloqueado).toBe(true);
  });

  it("los fallos de otro usuario (desde otra IP) no bloquean a este", () => {
    expect(calcularBloqueo([1, 2, 3, 4, 5, 6].map((m) => fallo(m, "otra", "2.2.2.2")), "mati", "1.1.1.1", AHORA)).toEqual({ bloqueado: false });
  });
});

describe("calcularBloqueo por IP", () => {
  const deMuchos = (n: number) => Array.from({ length: n }, (_, k) => fallo(k * 0.5 + 0.1, `u${k}`, "3.3.3.3"));

  it("19 fallos desde una IP no bloquean, 20 sí (aunque cada usuario tenga pocos)", () => {
    expect(calcularBloqueo(deMuchos(19), "mati", "3.3.3.3", AHORA)).toEqual({ bloqueado: false });
    expect(calcularBloqueo(deMuchos(20), "mati", "3.3.3.3", AHORA).bloqueado).toBe(true);
  });

  it("otra IP no queda bloqueada", () => {
    expect(calcularBloqueo(deMuchos(30), "mati", "4.4.4.4", AHORA)).toEqual({ bloqueado: false });
  });

  it("un éxito del usuario no libera a la IP", () => {
    expect(calcularBloqueo([...deMuchos(20), exito(0.01, "mati", "3.3.3.3")], "mati", "3.3.3.3", AHORA).bloqueado).toBe(true);
  });

  it("toma el bloqueo más largo entre usuario e IP", () => {
    const porIp = Array.from({ length: 20 }, (_, k) => fallo(14 - k * 0.1, `u${k}`, "3.3.3.3")); // el más viejo libera en ~1 min
    const porUsuario = [1, 1, 1, 1, 1].map((m) => fallo(m, "mati", "5.5.5.5")); // libera en 14 min
    expect(calcularBloqueo([...porIp, ...porUsuario], "mati", "3.3.3.3", AHORA)).toEqual({ bloqueado: true, minutos: 14 });
  });
});

describe("calcularBloqueo, entradas raras", () => {
  it("acepta fechas ISO de la base y descarta las ilegibles", () => {
    const iso = (m: number): Intento => ({ usuario: "mati", ip: "x", exito: false, creado_el: new Date(AHORA - m * MIN).toISOString() });
    expect(calcularBloqueo([1, 2, 3, 4, 5].map(iso), "mati", "x", AHORA).bloqueado).toBe(true);
    const roto: Intento = { usuario: "mati", ip: "x", exito: false, creado_el: "no es fecha" };
    expect(calcularBloqueo([roto, roto, roto, roto, roto], "mati", "x", AHORA)).toEqual({ bloqueado: false });
  });
});

describe("mensajeBloqueo", () => {
  it("usa singular y plural", () => {
    expect(mensajeBloqueo(1)).toBe("Demasiados intentos. Probá de nuevo en 1 minuto.");
    expect(mensajeBloqueo(7)).toBe("Demasiados intentos. Probá de nuevo en 7 minutos.");
  });
});
