"use server";

// Server actions del panel. Cada una verifica la sesión por su cuenta (haySesion): llamar a una acción
// sin cookie válida no hace nada, aunque se invoque directo sin pasar por una página.
import { redirect } from "next/navigation";
import { cerrarSesion, haySesion, iniciarSesion, RUTA_ENTRAR } from "@/lib/panel-auth";
import { MENSAJE_CAMBIO_PISADO, MENSAJE_SIN_ALMACEN, almacenDelEntorno, deshacerHuella } from "@/lib/panel-almacen";
import { esSlugValido, validarNovedad, validarPrecios } from "@/lib/panel-contenido";
import { procesarFoto, MAX_BYTES_FOTO } from "@/lib/panel-foto";
import { ErrorGitHub } from "@/lib/panel-github";
import { queSeDeshizo, registrarCambio, soltarDeshacer, tomarParaDeshacer } from "@/lib/panel-historial";
import { borrarNovedad, guardarNovedad, guardarPrecios } from "@/lib/panel-novedades";
import { avisoEnCola, fechaArgentina } from "@/lib/novedades-fechas";

export type Respuesta =
  | { ok: true; mensaje: string; slug?: string; foto?: string | null }
  | { ok: false; error: string };

export type EstadoEntrar = { error: string; usuario?: string } | null;

const SESION_VENCIDA: Respuesta = { ok: false, error: "Tu sesión venció. Recargá la página y volvé a entrar." };

const AVISO_DEPLOY = "Guardado. Aparece en la página en 1 o 2 minutos.";

function textoDeError(error: unknown): string {
  if (error instanceof ErrorGitHub) {
    console.error("[panel]", error.message);
    if (error.estado === 401 || error.estado === 403) {
      return "GitHub no aceptó el permiso (la clave de acceso venció o le falta permiso). Avisale a quien se encarga del sitio.";
    }
    return "No se pudo guardar: GitHub no respondió bien. Probá de nuevo en un rato.";
  }
  if (error instanceof Error && (/^(Esa novedad|La novedad)/.test(error.message) || error.message === MENSAJE_CAMBIO_PISADO)) return error.message;
  console.error("[panel]", error instanceof Error ? error.message : error);
  return "No se pudo guardar. Probá de nuevo en un rato.";
}

/** Login: sin sesión previa. Si usuario y contraseña son correctos, abre la sesión y va al panel. */
export async function entrar(_anterior: EstadoEntrar, formData: FormData): Promise<EstadoEntrar> {
  const usuario = formData.get("usuario");
  const clave = formData.get("clave");
  if (typeof usuario !== "string" || usuario.trim() === "") return { error: "Escribí el usuario." };
  if (typeof clave !== "string" || clave === "") return { error: "Escribí la contraseña." };
  // Más largo que cualquier dato real: se corta acá, antes de gastar scrypt.
  if (usuario.length > 200 || clave.length > 500) return { error: "Usuario o contraseña incorrectos.", usuario: usuario.slice(0, 64) };
  const r = await iniciarSesion(usuario, clave);
  // React vacía el formulario al terminar la acción: el usuario vuelve en el estado para no tener que escribirlo de nuevo.
  if (!r.ok) return { error: r.error, usuario };
  redirect("/panel");
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect(RUTA_ENTRAR);
}

export async function guardarPreciosAccion(formData: FormData): Promise<Respuesta> {
  const quien = await haySesion();
  if (!quien) return SESION_VENCIDA;
  const almacen = almacenDelEntorno();
  if (!almacen) return { ok: false, error: MENSAJE_SIN_ALMACEN };
  const r = validarPrecios(Object.fromEntries(formData));
  if (!r.ok) return r;
  try {
    const huella = await guardarPrecios(almacen, r.valor, quien.nombre);
    await registrarCambio(quien.id, "precios", null, huella);
    return { ok: true, mensaje: AVISO_DEPLOY };
  } catch (error) {
    return { ok: false, error: textoDeError(error) };
  }
}

