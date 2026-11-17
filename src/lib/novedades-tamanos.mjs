// Tamaños de la foto de una novedad. Módulo suelto, sin dependencias de node: lo importan el sitio, el panel y los scripts.

/**
 * @typedef {"chica" | "mediana" | "grande"} TamanoFoto
 * Cuánto de la columna ocupa la foto (ver ArticuloNovedad). Es el campo `tamano` del panel (keystatic.config.ts).
 */

/** @type {readonly TamanoFoto[]} */
export const TAMANOS_FOTO = ["chica", "mediana", "grande"];

/** @type {TamanoFoto} Lo que se usa cuando una novedad no trae `tamano` (las cargadas antes de que existiera el campo). */
export const TAMANO_FOTO_POR_DEFECTO = "mediana";
