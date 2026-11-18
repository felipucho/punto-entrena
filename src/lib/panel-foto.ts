// La foto de una novedad en el servidor. El navegador ya la reduce (src/app/panel/reducir-foto.ts) para entrar en el
// límite de 4,5 MB de Vercel, pero acá no se confía en eso: se revisa que sea una imagen de verdad y se vuelve a
// codificar siempre.
import sharp from "sharp";
import type { Resultado } from "./panel-contenido";

export const MAX_BYTES_FOTO = 4 * 1024 * 1024;
export const LADO_MAXIMO_FOTO = 1600;
const CALIDAD_WEBP = 82;
/** Sin SVG ni PDF ni TIFF: solo fotos. */
const FORMATOS = new Set(["jpeg", "png", "webp", "avif", "heif", "gif"]);

/** Endereza según EXIF, achica a 1600 px de lado largo como máximo (sin agrandar), WebP calidad 82, sin metadatos. */
export async function procesarFoto(datos: Uint8Array): Promise<Resultado<Buffer>> {
  if (datos.byteLength === 0) return { ok: false, error: "La foto está vacía." };
  if (datos.byteLength > MAX_BYTES_FOTO) return { ok: false, error: "La foto pesa más de 4 MB. Probá con otra." };
  try {
    const entrada = sharp(datos, { limitInputPixels: 100_000_000 });
    const { format } = await entrada.metadata();
    if (!format || !FORMATOS.has(format)) return { ok: false, error: "Ese archivo no es una foto que podamos usar." };
    const salida = await entrada
      .rotate()
      .resize({ width: LADO_MAXIMO_FOTO, height: LADO_MAXIMO_FOTO, fit: "inside", withoutEnlargement: true })
      .webp({ quality: CALIDAD_WEBP })
      .toBuffer();
    return { ok: true, valor: salida };
  } catch {
    return { ok: false, error: "No se pudo leer la foto. Probá con otra." };
  }
}