export async function guardarNovedadAccion(formData: FormData): Promise<Respuesta> {
  const quien = await haySesion();
  if (!quien) return SESION_VENCIDA;
  const almacen = almacenDelEntorno();
  if (!almacen) return { ok: false, error: MENSAJE_SIN_ALMACEN };

  const slugCrudo = formData.get("slug");
  const slug = slugCrudo === null || slugCrudo === "" ? null : slugCrudo;
  if (slug !== null && !esSlugValido(slug)) return { ok: false, error: "La novedad no existe." };

  // "Publicar ahora": la hora la pone el servidor, no el reloj del celular.
  const campos = Object.fromEntries(formData);
  if (formData.get("publicarAhora") === "1") campos.fecha = fechaArgentina(Date.now());
  const r = validarNovedad(campos);
  if (!r.ok) return r;

  let foto: Uint8Array | null = null;
  const archivo = formData.get("foto");
  if (archivo instanceof File && archivo.size > 0) {
    if (archivo.size > MAX_BYTES_FOTO) return { ok: false, error: "La foto pesa más de 4 MB. Probá con otra." };
    const procesada = await procesarFoto(new Uint8Array(await archivo.arrayBuffer()));
    if (!procesada.ok) return procesada;
    foto = procesada.valor;
  }

  try {
    const g = await guardarNovedad(almacen, { slug, datos: r.valor, foto, quitarFoto: formData.get("quitarFoto") === "1", quien: quien.nombre });
    await registrarCambio(quien.id, g.nueva ? "novedad_crear" : "novedad_editar", r.valor.titulo, g.huella);
    const enCola = avisoEnCola(r.valor.fecha, Date.now());
    return { ok: true, mensaje: enCola ? `Guardado. ${enCola}` : AVISO_DEPLOY, slug: g.slug, foto: g.foto };
  } catch (error) {
    return { ok: false, error: textoDeError(error) };
  }
}

export async function borrarNovedadAccion(slug: string): Promise<Respuesta> {
  const quien = await haySesion();
  if (!quien) return SESION_VENCIDA;
  const almacen = almacenDelEntorno();
  if (!almacen) return { ok: false, error: MENSAJE_SIN_ALMACEN };
  try {
    const { titulo, huella } = await borrarNovedad(almacen, slug, quien.nombre);
    await registrarCambio(quien.id, "novedad_borrar", titulo, huella);
    return { ok: true, mensaje: "Borrada. Desaparece de la página en 1 o 2 minutos." };
  } catch (error) {
    return { ok: false, error: textoDeError(error) };
  }
}

/** Deshace un cambio de "Últimos cambios": vuelve sus archivos a como estaban, en un commit nuevo. */
export async function deshacerAccion(id: number): Promise<Respuesta> {
  const quien = await haySesion();
  if (!quien) return SESION_VENCIDA;
  if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, error: "Ese cambio no existe." };
  const almacen = almacenDelEntorno();
  if (!almacen) return { ok: false, error: MENSAJE_SIN_ALMACEN };

  let cambio;
  try {
    cambio = await tomarParaDeshacer(id);
  } catch (error) {
    return { ok: false, error: textoDeError(error) };
  }
  if (!cambio) return { ok: false, error: "Ese cambio ya se deshizo o no se puede deshacer. Recargá la página." };

  const que = queSeDeshizo(cambio.accion, cambio.detalle);
  try {
    const nombre = quien.nombre.replace(/s+/g, " ").trim();
    await deshacerHuella(almacen, cambio.huella, `Panel (${nombre}): deshacer ${que}`);
  } catch (error) {
    await soltarDeshacer(id);
    return { ok: false, error: textoDeError(error) };
  }
  await registrarCambio(quien.id, "deshacer", que);
  return { ok: true, mensaje: "Deshecho. La página vuelve a como estaba en 1 o 2 minutos." };
}
