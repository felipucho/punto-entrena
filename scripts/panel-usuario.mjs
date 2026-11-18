// Administra los usuarios del panel (/panel) en Supabase. Lee SUPABASE_URL y SUPABASE_SECRET_KEY de .env.local
// (el script de npm usa `node --env-file=.env.local`).
//
//   npm run panel:usuario -- <usuario> "<Nombre>"     crea el usuario o le cambia la contraseña
//   npm run panel:usuario -- --desactivar <usuario>   lo desactiva y cierra sus sesiones
//   npm run panel:usuario -- --lista                  usuario, nombre y si está activo
//
// La contraseña se pide dos veces sin mostrarla, o se lee de la entrada estándar (una línea) si no hay terminal.
// Nunca se imprime ni la contraseña ni su hash. Importa panel-claves.ts directo: hace falta Node 22.18 o más nuevo.
import { hashearClave, problemaConClave } from "../src/lib/panel-claves.ts";

const USO = `Uso:
  npm run panel:usuario -- <usuario> "<Nombre>"
  npm run panel:usuario -- --desactivar <usuario>
  npm run panel:usuario -- --lista`;

const REGEX_USUARIO = /^[a-z0-9._-]{3,32}$/;

function salir(mensaje, codigo = 1) {
  (codigo === 0 ? console.log : console.error)(mensaje);
  process.exit(codigo);
}

const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
const clave = process.env.SUPABASE_SECRET_KEY?.trim();
if (!url || !clave) salir("Faltan SUPABASE_URL y SUPABASE_SECRET_KEY en .env.local.");

async function db(metodo, tabla, consulta = {}, { cuerpo, prefer } = {}) {
  const params = new URLSearchParams(consulta);
  const r = await fetch(`${url}/rest/v1/${tabla}${params.size ? `?${params}` : ""}`, {
    method: metodo,
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      Accept: "application/json",
      ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status} en ${metodo} /${tabla}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

/** Lee una línea sin mostrarla (modo crudo de la terminal). */
function pedirOculto(pregunta) {
  return new Promise((resolver, rechazar) => {
    const entrada = process.stdin;
    process.stdout.write(pregunta);
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding("utf8");
    let texto = "";
    const alTecla = (tecla) => {
      for (const c of tecla) {
        if (c === "\u0003") {
          limpiar();
          process.stdout.write("\n");
          return rechazar(new Error("Cancelado."));
        }
        if (c === "\r" || c === "\n") {
          limpiar();
          process.stdout.write("\n");
          return resolver(texto);
        }
        if (c === "\u007f" || c === "\b") texto = texto.slice(0, -1);
        else if (c >= " ") texto += c;
      }
    };
    const limpiar = () => {
      entrada.off("data", alTecla);
      entrada.setRawMode(false);
      entrada.pause();
    };
    entrada.on("data", alTecla);
  });
}

async function leerDeEntradaEstandar() {
  const trozos = [];
  for await (const t of process.stdin) trozos.push(t);
  return Buffer.concat(trozos).toString("utf8").split(/\r?\n/)[0] ?? "";
}

async function pedirClave() {
  if (!process.stdin.isTTY) return leerDeEntradaEstandar();
  const a = await pedirOculto("Contraseña: ");
  const b = await pedirOculto("Repetila: ");
  if (a !== b) salir("Las contraseñas no coinciden.");
  return a;
}

function validarUsuario(usuario) {
  if (!usuario || !REGEX_USUARIO.test(usuario)) salir("El usuario debe tener 3 a 32 caracteres: minúsculas, números, punto, guion y guion bajo.");
}

const filtroUsuario = (usuario) => ({ usuario: `eq.${usuario}` });

async function principal(args) {
  if (args[0] === "--lista") {
    const filas = await db("GET", "usuarios", { select: "usuario,nombre,activo", order: "usuario" });
    if (!filas.length) return console.log("No hay usuarios.");
    for (const f of filas) console.log(`${f.usuario}\t${f.nombre}\t${f.activo ? "activo" : "desactivado"}`);
    return;
  }

  if (args[0] === "--desactivar") {
    const usuario = args[1]?.trim().toLowerCase();
    validarUsuario(usuario);
    const filas = await db("PATCH", "usuarios", { ...filtroUsuario(usuario), select: "id" }, { cuerpo: { activo: false }, prefer: "return=representation" });
    if (!filas?.length) salir(`No existe el usuario "${usuario}".`);
    await db("DELETE", "sesiones", { usuario_id: `eq.${filas[0].id}` });
    return console.log(`Usuario "${usuario}" desactivado y sus sesiones cerradas.`);
  }

  if (args.length !== 2 || args.some((a) => a.startsWith("--"))) salir(USO);
  const usuario = args[0].trim().toLowerCase();
  const nombre = args[1].trim();
  validarUsuario(usuario);
  if (nombre.length < 1 || nombre.length > 60) salir("El nombre debe tener entre 1 y 60 caracteres.");

  const contrasena = await pedirClave();
  const problema = problemaConClave(contrasena);
  if (problema) salir(problema);

  const clave_hash = await hashearClave(contrasena);
  const filas = await db(
    "POST",
    "usuarios",
    { on_conflict: "usuario", select: "id" },
    { cuerpo: { usuario, nombre, clave_hash, activo: true }, prefer: "resolution=merge-duplicates,return=representation" },
  );
  // La clave cambió (o es nueva): ninguna sesión abierta con la anterior debe seguir valiendo.
  await db("DELETE", "sesiones", { usuario_id: `eq.${filas[0].id}` });
  console.log(`Usuario "${usuario}" (${nombre}) guardado y activo. Sesiones anteriores cerradas.`);
}

principal(process.argv.slice(2)).catch((error) => salir(error instanceof Error ? error.message : "Error."));
