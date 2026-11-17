import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createReader } from "@keystatic/core/reader";
import sharp from "sharp";
import config from "../../keystatic.config";

export type FotoNovedad = {
  /** Ruta bajo public/ con ?v=<hash del archivo>: si se reemplaza la foto, cambia la URL y se salta la caché. */
  src: string;
  ancho: number;
  alto: number;
};

export type Novedad = {
  /** YYYY-MM-DD */
  fecha: string;
  titulo: string;
  /** Texto plano; los párrafos se separan con una línea en blanco. */
  texto: string;
  /** Ausente si la novedad no tiene foto o si no se pudo leer (ver fotoDeNovedad). */
  foto?: FotoNovedad;
};

/** Una entrada de content/novedades/ tal como la guarda Keystatic. */
export type NovedadCruda = {
  slug: string;
  fecha: string;
  titulo: string;
  texto: string;
  /** "/fotos/novedades/<slug>/foto.jpg", o null si no tiene. */
  foto: string | null;
};

/** Formatos que sharp lee y next/image sirve. Un HEIC del iPhone queda afuera. */
export const EXTENSIONES_FOTO = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const fechaLarga = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" });

/**
 * "2026-11-15" → "15 de noviembre de 2026".
 * Se arma con Date.UTC y se formatea en UTC: new Date("2026-11-15") también es UTC pero formatearlo en la zona local
 * (Argentina, UTC-3) mostraría el 14.
 */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return fechaLarga.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

/** Más nuevas primero. YYYY-MM-DD ordena bien como texto. */
export function ordenarNovedades<T extends { fecha: string }>(lista: readonly T[]): T[] {
  return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Las entradas de content/novedades/, sin tocar las fotos. Keystatic valida el formato; el test revisa los datos. */
export async function leerNovedades(): Promise<NovedadCruda[]> {
  const lector = createReader(process.cwd(), config);
  const entradas = await lector.collections.novedades.all();
  return entradas.map(({ slug, entry }) => ({
    slug,
    fecha: entry.fecha,
    titulo: entry.titulo,
    texto: entry.texto,
    foto: entry.foto,
  }));
}

/**
 * Tamaño real y hash de la foto, o undefined (con un aviso en el build) si no se puede usar: extensión que no sirve,
 * archivo que falta o que sharp no decodifica. La novedad se muestra igual, sin foto.
 */
async function fotoDeNovedad(slug: string, ruta: string): Promise<FotoNovedad | undefined> {
  try {
    if (!ruta.startsWith("/fotos/novedades/") || ruta.includes("..")) throw new Error("ruta fuera de public/fotos/novedades");
    if (!EXTENSIONES_FOTO.includes(path.extname(ruta).toLowerCase())) {
      throw new Error(`formato no soportado, usar ${EXTENSIONES_FOTO.join(", ")}`);
    }
    const archivo = await readFile(path.join(process.cwd(), "public", ruta));
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

/** Las novedades de content/novedades/, la más reciente primero. */
export async function novedades(): Promise<Novedad[]> {
  const crudas = await leerNovedades();
  const lista = await Promise.all(
    crudas.map(async ({ slug, fecha, titulo, texto, foto }) => ({
      fecha,
      titulo,
      texto,
      foto: foto === null ? undefined : await fotoDeNovedad(slug, foto),
    })),
  );
  return ordenarNovedades(lista);
}
