// Lo que hace el panel con el contenido: leer y escribir precios y novedades sobre un Almacén (GitHub o disco).
// Mantiene el formato de siempre: content/precios.json y content/novedades/<slug>.json (+ la foto) que lee el sitio.
import type { Almacen, Cambio, Huella } from "./panel-almacen";
import {
  CARPETA_NOVEDADES,
  NOMBRE_FOTO,
  PRECIOS_RUTA,
  carpetaFoto,
  esSlugValido,
  fotoPublica,
  generarSlug,
  jsonNovedad,
  jsonPrecios,
  rutaFoto,
  rutaNovedad,
  slugUnico,
  validarPrecios,
  type DatosNovedad,
  type Precios,
} from "./panel-contenido";
import { TAMANOS_FOTO, TAMANO_FOTO_POR_DEFECTO } from "./novedades-tamanos.mjs";
import type { TamanoFoto } from "./novedades-tamanos.mjs";

export type NovedadGuardada = {
  slug: string;
  titulo: string;
  fecha: string;
  texto: string;
  /** Ruta pública de la foto ("/fotos/novedades/<slug>/foto.webp"), o null. */
  foto: string | null;
  tamano: TamanoFoto;
};

export async function leerPrecios(almacen: Almacen): Promise<Precios | null> {
  const texto = await almacen.leerTexto(PRECIOS_RUTA);
  if (texto === null) return null;
  try {
    const r = validarPrecios(JSON.parse(texto));
    return r.ok ? r.valor : null;
  } catch {
    return null;
  }
}

/** "Panel (Mati)" si se sabe quién guardó, si no "Panel": el prefijo de cada commit. */
const origen = (quien?: string | null) => {
  const nombre = quien?.replace(/\s+/g, " ").trim();
  return nombre ? `Panel (${nombre})` : "Panel";
};

export async function guardarPrecios(almacen: Almacen, precios: Precios, quien?: string | null): Promise<Huella> {
  return almacen.guardar([{ ruta: PRECIOS_RUTA, contenido: jsonPrecios(precios) }], `${origen(quien)}: actualizar precios`);
}

/** Lee un JSON de novedad tolerando campos que falten (las más viejas no traen foto ni tamaño). */
function interpretar(slug: string, texto: string): NovedadGuardada | null {
  try {
    const d = JSON.parse(texto) as Record<string, unknown>;
    return {
      slug,
      titulo: typeof d.titulo === "string" ? d.titulo : "",
      fecha: typeof d.fecha === "string" ? d.fecha : "",
      texto: typeof d.texto === "string" ? d.texto : "",
      foto: typeof d.foto === "string" && d.foto !== "" ? d.foto : null,
      tamano: TAMANOS_FOTO.find((t) => t === d.tamano) ?? TAMANO_FOTO_POR_DEFECTO,
    };
  } catch {
    return null;
  }
}

async function slugsExistentes(almacen: Almacen): Promise<string[]> {
  return (await almacen.listar(CARPETA_NOVEDADES)).filter((n) => n.endsWith(".json")).map((n) => n.slice(0, -".json".length));
}

export async function leerNovedad(almacen: Almacen, slug: string): Promise<NovedadGuardada | null> {
  if (!esSlugValido(slug)) return null;
  const texto = await almacen.leerTexto(rutaNovedad(slug));
  return texto === null ? null : interpretar(slug, texto);
}

/** Todas, la más nueva primero. Una que no se pueda leer se salta. */
export async function listarNovedades(almacen: Almacen): Promise<NovedadGuardada[]> {
  const slugs = (await slugsExistentes(almacen)).filter(esSlugValido);
  const todas = await Promise.all(slugs.map((slug) => leerNovedad(almacen, slug)));
  return todas.filter((n): n is NovedadGuardada => n !== null).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export type EntradaGuardarNovedad = {
  /** El slug de la novedad que se edita, o null si es nueva. */
  slug: string | null;
  datos: DatosNovedad;
  /** Foto nueva, ya procesada (WebP), o null para no tocarla. */
  foto: Uint8Array | null;
  quitarFoto: boolean;
  /** Quién guarda (nombre), para el mensaje del commit. */
  quien?: string | null;
};

export type ResultadoGuardar = { slug: string; foto: string | null; nueva: boolean; huella: Huella };

/** Guarda una novedad (JSON + foto en el mismo commit). Tira Error con un mensaje para mostrar si no se puede. */
export async function guardarNovedad(almacen: Almacen, entrada: EntradaGuardarNovedad): Promise<ResultadoGuardar> {
  const { datos, foto, quitarFoto } = entrada;
  let slug: string;
  let fotoActual: string | null = null;
  const nueva = entrada.slug === null;

  if (entrada.slug === null) {
    slug = slugUnico(generarSlug(datos.titulo), await slugsExistentes(almacen));
  } else {
    if (!esSlugValido(entrada.slug)) throw new Error("La novedad no existe.");
    const existente = await leerNovedad(almacen, entrada.slug);
    if (!existente) throw new Error("Esa novedad ya no existe (¿la borraron?). Volvé a la lista.");
    slug = entrada.slug;
    fotoActual = existente.foto;
  }

  const cambios: Cambio[] = [];
  let fotoFinal = fotoActual;
  if (foto !== null || quitarFoto) {
    // Otras fotos de la carpeta (por ejemplo un foto.png de antes) se van; foto.webp se pisa si hay una nueva.
    const archivos = await almacen.listar(carpetaFoto(slug));
    for (const nombre of archivos) {
      if (foto !== null && nombre === NOMBRE_FOTO) continue;
      cambios.push({ ruta: `${carpetaFoto(slug)}/${nombre}`, borrar: true });
    }
  }
  if (foto !== null) {
    cambios.push({ ruta: rutaFoto(slug), contenido: foto });
    fotoFinal = fotoPublica(slug);
  } else if (quitarFoto) {
    fotoFinal = null;
  }
  cambios.push({ ruta: rutaNovedad(slug), contenido: jsonNovedad(datos, fotoFinal) });

  const huella = await almacen.guardar(cambios, `${origen(entrada.quien)}: ${nueva ? "nueva" : "editar"} novedad «${datos.titulo}»`);
  return { slug, foto: fotoFinal, nueva, huella };
}

/** Borra el JSON y toda la carpeta de la foto en un solo commit. */
export async function borrarNovedad(almacen: Almacen, slug: string, quien?: string | null): Promise<{ titulo: string; huella: Huella }> {
  if (!esSlugValido(slug)) throw new Error("La novedad no existe.");
  const existente = await leerNovedad(almacen, slug);
  if (!existente) throw new Error("Esa novedad ya no existe.");
  const fotos = await almacen.listar(carpetaFoto(slug));
  const cambios: Cambio[] = [
    { ruta: rutaNovedad(slug), borrar: true },
    ...fotos.map((nombre): Cambio => ({ ruta: `${carpetaFoto(slug)}/${nombre}`, borrar: true })),
  ];
  const huella = await almacen.guardar(cambios, `${origen(quien)}: borrar novedad «${existente.titulo}»`);
  return { titulo: existente.titulo, huella };
}
