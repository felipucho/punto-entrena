// Cliente mínimo de Supabase (PostgREST) con fetch, sin dependencias. Solo corre en el servidor: usa la clave secreta
// (service_role), que se salta RLS. Los errores llevan el estado HTTP y nunca la clave ni el cuerpo de la respuesta.

const TIMEOUT_MS = 8000;

export class ErrorDb extends Error {
  constructor(
    mensaje: string,
    readonly estado: number,
  ) {
    super(mensaje);
  }
}

type Entorno = Record<string, string | undefined>;

function configuracion(env: Entorno = process.env): { url: string; clave: string } | null {
  const url = env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const clave = env.SUPABASE_SECRET_KEY?.trim();
  return url && clave ? { url, clave } : null;
}

/** El panel funciona solo con SUPABASE_URL y SUPABASE_SECRET_KEY: sin ellas queda apagado (falla cerrado). */
export const dbConfigurada = (env: Entorno = process.env) => configuracion(env) !== null;

export type Consulta = Record<string, string | number>;

async function pedir(metodo: "GET" | "POST" | "PATCH" | "DELETE", tabla: string, consulta: Consulta, init: { cuerpo?: unknown; prefer?: string } = {}): Promise<Response> {
  const cfg = configuracion();
  if (!cfg) throw new ErrorDb("Supabase no está configurado", 0);
  const params = new URLSearchParams(Object.entries(consulta).map(([k, v]) => [k, String(v)]));
  const ruta = `/rest/v1/${tabla}`;
  const cabeceras: Record<string, string> = { apikey: cfg.clave, Authorization: `Bearer ${cfg.clave}`, Accept: "application/json" };
  if (init.cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  if (init.prefer) cabeceras.Prefer = init.prefer;
  let respuesta: Response;
  try {
    respuesta = await fetch(`${cfg.url}${ruta}${params.size ? `?${params}` : ""}`, {
      method: metodo,
      headers: cabeceras,
      body: init.cuerpo === undefined ? undefined : JSON.stringify(init.cuerpo),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const motivo = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "no respondió a tiempo" : "no se pudo conectar";
    throw new ErrorDb(`Supabase ${motivo} en ${metodo} ${ruta}`, 0);
  }
  if (!respuesta.ok) throw new ErrorDb(`Supabase respondió ${respuesta.status} en ${metodo} ${ruta}`, respuesta.status);
  return respuesta;
}

/** GET /rest/v1/<tabla>?<consulta>. Los filtros van como en PostgREST: { usuario: "eq.mati", select: "id,nombre" }. */
export async function seleccionar<T>(tabla: string, consulta: Consulta = {}): Promise<T[]> {
  return (await (await pedir("GET", tabla, consulta)).json()) as T[];
}

/** POST de una fila (o varias). Sin devolver nada. */
export async function insertar(tabla: string, filas: object | object[]): Promise<void> {
  await pedir("POST", tabla, {}, { cuerpo: filas, prefer: "return=minimal" });
}

/** PATCH de las filas que cumplan los filtros (obligatorios, como en borrar). Devuelve cuántas cambió. */
export async function actualizar(tabla: string, filtros: Consulta, valores: object): Promise<number> {
  if (Object.keys(filtros).length === 0) throw new Error("actualizar sin filtros");
  const filas = (await (await pedir("PATCH", tabla, { ...filtros, select: "id" }, { cuerpo: valores, prefer: "return=representation" })).json()) as unknown[];
  return filas.length;
}

/** DELETE con filtros obligatorios: sin ninguno no hace nada, para no vaciar una tabla por un descuido. */
export async function borrar(tabla: string, filtros: Consulta): Promise<void> {
  if (Object.keys(filtros).length === 0) throw new Error("borrar sin filtros");
  await pedir("DELETE", tabla, filtros, { prefer: "return=minimal" });
}
