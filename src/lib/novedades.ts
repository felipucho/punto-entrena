import { estaPublicada } from "./novedades-fechas";
import type { Novedad } from "./novedades-datos.mjs";

export type { FotoNovedad, Novedad, NovedadCruda } from "./novedades-datos.mjs";
export { EXTENSIONES_FOTO } from "./novedades-datos.mjs";
export { TAMANOS_FOTO, TAMANO_FOTO_POR_DEFECTO, type TamanoFoto } from "./novedades-tamanos.mjs";
export * from "./novedades-fechas";

/** Más nuevas primero. "YYYY-MM-DDTHH:mm" ordena bien como texto. */
export function ordenarNovedades<T extends { fecha: string }>(lista: readonly T[]): T[] {
  return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Solo las que ya llegaron a su hora, la más reciente primero. */
export function publicadas<T extends { fecha: string }>(lista: readonly T[], ahora: number): T[] {
  return ordenarNovedades(lista.filter(({ fecha }) => estaPublicada(fecha, ahora)));
}

/**
 * Las novedades ya publicadas, la más reciente primero. Las que están en cola no salen de acá: ni su texto ni su foto
 * llegan al HTML.
 *
 * En producción lee src/data/novedades.generada.json (lo arma scripts/generar-novedades.mjs en el build, con el tamaño
 * de cada foto) y queda dentro de la función que regenera la página en Vercel. En desarrollo lee content/novedades/
 * en el momento, así lo que se guarda en el panel local aparece al recargar.
 */
export async function novedades(ahora: number = Date.now()): Promise<Novedad[]> {
  const todas: Novedad[] =
    process.env.NODE_ENV === "development"
      ? await (await import("./novedades-datos.mjs")).armarNovedades()
      : ((await import("@/data/novedades.generada.json")).default as Novedad[]);
  return publicadas(todas, ahora);
}
