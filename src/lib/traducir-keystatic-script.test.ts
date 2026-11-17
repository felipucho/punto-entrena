import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
// @ts-expect-error modulo .mjs sin tipos
import { TRADUCCIONES } from "../../scripts/traducir-keystatic.mjs";

const correr = promisify(execFile);
const REAL = path.resolve(__dirname, "../..");
const dist = path.join(REAL, "node_modules", "@keystatic", "core", "dist");
const hayKeystatic = existsSync(dist);

let tmp: string;
let distCopia: string;

async function leerDist() {
  const out: Record<string, string> = {};
  for (const n of (await readdir(distCopia)).filter((x) => x.endsWith(".js")).sort()) out[n] = await readFile(path.join(distCopia, n), "utf8");
  return out;
}
const ejecutar = async () => await correr(process.execPath, [path.join(tmp, "scripts", "traducir-keystatic.mjs")], { timeout: 60_000 });

describe.skipIf(!hayKeystatic)("scripts/traducir-keystatic.mjs sobre una copia temporal", () => {
  let revertidos = 0;

  beforeAll(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), "traducir-"));
    await mkdir(path.join(tmp, "scripts"), { recursive: true });
    await cp(path.join(REAL, "scripts", "traducir-keystatic.mjs"), path.join(tmp, "scripts", "traducir-keystatic.mjs"));
    const core = path.join(tmp, "node_modules", "@keystatic", "core");
    distCopia = path.join(core, "dist");
    await mkdir(distCopia, { recursive: true });
    await cp(path.join(dist, "..", "package.json"), path.join(core, "package.json"));
    for (const n of (await readdir(dist)).filter((x) => x.endsWith(".js"))) await cp(path.join(dist, n), path.join(distCopia, n));

    // Simula una instalacion limpia: devuelve al ingles hasta 5 textos simples que estan traducidos.
    const archivos = await leerDist();
    for (const [ingles, espanol] of TRADUCCIONES as [string, string][]) {
      if (revertidos >= 5 || ingles.includes("\n") || ingles === espanol) continue;
      for (const [n, texto] of Object.entries(archivos)) {
        if (texto.includes(espanol) && !texto.includes(ingles)) {
          archivos[n] = texto.replaceAll(espanol, () => ingles);
          await writeFile(path.join(distCopia, n), archivos[n]);
          revertidos++;
          break;
        }
      }
    }
  }, 60_000);

  afterAll(async () => {
    if (tmp) await rm(tmp, { recursive: true, force: true });
  });

  it("la copia quedo con textos en ingles para traducir", () => {
    expect(revertidos).toBeGreaterThan(0);
  });

  it("la primera corrida traduce y la segunda no cambia ningun archivo", async () => {
    const antes = await leerDist();
    const { stdout: out1 } = await ejecutar();
    const tras1 = await leerDist();
    expect(tras1).not.toEqual(antes);
    expect(out1).toMatch(/[1-9]\d* textos traducidos/);
    const { stdout: out2 } = await ejecutar();
    expect(out2).toContain("0 textos traducidos");
    expect(await leerDist()).toEqual(tras1);
  }, 60_000);

  it("no avisa de textos faltantes", async () => {
    const { stderr } = await ejecutar();
    expect(stderr).not.toContain("no se encontraron");
  });
});
