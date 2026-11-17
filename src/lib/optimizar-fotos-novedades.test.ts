import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const correr = promisify(execFile);
const SCRIPT = path.resolve(__dirname, "../../scripts/optimizar-fotos-novedades.mjs");

let raiz: string;
let fotos: string;
let contenido: string;

async function ejecutar() {
  const { stdout } = await correr(process.execPath, [SCRIPT, raiz], { timeout: 60_000 });
  return stdout;
}

async function snapshot() {
  const out: Record<string, string> = {};
  for (const dir of [fotos, contenido]) {
    for (const n of (await readdir(dir)).sort()) out[`${path.basename(dir)}/${n}`] = (await readFile(path.join(dir, n))).toString("base64");
  }
  return out;
}

beforeAll(async () => {
  raiz = await mkdtemp(path.join(os.tmpdir(), "optimizar-fotos-"));
  fotos = path.join(raiz, "public", "fotos", "novedades");
  contenido = path.join(raiz, "content", "novedades");
  await mkdir(fotos, { recursive: true });
  await mkdir(contenido, { recursive: true });

  const rojo = { r: 220, g: 30, b: 30 };
  const lienzo = (w: number, h: number) => sharp({ create: { width: w, height: h, channels: 3, background: rojo } });
  await lienzo(3000, 2000).jpeg().toFile(path.join(fotos, "grande.jpg"));
  await lienzo(100, 100).png().toFile(path.join(fotos, "chica.png"));
  // Guardada 800x400 con EXIF 6 (girar 90 grados): se ve 400x800.
  await lienzo(800, 400).jpeg().withMetadata({ orientation: 6 }).toFile(path.join(fotos, "girada.jpg"));
  await writeFile(path.join(fotos, "iphone.heic"), Buffer.from("no es una imagen de verdad"));
  await writeFile(
    path.join(contenido, "una.json"),
    JSON.stringify({ titulo: "x", foto: "/fotos/novedades/grande.jpg", otra: "/fotos/novedades/girada.jpg" }, null, 2) + "\n",
  );
});

afterAll(async () => {
  await rm(raiz, { recursive: true, force: true });
});

describe("scripts/optimizar-fotos-novedades.mjs", () => {
  let salida1 = "";

  beforeAll(async () => {
    salida1 = await ejecutar();
  }, 60_000);

  it("la JPG grande queda en WebP con lado largo 1600 y sin ser gris", async () => {
    const nombres = await readdir(fotos);
    expect(nombres).toContain("grande.webp");
    expect(nombres).not.toContain("grande.jpg");
    const buf = await readFile(path.join(fotos, "grande.webp"));
    const meta = await sharp(buf).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1600);
    expect(meta.height).toBe(1067);
    expect(meta.channels).toBeGreaterThanOrEqual(3);
    const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(data[0]).toBeGreaterThan(data[1] + 80); // rojo, no gris
  });

  it("la PNG chica no se agranda", async () => {
    const nombres = await readdir(fotos);
    const archivo = nombres.find((n) => n.startsWith("chica."))!;
    const meta = await sharp(await readFile(path.join(fotos, archivo))).metadata();
    expect(meta.width).toBeLessThanOrEqual(100);
    expect(meta.height).toBeLessThanOrEqual(100);
    expect(meta.channels).toBeGreaterThanOrEqual(3);
  });

  it("aplica la orientación EXIF y no agranda (800x400 con EXIF 6 -> 400x800)", async () => {
    const meta = await sharp(await readFile(path.join(fotos, "girada.webp"))).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(400);
    expect(meta.height).toBe(800);
    expect(meta.orientation ?? 1).toBe(1);
  });

  it("deja el HEIC intacto", async () => {
    expect((await readFile(path.join(fotos, "iphone.heic"))).toString()).toBe("no es una imagen de verdad");
    expect(await readdir(fotos)).not.toContain("iphone.webp");
  });

  it("actualiza las rutas en content/novedades/*.json sin reformatear", async () => {
    const texto = await readFile(path.join(contenido, "una.json"), "utf8");
    expect(texto).toContain('"foto": "/fotos/novedades/grande.webp"');
    expect(texto).toContain('"otra": "/fotos/novedades/girada.webp"');
    expect(texto.endsWith("\n")).toBe(true);
    expect(salida1).toContain("optimizada(s)");
  });

  it("no deja temporales", async () => {
    expect((await readdir(fotos)).filter((n) => n.endsWith(".tmp"))).toEqual([]);
  });

  it("la segunda corrida no cambia nada", async () => {
    const antes = await snapshot();
    const salida2 = await ejecutar();
    expect(salida2).toContain("nada para optimizar");
    expect(await snapshot()).toEqual(antes);
  }, 60_000);

  it("una raiz sin carpeta de fotos no es un error", async () => {
    const vacia = await mkdtemp(path.join(os.tmpdir(), "optimizar-vacia-"));
    try {
      const { stdout } = await correr(process.execPath, [SCRIPT, vacia]);
      expect(stdout).toContain("nada para optimizar");
    } finally {
      await rm(vacia, { recursive: true, force: true });
    }
  });
});
