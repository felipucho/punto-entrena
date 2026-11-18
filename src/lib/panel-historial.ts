// Historial de cambios del panel (tabla `historial`): quién cambió qué y cuándo.
import { fechaArgentina } from "./novedades-fechas";
import type { Huella } from "./panel-almacen";
import { actualizar, insertar, seleccionar } from "./panel-db";

export const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export type AccionHistorial = "precios" | "novedad_crear" | "novedad_editar" | "novedad_borrar" | "deshacer";

export type EntradaHistorial = {
  id: number;
  accion: string;
  detalle: string | null;
  creado_el: string;
  nombre: string | null;
  /** Tiene huella y todavía no se deshizo. Si los archivos cambiaron después, lo dice recién al intentarlo. */
  deshacible: boolean;
};

/** Anota un cambio. Si falla, solo se loguea: el guardado ya se hizo y no hay que mostrarle un error a quien guardó. */
export async function registrarCambio(usuarioId: number, accion: AccionHistorial, detalle: string | null = null, huella: Huella | null = null): Promise<void> {
  // Si el guardado no cambió nada (mismo contenido), no hay nada que deshacer.
  const util = huella && huella.antes.some((a, i) => a.sha !== huella.despues[i]?.sha) ? huella : null;
  try {
    await insertar("historial", { usuario_id: usuarioId, accion, detalle: detalle?.slice(0, 200) ?? null, huella: util });
  } catch (error) {
    console.error("[panel] historial", error instanceof Error ? error.message : error);
  }
}

/** Los últimos cambios, el más nuevo primero. Si la base falla devuelve [] (la sección simplemente no aparece). */
export async function ultimosCambios(cantidad = 10): Promise<EntradaHistorial[]> {
  try {
    const filas = await seleccionar<{
      id: number;
      accion: string;
      detalle: string | null;
      creado_el: string;
      con_huella: boolean;
      deshecho_el: string | null;
      usuarios: { nombre: string } | null;
    }>("historial", {
      // con_huella: solo si hay huella, sin traer el JSON entero.
      select: "id,accion,detalle,creado_el,deshecho_el,con_huella:huella->antes,usuarios(nombre)",
      order: "creado_el.desc",
      limit: cantidad,
    });
    return filas.map((f) => ({
      id: f.id,
      accion: f.accion,
      detalle: f.detalle,
      creado_el: f.creado_el,
      nombre: f.usuarios?.nombre ?? null,
      deshacible: Boolean(f.con_huella) && f.deshecho_el === null && f.accion !== "deshacer",
    }));
  } catch (error) {
    console.error("[panel] historial", error instanceof Error ? error.message : error);
    return [];
  }
}

/** "Mati cambió los precios", "Mati creó la novedad «X»". Sin nombre (usuario borrado): "Alguien". */
export function describirCambio({ accion, detalle, nombre }: Pick<EntradaHistorial, "accion" | "detalle" | "nombre">): string {
  const quien = nombre ?? "Alguien";
  const titulo = detalle ? ` «${detalle}»` : "";
  switch (accion) {
    case "precios":
      return `${quien} cambió los precios`;
    case "novedad_crear":
      return `${quien} creó la novedad${titulo}`;
    case "novedad_editar":
      return `${quien} editó la novedad${titulo}`;
    case "novedad_borrar":
      return `${quien} borró la novedad${titulo}`;
    case "deshacer":
      return `${quien} deshizo ${detalle ?? "un cambio"}`;
    default:
      return `${quien} hizo un cambio`;
  }
}

/** Instante ISO de la base → "17 nov, 10:32" en hora de Argentina. */
export function formatearMomento(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const f = fechaArgentina(t); // "2026-11-17T10:32"
  return `${Number(f.slice(8, 10))} ${MESES_CORTOS[Number(f.slice(5, 7)) - 1]}, ${f.slice(11, 16)}`;
}

/** Cómo se nombra lo deshecho: "Mati deshizo el cambio de precios". */
export function queSeDeshizo(accion: string, detalle: string | null): string {
  const titulo = detalle ? ` de «${detalle}»` : " de una novedad";
  switch (accion) {
    case "precios":
      return "el cambio de precios";
    case "novedad_crear":
      return `la creación${titulo}`;
    case "novedad_editar":
      return `la edición${titulo}`;
    case "novedad_borrar":
      return `el borrado${titulo}`;
    default:
      return "un cambio";
  }
}

const SHA = /^[0-9a-f]{40}$/;

/** Valida lo que vuelve de la base antes de usarlo para escribir archivos. */
export function esHuella(valor: unknown): valor is Huella {
  const versiones = (v: unknown) =>
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((x) => typeof x === "object" && x !== null && typeof x.ruta === "string" && (x.sha === null || (typeof x.sha === "string" && SHA.test(x.sha))));
  if (typeof valor !== "object" || valor === null) return false;
  const { antes, despues } = valor as Record<string, unknown>;
  return versiones(antes) && versiones(despues) && (antes as unknown[]).length === (despues as unknown[]).length;
}

export type CambioParaDeshacer = { id: number; accion: string; detalle: string | null; huella: Huella };

/**
 * Toma el cambio para deshacerlo: lo marca como deshecho solo si nadie lo marcó antes (dos clics, dos personas).
 * null si no existe, ya se deshizo o no se puede deshacer.
 */
export async function tomarParaDeshacer(id: number): Promise<CambioParaDeshacer | null> {
  const [fila] = await seleccionar<{ id: number; accion: string; detalle: string | null; huella: unknown; deshecho_el: string | null }>("historial", {
    id: `eq.${id}`,
    select: "id,accion,detalle,huella,deshecho_el",
  });
  if (!fila || fila.deshecho_el !== null || fila.accion === "deshacer" || !esHuella(fila.huella)) return null;
  const tomadas = await actualizar("historial", { id: `eq.${id}`, deshecho_el: "is.null" }, { deshecho_el: new Date().toISOString() });
  return tomadas === 1 ? { id: fila.id, accion: fila.accion, detalle: fila.detalle, huella: fila.huella } : null;
}

/** Si el deshacer falló, el cambio vuelve a quedar disponible. */
export async function soltarDeshacer(id: number): Promise<void> {
  try {
    await actualizar("historial", { id: `eq.${id}` }, { deshecho_el: null });
  } catch (error) {
    console.error("[panel] historial", error instanceof Error ? error.message : error);
  }
}
