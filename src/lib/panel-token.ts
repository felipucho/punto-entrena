// Piezas puras del login del panel: token de sesión, usuario normalizado, IP del pedido.
import { createHash, randomBytes } from "node:crypto";

export const NOMBRE_COOKIE = "punto_panel";
/** 180 días en milisegundos. */
export const DURACION_SESION_MS = 180 * 24 * 3_600_000;

/** 32 bytes al azar en base64url: es lo que viaja en la cookie. En la base solo se guarda su sha256. */
export const crearToken = (): string => randomBytes(32).toString("base64url");

export const hashearToken = (token: string): string => createHash("sha256").update(token, "utf8").digest("hex");

/** El token tiene la forma que genera crearToken (evita consultar la base con basura). */
export const tokenConFormaValida = (token: string | undefined): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

/** minúsculas, sin espacios en los bordes, hasta 64 caracteres: así se busca y se registra el intento. */
export const normalizarUsuario = (usuario: string): string => usuario.trim().toLowerCase().slice(0, 64);

/** Primera entrada de x-forwarded-for, si no x-real-ip, si no "desconocida" (Vercel pone las dos). */
export function ipDelPedido(leer: (nombre: string) => string | null): string {
  const reenviada = leer("x-forwarded-for")?.split(",")[0]?.trim();
  if (reenviada) return reenviada.slice(0, 64);
  const real = leer("x-real-ip")?.trim();
  return real ? real.slice(0, 64) : "desconocida";
}
