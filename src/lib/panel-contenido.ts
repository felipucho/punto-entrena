// Validación y nombres de lo que se edita en el panel. Todo se revisa acá, en el servidor: lo que llega del
// formulario es texto cualquiera. Sin dependencias de node, así se prueba suelto.
import { instanteDePublicacion } from "./novedades-fechas";
import { TAMANO_FOTO_POR_DEFECTO, TAMANOS_FOTO } from "./novedades-tamanos.mjs";
import type { TamanoFoto } from "./novedades-tamanos.mjs";

export const PRECIOS_RUTA = "content/precios.json";
export const CARPETA_NOVEDADES = "content/novedades";
export const CARPETA_FOTOS = "public/fotos/novedades";
export const NOMBRE_FOTO = "foto.webp";

/** El reloj del servidor. Las páginas lo piden por acá: las reglas de pureza de React no dejan llamar a Date.now() en un componente. */
export const ahora = () => Date.now();

export const MAX_TITULO = 120;
export const MAX_TEXTO = 5000;
// Un precio fuera de este rango es un error de tipeo (un cero de más o de menos), no un precio real.
export const MIN_PRECIO = 1_000;
export const MAX_PRECIO = 10_000_000;

const pesos = (n: number) => `$${n.toLocaleString("es-AR")}`;

export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

export type Precios = { unaVez: number; dosVeces: number; tresVeces: number; paseLibre: number; dia: number };

export const CAMPOS_PRECIOS: readonly { campo: keyof Precios; etiqueta: string }[] = [
  { campo: "unaVez", etiqueta: "1 vez por semana" },
  { campo: "dosVeces", etiqueta: "2 veces por semana" },
  { campo: "tresVeces", etiqueta: "3 veces por semana" },
  { campo: "paseLibre", etiqueta: "Pase libre" },
  { campo: "dia", etiqueta: "Día suelto" },
];

/** Lo que llega de un formulario o de un JSON a medio leer: cualquier cosa. */
type Entrada = Record<string, unknown>;

export function validarPrecios(entrada: Entrada): Resultado<Precios> {
  const valor = {} as Precios;
  for (const { campo, etiqueta } of CAMPOS_PRECIOS) {
    const crudo = entrada[campo];
    const texto = typeof crudo === "number" ? String(crudo) : typeof crudo === "string" ? crudo.trim() : "";
    if (!/^\d+$/.test(texto)) return { ok: false, error: `${etiqueta}: poné un número entero, sin puntos ni letras.` };
    const numero = Number(texto);
    if (numero < MIN_PRECIO) return { ok: false, error: `${etiqueta}: ${pesos(numero)} es muy poco. ¿Falta un cero? (mínimo ${pesos(MIN_PRECIO)})` };
    if (numero > MAX_PRECIO) return { ok: false, error: `${etiqueta}: ${pesos(numero)} es demasiado. ¿Sobra un cero? (máximo ${pesos(MAX_PRECIO)})` };
    valor[campo] = numero;
  }
  return { ok: true, valor };
}

export type DatosNovedad = { titulo: string; fecha: string; texto: string; tamano: TamanoFoto };

export function validarNovedad(entrada: Entrada): Resultado<DatosNovedad> {
  const titulo = typeof entrada.titulo === "string" ? entrada.titulo.trim() : "";
  if (titulo === "") return { ok: false, error: "Falta el título." };
  if ([...titulo].length > MAX_TITULO) return { ok: false, error: `El título es muy largo (máximo ${MAX_TITULO} letras).` };

  const fecha = typeof entrada.fecha === "string" ? entrada.fecha.trim() : "";
  if (Number.isNaN(instanteDePublicacion(fecha))) return { ok: false, error: "La fecha y la hora no son válidas." };

  const texto = typeof entrada.texto === "string" ? entrada.texto.replace(/\r\n/g, "\n").trim() : "";
  if (texto === "") return { ok: false, error: "Falta el texto." };
  if ([...texto].length > MAX_TEXTO) return { ok: false, error: `El texto es muy largo (máximo ${MAX_TEXTO} letras).` };

  const tamano = entrada.tamano === undefined || entrada.tamano === "" ? TAMANO_FOTO_POR_DEFECTO : entrada.tamano;
  const tamanoValido = TAMANOS_FOTO.find((t) => t === tamano);
  if (!tamanoValido) return { ok: false, error: "El tamaño de la foto no es válido." };

  return { ok: true, valor: { titulo, fecha, texto, tamano: tamanoValido } };
}

/** "Feriado del lunes" → "feriado-del-lunes". Sin tildes, solo a-z, 0-9 y guiones. */
export function generarSlug(titulo: string): string {
  const base = titulo
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base === "" ? "novedad" : base;
}

/** Nombres que chocarían con rutas del panel (/panel/novedad/nueva…). */
const RESERVADOS = new Set(["nueva"]);

/** Si `base` ya existe (o está reservado), agrega -2, -3… hasta encontrar uno libre. */
export function slugUnico(base: string, existentes: Iterable<string>): string {
  const usados = new Set(existentes);
  if (!usados.has(base) && !RESERVADOS.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidato = `${base}-${n}`;
    if (!usados.has(candidato)) return candidato;
  }
}

/**
 * Un slug que sirve de nombre de archivo y de carpeta. Es la defensa contra rutas armadas (../) en lo que llega del
 * formulario: toda ruta del repo que toca el panel se arma con un slug que pasó por acá.
 */
export function esSlugValido(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length <= 200 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/** Las únicas rutas del repo que el panel puede escribir o borrar. Última barrera si algo armara una ruta rara. */
export function rutaPermitida(ruta: string): boolean {
  return /^(content\/precios\.json|content\/novedades\/[a-z0-9]+(-[a-z0-9]+)*\.json|public\/fotos\/novedades\/[a-z0-9]+(-[a-z0-9]+)*\/[A-Za-z0-9_-][A-Za-z0-9._-]*)$/.test(
    ruta,
  );
}

export const rutaNovedad =(slug: string) => `${CARPETA_NOVEDADES}/${slug}.json`;
export const carpetaFoto = (slug: string) => `${CARPETA_FOTOS}/${slug}`;
export const rutaFoto = (slug: string) => `${carpetaFoto(slug)}/${NOMBRE_FOTO}`;
/** La ruta pública que guarda el JSON (lo que lee el sitio). */
export const fotoPublica = (slug: string) => `/${rutaFoto(slug).slice("public/".length)}`;

/** Contenido de content/novedades/<slug>.json: mismo orden de campos de siempre. */
export function jsonNovedad(datos: DatosNovedad, foto: string | null): string {
  return `${JSON.stringify({ titulo: datos.titulo, fecha: datos.fecha, texto: datos.texto, foto, tamano: datos.tamano }, null, 2)}\n`;
}

export function jsonPrecios(precios: Precios): string {
  const { unaVez, dosVeces, tresVeces, paseLibre, dia } = precios;
  return `${JSON.stringify({ unaVez, dosVeces, tresVeces, paseLibre, dia }, null, 2)}\n`;
}
