// Login y sesión del panel en Next: usuarios y contraseñas en Supabase, cookie con un token al azar (en la base solo
// está su sha256). No se confía en que otra capa (un proxy, el layout) ya haya mirado: cada página y cada server action
// llama a haySesion/exigirSesion por su cuenta.
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { calcularBloqueo, mensajeBloqueo, VENTANA_MS, type Intento } from "./panel-bloqueo";
import { verificarClave } from "./panel-claves";
import { borrar, dbConfigurada, insertar, seleccionar } from "./panel-db";
import { DURACION_SESION_MS, NOMBRE_COOKIE, crearToken, hashearToken, ipDelPedido, normalizarUsuario, tokenConFormaValida } from "./panel-token";

const RUTA_COOKIE = "/panel";
export const RUTA_ENTRAR = "/panel/entrar";

export type UsuarioPanel = { id: number; usuario: string; nombre: string };

/** false si falta SUPABASE_URL o SUPABASE_SECRET_KEY: el panel entero queda apagado. */
export const panelActivo = () => dbConfigurada();

const registrar = (error: unknown) => console.error("[panel] auth", error instanceof Error ? error.message : error);

const buscarSesion = cache(async (): Promise<UsuarioPanel | null> => {
  // Siempre se leen las cookies, aunque el panel esté apagado: así ninguna página del panel se prerenderiza en el build.
  const token = (await cookies()).get(NOMBRE_COOKIE)?.value;
  if (!panelActivo() || !tokenConFormaValida(token)) return null;
  try {
    const filas = await seleccionar<{ vence_el: string; usuarios: { id: number; usuario: string; nombre: string; activo: boolean } | null }>("sesiones", {
      select: "vence_el,usuarios(id,usuario,nombre,activo)",
      token_hash: `eq.${hashearToken(token)}`,
    });
    const f = filas[0];
    if (!f?.usuarios?.activo || !(Date.parse(f.vence_el) > Date.now())) return null;
    return { id: f.usuarios.id, usuario: f.usuarios.usuario, nombre: f.usuarios.nombre };
  } catch (error) {
    registrar(error);
    return null;
  }
});

/** El usuario con sesión válida (existe, no venció, sigue activo), o null. */
export const haySesion = (): Promise<UsuarioPanel | null> => buscarSesion();

/** Para páginas: sin sesión, al login. */
export async function exigirSesion(): Promise<UsuarioPanel> {
  const usuario = await haySesion();
  if (!usuario) redirect(RUTA_ENTRAR);
  return usuario;
}

const CREDENCIALES_MALAS = "Usuario o contraseña incorrectos.";
const NO_DISPONIBLE = "No se pudo entrar ahora. Probá de nuevo en un rato.";
const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Intentos recientes de ese usuario (éxitos y fallos) y fallos recientes de esa IP. */
async function intentosRecientes(usuario: string, ip: string): Promise<Intento[]> {
  const desde = new Date(Date.now() - VENTANA_MS).toISOString();
  const campos = "id,usuario,ip,exito,creado_el";
  const [delUsuario, delaIp] = await Promise.all([
    seleccionar<Intento & { id: number }>("intentos", { select: campos, usuario: `eq.${usuario}`, creado_el: `gt.${desde}`, order: "creado_el.desc", limit: 200 }),
    seleccionar<Intento & { id: number }>("intentos", { select: campos, ip: `eq.${ip}`, exito: "eq.false", creado_el: `gt.${desde}`, order: "creado_el.desc", limit: 200 }),
  ]);
  // Un fallo de este usuario desde esta IP sale en las dos consultas: se cuenta una sola vez.
  return [...new Map([...delUsuario, ...delaIp].map((i) => [i.id, i])).values()];
}

/** Limpieza que no importa si falla: intentos de más de 30 días y sesiones vencidas. */
async function limpiar(): Promise<void> {
  const treintaDias = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const ahora = new Date().toISOString();
  await Promise.allSettled([borrar("intentos", { creado_el: `lt.${treintaDias}` }), borrar("sesiones", { vence_el: `lt.${ahora}` })]);
}

/**
 * Login: bloqueo → usuario y contraseña (scrypt aunque el usuario no exista) → se anota el intento → sesión.
 * Si la base falla en cualquier paso, no se entra (falla cerrado). Un intento rechazado por bloqueo no se anota,
 * así seguir insistiendo no alarga el bloqueo.
 */
export async function iniciarSesion(usuarioCrudo: string, clave: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!panelActivo()) return { ok: false, error: NO_DISPONIBLE };
  const usuario = normalizarUsuario(usuarioCrudo);
  const cabeceras = await headers();
  const ip = ipDelPedido((n) => cabeceras.get(n));

  try {
    const bloqueo = calcularBloqueo(await intentosRecientes(usuario, ip), usuario, ip, Date.now());
    if (bloqueo.bloqueado) return { ok: false, error: mensajeBloqueo(bloqueo.minutos) };

    const [fila] = await seleccionar<{ id: number; clave_hash: string; activo: boolean }>("usuarios", {
      select: "id,clave_hash,activo",
      usuario: `eq.${usuario}`,
    });
    const activo = fila?.activo === true;
    const correcta = await verificarClave(clave, activo ? fila.clave_hash : null);
    await insertar("intentos", { usuario, ip, exito: correcta });

    if (!correcta) {
      await espera(1000);
      return { ok: false, error: CREDENCIALES_MALAS };
    }

    const token = crearToken();
    await insertar("sesiones", { token_hash: hashearToken(token), usuario_id: fila.id, vence_el: new Date(Date.now() + DURACION_SESION_MS).toISOString() });
    (await cookies()).set(NOMBRE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: RUTA_COOKIE,
      maxAge: DURACION_SESION_MS / 1000,
    });
    await limpiar();
    return { ok: true };
  } catch (error) {
    registrar(error);
    return { ok: false, error: NO_DISPONIBLE };
  }
}

/** Borra la fila de la sesión (queda cerrada en el servidor, no solo en el navegador) y la cookie. */
export async function cerrarSesion(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(NOMBRE_COOKIE)?.value;
  if (panelActivo() && tokenConFormaValida(token)) {
    try {
      await borrar("sesiones", { token_hash: `eq.${hashearToken(token)}` });
    } catch (error) {
      registrar(error);
    }
  }
  jar.set(NOMBRE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: RUTA_COOKIE, maxAge: 0 });
}
