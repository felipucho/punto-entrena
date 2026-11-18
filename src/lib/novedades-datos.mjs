// Lee content/novedades/ y mide las fotos. Corre en el build (scripts/generar-novedades.mjs), no en el servidor:
// las fotos pueden pesar varios MB cada una y no tienen que ir dentro de la función de Vercel. Es .mjs para que
// node lo ejecute tal cual, sin compilar.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { TAMANOS_FOTO, TAMANO_FOTO_POR_DEFECTO } from "./novedades-tamanos.mjs";

export { TAMANOS_FOTO, TAMANO_FOTO_POR_DEFECTO };

/**
 * @typedef {{ src: string, ancho: number, alto: number }} FotoNovedad
 * `src` es la ruta bajo public/ con ?v=<hash del archivo>: si se reemplaza la foto, cambia la URL y se salta la caché.
 */

/**
 * @typedef {{ slug: string, fecha: string, titulo: string, texto: string, foto: string | null, tamano: string | null }} NovedadCruda
 * Una entrada de content/novedades/ tal como la guarda el panel. `fecha` es "YYYY-MM-DDTHH:mm", sin zona horaria.
 * `foto` es "/fotos/novedades/<slug>/foto.jpg", o null si no tiene. `tamano` es null si el archivo no lo trae.
 */

/**
 * @typedef {import("./novedades-tamanos.mjs").TamanoFoto} TamanoFoto
 */

/**
 * @typedef {{ fecha: string, titulo: string, texto: string, foto?: FotoNovedad, tamano: TamanoFoto }} Novedad
 * `foto` falta si la novedad no tiene o si no se pudo leer (ver fotoDeNovedad).
 */

/** Formatos que sharp lee y next/image sirve. Un HEIC del iPhone queda afuera. */
export const EXTENSIONES_FOTO = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * Las entradas de content/novedades/*.json, sin tocar las fotos. el panel valida al guardar; el test revisa los datos.
 * @param {string} [raiz]
 * @returns {Promise<NovedadCruda[]>}
 */
export async function leerNovedadesCrudas(raiz = process.cwd()) {
  const carpeta = path.join(raiz, "content", "novedades");
  /** @type {string[]} */
  let archivos;
  try {
    archivos = (await readdir(carpeta)).filter((nombre) => nombre.endsWith(".json")).sort();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
  return Promise.all(
    archivos.map(async (nombre) => {
      const datos = JSON.parse(await readFile(path.join(carpeta, nombre), "utf8"));
      return {
        slug: nombre.slice(0, -".json".length),
        fecha: String(datos.fecha ?? ""),
        titulo: String(datos.titulo ?? ""),
        texto: String(datos.texto ?? ""),
        foto: typeof datos.foto === "string" && datos.foto !== "" ? datos.foto : null,
        tamano: typeof datos.tamano === "string" ? datos.tamano : null,
      };
    }),
  );
}

/**
 * Tamaño real y hash de la foto, o undefined (con un aviso en el build) si no se puede usar: extensión que no sirve,
 * archivo que falta o que sharp no decodifica. La novedad se muestra igual, sin foto.
 * @param {string} slug
 * @param {string} ruta
 * @param {string} raiz
 * @returns {Promise<FotoNovedad | undefined>}
 */
async function fotoDeNovedad(slug, ruta, raiz) {
  try {
    if (!ruta.startsWith("/fotos/novedades/") || ruta.includes("..")) throw new Error("ruta fuera de public/fotos/novedades");
    if (!EXTENSIONES_FOTO.includes(path.extname(ruta).toLowerCase())) {
      throw new Error(`formato no soportado, usar ${EXTENSIONES_FOTO.join(", ")}`);
    }
    const archivo = await readFile(path.join(raiz, "public", ruta));
    const { width, height, orientation = 1 } = await sharp(archivo).metadata();
    if (!width || !height) throw new Error("sin dimensiones");
    // EXIF 5 a 8: el celular guardó la foto girada 90°; next/image la endereza, así que ancho y alto se intercambian.
    const girada = orientation >= 5;
    const hash = createHash("sha1").update(archivo).digest("hex").slice(0, 8);
    return { src: `${ruta}?v=${hash}`, ancho: girada ? height : width, alto: girada ? width : height };
  } catch (error) {
    console.warn(`[novedades] "${slug}": se omite la foto ${ruta} (${error instanceof Error ? error.message : error})`);
    return undefined;
  }
}

/**
 * Todas las novedades de content/novedades/, también las que todavía no se publican (el filtro por fecha lo hace
 * src/lib/novedades.ts al renderizar). Sin ordenar.
 * @param {string} [raiz]
 * @returns {Promise<Novedad[]>}
 */
export async function armarNovedades(raiz = process.cwd()) {
  const crudas = await leerNovedadesCrudas(raiz);
  return Promise.all(
    crudas.map(async ({ slug, fecha, titulo, texto, foto, tamano }) => {
      /** @type {Novedad} */
      const novedad = {
        fecha,
        titulo,
        texto,
        // Un valor que no es de la lista (el test lo marca) se muestra como el de siempre.
        tamano: TAMANOS_FOTO.find((t) => t === tamano) ?? TAMANO_FOTO_POR_DEFECTO,
      };
      if (foto !== null) {
        const medida = await fotoDeNovedad(slug, foto, raiz);
        if (medida) novedad.foto = medida;
      }
      return novedad;
    }),
  );
}
