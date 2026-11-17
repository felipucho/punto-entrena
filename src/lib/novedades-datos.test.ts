import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { armarNovedades, leerNovedadesCrudas } from "./novedades-datos.mjs";

let raiz: string;
const verde = { r: 20, g: 200, b: 40 };

async function json(nombre: string, datos: unknown) {
  await writeFile(path.join(raiz, "content", "novedades", `${nombre}.json`), JSON.stringify(datos));
}
async function foto(rel: string, buf: Buffer) {
  const destino = path.join(raiz, "public", rel);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, buf);
}
const img = (w: number, h: number, fondo = verde) => sharp({ create: { width: w, height: h, channels: 3, background: fondo } });

beforeAll(async () => {
  raiz = await mkdtemp(path.join(os.tmpdir(), "novedades-datos-"));
  await mkdir(path.join(raiz, "content", "novedades"), { recursive: true });

  await foto("fotos/novedades/a/normal.jpg", await img(300, 200).jpeg().toBuffer());
  await foto("fotos/novedades/a/exif6.jpg", await img(300, 200, { r: 200, g: 20, b: 20 }).jpeg().withMetadata({ orientation: 6 }).toBuffer());
  await foto("fotos/novedades/a/exif3.jpg", await img(300, 200).jpeg().withMetadata({ orientation: 3 }).toBuffer());
  await foto("fotos/novedades/a/exif8.jpg", await img(300, 200).jpeg().withMetadata({ orientation: 8 }).toBuffer());
  await foto("fotos/novedades/a/iphone.heic", Buffer.from("x"));
  await foto("fotos/novedades/a/rota.jpg", Buffer.from("no es jpg"));

  await json("1-normal", { fecha: "2026-11-20T10:00", titulo: "Normal", texto: "t", foto: "/fotos/novedades/a/normal.jpg", tamano: "grande" });
  await json("2-exif6", { fecha: "2026-11-21T10:00", titulo: "E6", texto: "t", foto: "/fotos/novedades/a/exif6.jpg", tamano: "chica" });
  await json("3-exif3", { fecha: "2026-11-22T10:00", titulo: "E3", texto: "t", foto: "/fotos/novedades/a/exif3.jpg" });
  await json("4-exif8", { fecha: "2026-11-23T10:00", titulo: "E8", texto: "t", foto: "/fotos/novedades/a/exif8.jpg" });
  await json("5-heic", { fecha: "2026-11-24T10:00", titulo: "H", texto: "t", foto: "/fotos/novedades/a/iphone.heic" });
  await json("6-rota", { fecha: "2026-11-25T10:00", titulo: "R", texto: "t", foto: "/fotos/novedades/a/rota.jpg" });
  await json("7-falta", { fecha: "2026-11-26T10:00", titulo: "F", texto: "t", foto: "/fotos/novedades/a/no-existe.jpg" });
  await json("8-fuera", { fecha: "2026-11-27T10:00", titulo: "Z", texto: "t", foto: "/fotos/novedades/../../../secreto.jpg" });
  await json("9-sin-foto", { fecha: "2026-11-28T10:00", titulo: "S", texto: "t", foto: "", tamano: "gigante" });
  await writeFile(path.join(raiz, "content", "novedades", "nota.txt"), "ignorar");
});

afterAll(async () => {
  await rm(raiz, { recursive: true, force: true });
});

describe("leerNovedadesCrudas", () => {
  it("lee solo .json, ordenado por nombre, con el slug sin extension", async () => {
    const crudas = await leerNovedadesCrudas(raiz);
    expect(crudas.map((c) => c.slug)).toEqual(["1-normal", "2-exif6", "3-exif3", "4-exif8", "5-heic", "6-rota", "7-falta", "8-fuera", "9-sin-foto"]);
  });

  it("foto vacia -> null, tamano ausente -> null", async () => {
    const crudas = await leerNovedadesCrudas(raiz);
    expect(crudas[8].foto).toBeNull();
    expect(crudas[2].tamano).toBeNull();
    expect(crudas[0].tamano).toBe("grande");
  });

  it("sin carpeta content/novedades devuelve []", async () => {
    const vacia = await mkdtemp(path.join(os.tmpdir(), "novedades-vacia-"));
    try {
      expect(await leerNovedadesCrudas(vacia)).toEqual([]);
    } finally {
      await rm(vacia, { recursive: true, force: true });
    }
  });

  it("un JSON corrupto hace fallar la lectura (no se traga el error)", async () => {
    const mala = await mkdtemp(path.join(os.tmpdir(), "novedades-mala-"));
    try {
      await mkdir(path.join(mala, "content", "novedades"), { recursive: true });
      await writeFile(path.join(mala, "content", "novedades", "x.json"), "{ no es json");
      await expect(leerNovedadesCrudas(mala)).rejects.toThrow();
    } finally {
      await rm(mala, { recursive: true, force: true });
    }
  });
});

describe("armarNovedades", () => {
  let nov: Awaited<ReturnType<typeof armarNovedades>>;
  beforeAll(async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    nov = await armarNovedades(raiz);
  });

  it("sin EXIF mantiene ancho/alto", () => {
    expect(nov[0].foto).toMatchObject({ ancho: 300, alto: 200 });
  });

  it("EXIF 6 y 8 intercambian ancho y alto; EXIF 3 no", () => {
    expect(nov[1].foto).toMatchObject({ ancho: 200, alto: 300 });
    expect(nov[3].foto).toMatchObject({ ancho: 200, alto: 300 });
    expect(nov[2].foto).toMatchObject({ ancho: 300, alto: 200 });
  });

  it("src lleva ?v=<8 hex> y cambia con el contenido del archivo", () => {
    expect(nov[0].foto!.src).toMatch(/^\/fotos\/novedades\/a\/normal\.jpg\?v=[0-9a-f]{8}$/);
    expect(nov[0].foto!.src.split("?v=")[1]).not.toBe(nov[1].foto!.src.split("?v=")[1]);
  });

  it("el hash es estable entre corridas", async () => {
    const otra = await armarNovedades(raiz);
    expect(otra[0].foto!.src).toBe(nov[0].foto!.src);
  });

  it("HEIC, JPG rota, archivo faltante y ruta con .. se omiten sin romper la novedad", () => {
    for (const i of [4, 5, 6, 7]) {
      expect(nov[i].foto).toBeUndefined();
      expect(nov[i].titulo).not.toBe("");
    }
    expect(console.warn).toHaveBeenCalled();
  });

  it("tamano: valido se respeta; ausente o invalido -> mediana", () => {
    expect(nov[0].tamano).toBe("grande");
    expect(nov[1].tamano).toBe("chica");
    expect(nov[2].tamano).toBe("mediana");
    expect(nov[8].tamano).toBe("mediana");
  });

  it("novedad sin foto no trae la clave foto", () => {
    expect("foto" in nov[8]).toBe(false);
  });
});
