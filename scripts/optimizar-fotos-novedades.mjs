// Aligera las fotos de public/fotos/novedades/ y deja a todas como WebP: orientación EXIF aplicada, lado largo de
// 1600 px como máximo (nunca agranda), sin metadatos. Actualiza el "foto" de content/novedades/*.json si cambia la
// extensión. Es idempotente: una foto que ya cumple no se toca. Corre en GitHub Actions (.github/workflows/sync-fork.yml)
// después de cada guardado en /keystatic, así nadie tiene que preparar las fotos a mano.
//
// Uso: node scripts/optimizar-fotos-novedades.mjs [carpeta-raiz]   (por defecto, la raíz del repo)
// Nunca falla por una foto: lo que sharp no puede leer (un HEIC del iPhone, por ejemplo) se avisa y queda como está.
import { readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const LADO_MAX = 1600;
const PESO_MAX = 600 * 1024;
const CALIDADES = [82, 72, 62, 52];
const EXTENSIONES = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".heif", ".gif", ".tif", ".tiff", ".bmp"]);

const EXTENSIONES_SITIO = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const raiz = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const carpetaFotos = path.join(raiz, "public", "fotos", "novedades");
const carpetaContenido = path.join(raiz, "content", "novedades");

/** Todos los archivos bajo `dir`, recursivo. Una carpeta que no existe no es un error. */
async function listar(dir) {
  let entradas;
  try {
    entradas = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const archivos = await Promise.all(
    entradas.map((e) => (e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name)])),
  );
  return archivos.flat();
}

/** WebP con el lado largo en `lado` como máximo; baja la calidad y después el tamaño hasta entrar en PESO_MAX. */
async function codificar(original, ladoInicial) {
  let lado = ladoInicial;
  let salida;
  for (let intento = 0; intento < 4; intento++) {
    for (const calidad of CALIDADES) {
      salida = await sharp(original)
        .rotate()
        .resize({ width: lado, height: lado, fit: "inside", withoutEnlargement: true })
        .webp({ quality: calidad })
        .toBuffer({ resolveWithObject: true });
      if (salida.data.length <= PESO_MAX) return salida;
    }
    lado = Math.round(lado * 0.85);
  }
  return salida;
}

/** Cambia `foto` en los JSON que apuntaban al archivo viejo, sin reformatear el resto del JSON. */
async function actualizarReferencias(rutaVieja, rutaNueva) {
  let nombres = [];
  try {
    nombres = (await readdir(carpetaContenido)).filter((n) => n.endsWith(".json"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const viejo = JSON.stringify(rutaVieja);
  for (const nombre of nombres) {
    const archivo = path.join(carpetaContenido, nombre);
    const texto = await readFile(archivo, "utf8");
    if (texto.includes(viejo)) {
      await writeFile(archivo, texto.split(viejo).join(JSON.stringify(rutaNueva)));
      console.log(`  ${nombre}: foto -> ${rutaNueva}`);
    }
  }
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let cambiadas = 0;

for (const archivo of (await listar(carpetaFotos)).sort()) {
  const ext = path.extname(archivo).toLowerCase();
  if (!EXTENSIONES.has(ext)) continue;
  const relativa = path.relative(raiz, archivo).split(path.sep).join("/");
  try {
    const original = await readFile(archivo);
    const { width = 0, height = 0, orientation = 1 } = await sharp(original).metadata();
    if (!width || !height) throw new Error("sin dimensiones");

    if (ext === ".webp" && orientation === 1 && Math.max(width, height) <= LADO_MAX && original.length <= PESO_MAX) continue;

    const { data, info } = await codificar(original, LADO_MAX);
    // Ya liviana y en un formato que el sitio sirve: pasarla a WebP solo la engordaría y le sumaría una recompresión.
    const yaLiviana = EXTENSIONES_SITIO.has(ext) && orientation === 1 && Math.max(width, height) <= LADO_MAX && original.length <= PESO_MAX;
    if (yaLiviana && data.length >= original.length) continue;
    const destino = path.join(path.dirname(archivo), `${path.basename(archivo, path.extname(archivo))}.webp`);
    // Se escribe a un temporal y se renombra: si algo se corta, no queda un archivo a medias.
    const temporal = `${destino}.tmp`;
    await writeFile(temporal, data);
    await rename(temporal, destino);
    if (destino !== archivo) await unlink(archivo);

    console.log(`${relativa}: ${width}x${height} ${kb(original.length)} -> ${info.width}x${info.height} ${kb(data.length)} (${path.basename(destino)})`);
    if (destino !== archivo) {
      const publica = (p) => `/${path.relative(path.join(raiz, "public"), p).split(path.sep).join("/")}`;
      await actualizarReferencias(publica(archivo), publica(destino));
    }
    cambiadas++;
  } catch (error) {
    console.warn(`::warning::No se pudo optimizar ${relativa}, queda como está (${error instanceof Error ? error.message : error})`);
  }
}

console.log(cambiadas === 0 ? "Fotos de novedades: nada para optimizar." : `Fotos de novedades: ${cambiadas} optimizada(s).`);
