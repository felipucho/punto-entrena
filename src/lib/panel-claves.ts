// Contraseñas del panel: scrypt de node:crypto, sin dependencias. Solo sintaxis que Node puede ejecutar quitando los
// tipos (sin enums ni propiedades en el constructor): scripts/panel-usuario.mjs importa este mismo archivo.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const LARGO_MINIMO_CLAVE = 12;
export const LARGO_MAXIMO_CLAVE = 200;
const N = 16384;
const R = 8;
const P = 1;
const LARGO_HASH = 32;
const LARGO_SAL = 16;
/** Tope de costo que se acepta leer de un hash guardado: ni un hash corrupto puede colgar el servidor. */
const N_MAXIMO = 1 << 17;
const MAXMEM = 256 * 1024 * 1024;

type Parametros = { N: number; r: number; p: number; sal: Buffer; hash: Buffer };

const aBase64 = (b: Buffer) => b.toString("base64url");

function derivar(clave: string, sal: Buffer, largo: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(clave.normalize("NFKC"), sal, largo, { N: n, r, p, maxmem: MAXMEM }, (error, derivada) => {
      if (error) rechazar(error);
      else resolver(derivada);
    });
  });
}

/** "scrypt$N$r$p$sal$hash" → partes, o null si no tiene esa forma. */
function leer(guardado: string): Parametros | null {
  const partes = guardado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return null;
  const [n, r, p] = partes.slice(1, 4).map((x) => (/^\d{1,7}$/.test(x) ? Number(x) : Number.NaN));
  if (![n, r, p].every((x) => Number.isInteger(x) && x >= 1)) return null;
  if (n > N_MAXIMO || (n & (n - 1)) !== 0 || r > 32 || p > 16) return null;
  const sal = Buffer.from(partes[4], "base64url");
  const hash = Buffer.from(partes[5], "base64url");
  if (sal.length < 8 || hash.length < 16) return null;
  return { N: n, r, p, sal, hash };
}

/** Devuelve "scrypt$N$r$p$sal$hash" con una sal nueva al azar (base64url). */
export async function hashearClave(clave: string): Promise<string> {
  const sal = randomBytes(LARGO_SAL);
  const hash = await derivar(clave, sal, LARGO_HASH, N, R, P);
  return `scrypt$${N}$${R}$${P}$${aBase64(sal)}$${aBase64(hash)}`;
}

// Un hash válido de una clave que nadie conoce: cuando el usuario no existe o está desactivado se corre el mismo scrypt
// contra este, así la respuesta tarda lo mismo y no revela si la cuenta existe.
export const HASH_FALSO = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$39dtdfwweJbn0cMy0Wvr3nUIUxwiBcJMMw3NkMJA5Ew";

/** true solo si `guardado` es un hash válido y la clave coincide. Con `guardado` ausente o roto igual gasta el scrypt. */
export async function verificarClave(ingresada: string, guardado: string | null | undefined): Promise<boolean> {
  const real = guardado ? leer(guardado) : null;
  const objetivo = real ?? (leer(HASH_FALSO) as Parametros);
  const calculado = await derivar(ingresada, objetivo.sal, objetivo.hash.length, objetivo.N, objetivo.r, objetivo.p);
  const igual = timingSafeEqual(calculado, objetivo.hash);
  return real !== null && igual;
}

/** Mensaje de por qué una clave nueva no sirve, o null si sirve. */
export function problemaConClave(clave: string): string | null {
  if (clave.length < LARGO_MINIMO_CLAVE) return `La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`;
  if (clave.length > LARGO_MAXIMO_CLAVE) return `La contraseña es demasiado larga (máximo ${LARGO_MAXIMO_CLAVE} caracteres).`;
  return null;
}
