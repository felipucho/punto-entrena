// Dónde guarda el panel: en GitHub (producción, con GITHUB_TOKEN) o en el disco (solo `next dev`, para probar).
// Sin token y fuera de desarrollo no hay almacén: el panel avisa en vez de hacer como que guardó.
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { commitear, leerTextoGitHub, listarCarpetaGitHub, shaDeArchivoGitHub, shaGit, type Cambio } from "./panel-github";
import { rutaPermitida } from "./panel-contenido";

export type { Cambio };

/** Qué versión de un archivo había (sha del blob de Git), o null si no existía. */
export type Version = { ruta: string; sha: string | null };

/** Lo que hace falta para deshacer un guardado: cómo estaban los archivos antes y cómo quedaron. */
export type Huella = { antes: Version[]; despues: Version[] };

export interface Almacen {
  /** El texto de un archivo del repo, o null si no existe. */
  leerTexto(ruta: string): Promise<string | null>;
  /** Nombres de los archivos de una carpeta; [] si no existe. */
  listar(carpeta: string): Promise<string[]>;
  /** La versión actual de cada ruta. */
  versiones(rutas: readonly string[]): Promise<Version[]>;
  /** Aplica todos los cambios juntos (un commit en GitHub) y devuelve la huella para deshacerlos. */
  guardar(cambios: readonly Cambio[], mensaje: string): Promise<Huella>;
  readonly modo: "github" | "disco";
}

const shaDespues = (cambio: Cambio): string | null =>
  "borrar" in cambio ? null : "sha" in cambio ? cambio.sha : shaGit(cambio.contenido);

/** Los cambios que dejan cada archivo en la versión indicada. */
export const cambiosParaVolver = (versiones: readonly Version[]): Cambio[] =>
  versiones.map(({ ruta, sha }) => (sha === null ? { ruta, borrar: true } : { ruta, sha }));

/** Lee las versiones de antes, aplica y arma la huella. */
async function guardarConHuella(almacen: Pick<Almacen, "versiones">, cambios: readonly Cambio[], aplicar: () => Promise<void>): Promise<Huella> {
  exigirRutas(cambios);
  const antes = await almacen.versiones(cambios.map((c) => c.ruta));
  await aplicar();
  return { antes, despues: cambios.map((c) => ({ ruta: c.ruta, sha: shaDespues(c) })) };
}

export const MENSAJE_SIN_ALMACEN =
  "Falta configurar GITHUB_TOKEN en Vercel: sin él el panel no puede guardar. Avisale a quien se encarga del sitio.";

function exigirRutas(cambios: readonly Cambio[]) {
  for (const { ruta } of cambios) {
    if (!rutaPermitida(ruta)) throw new Error(`Ruta no permitida: ${ruta}`);
  }
}

export function almacenGitHub(token: string, fetchFn?: typeof fetch): Almacen {
  const opciones = { token, fetchFn };
  const almacen: Almacen = {
    modo: "github",
    leerTexto: (ruta) => leerTextoGitHub(opciones, ruta),
    listar: (carpeta) => listarCarpetaGitHub(opciones, carpeta),
    versiones: (rutas) => Promise.all(rutas.map(async (ruta) => ({ ruta, sha: await shaDeArchivoGitHub(opciones, ruta) }))),
    guardar: (cambios, mensaje) =>
      guardarConHuella(almacen, cambios, async () => {
        await commitear({ ...opciones, cambios, mensaje });
      }),
  };
  return almacen;
}

/**
 * En disco no hay Git: cada versión que se lee o se escribe se copia a <raiz>/.panel-versiones/<sha>, así un
 * cambio `{ sha }` (deshacer) tiene de dónde volver. Solo para probar en `next dev`.
 */
export function almacenDisco(raiz: string = process.cwd()): Almacen {
  const abs = (ruta: string) => path.join(raiz, ...ruta.split("/"));
  const copia = (sha: string) => path.join(raiz, ".panel-versiones", sha);
  async function guardarCopia(contenido: string | Uint8Array): Promise<string> {
    const sha = shaGit(contenido);
    await mkdir(path.dirname(copia(sha)), { recursive: true });
    await writeFile(copia(sha), contenido);
    return sha;
  }
  const almacen: Almacen = {
    modo: "disco",
    async versiones(rutas) {
      return Promise.all(
        rutas.map(async (ruta) => {
          try {
            return { ruta, sha: await guardarCopia(await readFile(abs(ruta))) };
          } catch (error) {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") return { ruta, sha: null };
            throw error;
          }
        }),
      );
    },
    async leerTexto(ruta) {
      try {
        return await readFile(abs(ruta), "utf8");
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
        throw error;
      }
    },
    async listar(carpeta) {
      try {
        return (await readdir(abs(carpeta), { withFileTypes: true })).filter((e) => e.isFile()).map((e) => e.name);
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
        throw error;
      }
    },
    guardar: (cambios) =>
      guardarConHuella(almacen, cambios, async () => {
        for (const cambio of cambios) {
          if ("borrar" in cambio) {
            await rm(abs(cambio.ruta), { force: true });
            // Una carpeta de foto que quedó vacía se va con ella (git tampoco guarda carpetas vacías).
            const carpeta = path.dirname(abs(cambio.ruta));
            if (carpeta.includes(path.join("fotos", "novedades") + path.sep) && (await readdir(carpeta).catch(() => ["x"])).length === 0) {
              await rm(carpeta, { recursive: true, force: true });
            }
          } else {
            await mkdir(path.dirname(abs(cambio.ruta)), { recursive: true });
            if ("sha" in cambio) await copyFile(copia(cambio.sha), abs(cambio.ruta));
            else await writeFile(abs(cambio.ruta), cambio.contenido);
          }
        }
      }),
  };
  return almacen;
}

/** El almacén que corresponde al entorno, o null si no hay ninguno (producción sin GITHUB_TOKEN). */
export function almacenDelEntorno(env: Record<string, string | undefined> = process.env): Almacen | null {
  const token = env.GITHUB_TOKEN?.trim();
  if (token) return almacenGitHub(token);
  // PANEL_DISCO_RAIZ (solo en desarrollo) apunta a otra carpeta, para probar sin tocar el contenido real.
  if (env.NODE_ENV === "development") return almacenDisco(env.PANEL_DISCO_RAIZ || undefined);
  return null;
}

export const MENSAJE_CAMBIO_PISADO =
  "No se puede deshacer: después de este cambio se volvió a tocar lo mismo. Deshacé primero los cambios más nuevos.";

/**
 * Vuelve los archivos de una huella a como estaban antes. Solo si siguen como quedaron: si alguien los cambió
 * después, deshacer pisaría ese cambio, así que tira Error con MENSAJE_CAMBIO_PISADO.
 */
export async function deshacerHuella(almacen: Almacen, huella: Huella, mensaje: string): Promise<Huella> {
  const actuales = await almacen.versiones(huella.despues.map((v) => v.ruta));
  if (actuales.some((v, i) => v.sha !== huella.despues[i].sha)) throw new Error(MENSAJE_CAMBIO_PISADO);
  return almacen.guardar(cambiosParaVolver(huella.antes), mensaje);
}
