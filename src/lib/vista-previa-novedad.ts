import type { TamanoFoto } from "./novedades-tamanos.mjs";

/*
 * Mensajes entre el panel (/keystatic) y su vista previa de una novedad (iframe en /vista-previa-novedad).
 * Mismo origen: ambos lados chequean `event.origin`.
 */

/** Panel → iframe: lo que hay en el formulario ahora. */
export const MENSAJE_VALORES = "punto:vista-previa:valores";
/** Iframe → panel: ya escucha, mandá los valores. */
export const MENSAJE_LISTA = "punto:vista-previa:lista";
/** Iframe → panel: alto del contenido en px. */
export const MENSAJE_ALTO = "punto:vista-previa:alto";

export type ValoresVistaPrevia = {
  /** "YYYY-MM-DDTHH:mm" (hora de Argentina), o null si el campo está vacío. */
  fecha: string | null;
  titulo: string;
  texto: string;
  tamano: TamanoFoto;
  /** blob: de la foto subida o ruta pública de la ya guardada; null si no hay. */
  fotoSrc: string | null;
};
