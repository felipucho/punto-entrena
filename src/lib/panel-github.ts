// Guardar en GitHub con la API REST de Git Data: blobs → árbol → commit → mover la rama. Así el JSON y la foto de una
// novedad entran en UN solo commit (un solo deploy). `fetchFn` se inyecta para probarlo sin red.
import { createHash } from "node:crypto";

export const REPO = "felipucho/punto-entrena";
export const RAMA = "master";
const API = "https://api.github.com";

/**
 * Escribir (o reemplazar) un archivo, volver a una versión que ya estuvo en el repo (`sha` del blob), o borrarlo.
 * Las rutas son del repo, sin "/" inicial.
 */
export type Cambio = { ruta: string; contenido: string | Uint8Array } | { ruta: string; sha: string } | { ruta: string; borrar: true };

/** El sha que Git (y GitHub) le da a un archivo con este contenido. */
export function shaGit(contenido: string | Uint8Array): string {
  const bytes = typeof contenido === "string" ? Buffer.from(contenido, "utf8") : Buffer.from(contenido);
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

type Fetch = typeof fetch;

export type OpcionesGitHub = {
  token: string;
  repo?: string;
  rama?: string;
  fetchFn?: Fetch;
};

export class ErrorGitHub extends Error {
  constructor(
    mensaje: string,
    readonly estado: number,
  ) {
    super(mensaje);
  }
}

function cliente({ token, repo = REPO, fetchFn = fetch }: OpcionesGitHub) {
  const base = `${API}/repos/${repo}`;
  const cabeceras = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "punto-panel",
  };

  async function pedir(url: string, init: RequestInit = {}, aceptar: readonly number[] = []): Promise<Response> {
    const respuesta = await fetchFn(url, {
      ...init,
      headers: { ...cabeceras, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
      cache: "no-store",
    });
    if (!respuesta.ok && !aceptar.includes(respuesta.status)) {
      throw new ErrorGitHub(`GitHub respondió ${respuesta.status} en ${init.method ?? "GET"} ${url.replace(API, "")}`, respuesta.status);
    }
    return respuesta;
  }

  return {
    base,
    pedir,
    async json<T>(ruta: string, init?: RequestInit): Promise<T> {
      return (await pedir(`${base}${ruta}`, init)).json() as Promise<T>;
    },
  };
}

/** Los dos datos que GitHub pide para atribuir un commit. Con el correo noreply del dueño del token, GitHub lo asocia a su cuenta. */
async function autorDelCommit(opciones: OpcionesGitHub) {
  const nombre = "Panel de Punto";
  try {
    const { pedir } = cliente(opciones);
    const usuario = (await (await pedir(`${API}/user`)).json()) as { id?: number; login?: string };
    if (usuario.id && usuario.login) return { name: nombre, email: `${usuario.id}+${usuario.login}@users.noreply.github.com` };
  } catch {
    // Sin /user el commit sale igual, con un correo propio.
  }
  return { name: nombre, email: "panel@puntoentrena.com" };
}

/**
 * Un commit con todos los `cambios` sobre la rama. Si la rama avanzó mientras tanto (422/409 al mover la referencia),
 * vuelve a leer la punta y lo arma de nuevo una vez más. Devuelve el sha del commit.
 */
export async function commitear(opciones: OpcionesGitHub & { cambios: readonly Cambio[]; mensaje: string }): Promise<string> {
  const { cambios, mensaje, rama = RAMA } = opciones;
  if (cambios.length === 0) throw new Error("No hay nada que guardar.");
  const { json } = cliente(opciones);
  const autor = await autorDelCommit(opciones);

  // Los blobs no dependen de la punta de la rama: se crean una vez y sirven para el reintento.
  const entradas = await Promise.all(
    cambios.map(async (cambio) => {
      if ("borrar" in cambio) return { path: cambio.ruta, mode: "100644", type: "blob", sha: null };
      if ("sha" in cambio) return { path: cambio.ruta, mode: "100644", type: "blob", sha: cambio.sha };
      const contenido = typeof cambio.contenido === "string" ? Buffer.from(cambio.contenido, "utf8") : Buffer.from(cambio.contenido);
      const blob = await json<{ sha: string }>("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: contenido.toString("base64"), encoding: "base64" }),
      });
      return { path: cambio.ruta, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );

  for (let intento = 0; ; intento++) {
    const punta = (await json<{ object: { sha: string } }>(`/git/ref/heads/${rama}`)).object.sha;
    const padre = await json<{ tree: { sha: string } }>(`/git/commits/${punta}`);
    const arbol = await json<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: padre.tree.sha, tree: entradas }),
    });
    const commit = await json<{ sha: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({ message: mensaje, tree: arbol.sha, parents: [punta], author: { ...autor, date: new Date().toISOString() } }),
    });
    try {
      await json(`/git/refs/heads/${rama}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
      return commit.sha;
    } catch (error) {
      const choque = error instanceof ErrorGitHub && (error.estado === 422 || error.estado === 409);
      if (!choque || intento >= 1) throw error;
    }
  }
}

/** El texto de un archivo del repo en la rama, o null si no existe. */
export async function leerTextoGitHub(opciones: OpcionesGitHub, ruta: string): Promise<string | null> {
  const { pedir, base } = cliente(opciones);
  const respuesta = await pedir(`${base}/contents/${ruta}?ref=${encodeURIComponent(opciones.rama ?? RAMA)}`, {
    headers: { Accept: "application/vnd.github.raw+json" },
  }, [404]);
  return respuesta.status === 404 ? null : respuesta.text();
}

/** Los archivos (no subcarpetas) de una carpeta del repo, o [] si no existe. */
export async function listarCarpetaGitHub(opciones: OpcionesGitHub, ruta: string): Promise<string[]> {
  const { pedir, base } = cliente(opciones);
  const respuesta = await pedir(`${base}/contents/${ruta}?ref=${encodeURIComponent(opciones.rama ?? RAMA)}`, {}, [404]);
  if (respuesta.status === 404) return [];
  const lista = (await respuesta.json()) as { name: string; type: string }[];
  return Array.isArray(lista) ? lista.filter((e) => e.type === "file").map((e) => e.name) : [];
}

/** El sha del blob de un archivo en la rama, o null si no existe. */
export async function shaDeArchivoGitHub(opciones: OpcionesGitHub, ruta: string): Promise<string | null> {
  const { pedir, base } = cliente(opciones);
  const respuesta = await pedir(`${base}/contents/${ruta}?ref=${encodeURIComponent(opciones.rama ?? RAMA)}`, {}, [404]);
  if (respuesta.status === 404) return null;
  const { sha } = (await respuesta.json()) as { sha?: unknown };
  if (typeof sha !== "string") throw new ErrorGitHub(`GitHub no devolvió el sha de ${ruta}`, 500);
  return sha;
}
