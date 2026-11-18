import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MENSAJE_CAMBIO_PISADO, almacenDelEntorno, almacenDisco, deshacerHuella } from "./panel-almacen";
import { shaGit } from "./panel-github";
import { MAX_BYTES_FOTO, procesarFoto } from "./panel-foto";
import { borrarNovedad, guardarNovedad, leerNovedad, leerPrecios, listarNovedades, guardarPrecios } from "./panel-novedades";

let raiz: string;
beforeEach(async () => {
  raiz = await mkdtemp(path.join(os.tmpdir(), "panel-"));
});
afterEach(() => rm(raiz, { recursive: true, force: true }));

const datos = { titulo: "Feriado del lunes", fecha: "2026-11-23T09:00", texto: "El lunes abrimos de 9 a 13.", tamano: "chica" as const };
const archivos = (carpeta: string) => readdir(path.join(raiz, carpeta)).catch(() => [] as string[]);
const leer = (ruta: string) => readFile(path.join(raiz, ...ruta.split("/")), "utf8");

describe("novedades sobre el disco", () => {
  it("crea JSON + foto y elige un slug libre (-2 si el título se repite)", async () => {
    const almacen = almacenDisco(raiz);
    const foto = new Uint8Array([1, 2, 3]);
    const a = await guardarNovedad(almacen, { slug: null, datos, foto, quitarFoto: false });
    const b = await guardarNovedad(almacen, { slug: null, datos, foto: null, quitarFoto: false });
    expect(a.slug).toBe("feriado-del-lunes");
    expect(b.slug).toBe("feriado-del-lunes-2");
    expect(JSON.parse(await leer("content/novedades/feriado-del-lunes.json"))).toEqual({
      ...datos,
      foto: "/fotos/novedades/feriado-del-lunes/foto.webp",
    });
    expect(JSON.parse(await leer("content/novedades/feriado-del-lunes-2.json")).foto).toBeNull();
    expect(await archivos("public/fotos/novedades/feriado-del-lunes")).toEqual(["foto.webp"]);
  });

  it("editar conserva el slug aunque cambie el título, y no toca la foto si no se pide", async () => {
    const almacen = almacenDisco(raiz);
    const { slug } = await guardarNovedad(almacen, { slug: null, datos, foto: new Uint8Array([1]), quitarFoto: false });
    const r = await guardarNovedad(almacen, { slug, datos: { ...datos, titulo: "Otro título" }, foto: null, quitarFoto: false });
    expect(r.slug).toBe("feriado-del-lunes");
    expect(r.nueva).toBe(false);
    expect((await leerNovedad(almacen, slug))?.foto).toBe("/fotos/novedades/feriado-del-lunes/foto.webp");
    expect((await leerNovedad(almacen, slug))?.titulo).toBe("Otro título");
  });

  it("una foto nueva reemplaza a la vieja (también la de otra extensión) y quitarla borra la carpeta", async () => {
    const almacen = almacenDisco(raiz);
    await mkdir(path.join(raiz, "content/novedades"), { recursive: true });
    await mkdir(path.join(raiz, "public/fotos/novedades/viejo"), { recursive: true });
    await writeFile(path.join(raiz, "public/fotos/novedades/viejo/foto.png"), "png");
    await writeFile(
      path.join(raiz, "content/novedades/viejo.json"),
      JSON.stringify({ titulo: "Viejo", fecha: "2026-11-01T09:00", texto: "t", foto: "/fotos/novedades/viejo/foto.png", tamano: "grande" }),
    );

    await guardarNovedad(almacen, { slug: "viejo", datos: { ...datos, titulo: "Viejo", tamano: "grande" }, foto: new Uint8Array([7]), quitarFoto: false });
    expect(await archivos("public/fotos/novedades/viejo")).toEqual(["foto.webp"]);
    expect((await leerNovedad(almacen, "viejo"))?.foto).toBe("/fotos/novedades/viejo/foto.webp");

    await guardarNovedad(almacen, { slug: "viejo", datos: { ...datos, titulo: "Viejo" }, foto: null, quitarFoto: true });
    expect(await archivos("public/fotos/novedades/viejo")).toEqual([]);
    expect((await leerNovedad(almacen, "viejo"))?.foto).toBeNull();
  });

  it("borrar saca el JSON y la carpeta de la foto", async () => {
    const almacen = almacenDisco(raiz);
    const { slug } = await guardarNovedad(almacen, { slug: null, datos, foto: new Uint8Array([1]), quitarFoto: false });
    await borrarNovedad(almacen, slug);
    expect(await archivos("content/novedades")).toEqual([]);
    expect(await archivos("public/fotos/novedades")).toEqual([]);
    await expect(borrarNovedad(almacen, slug)).rejects.toThrow(/ya no existe/);
  });

  it("editar o borrar con un slug raro o inexistente falla sin escribir nada", async () => {
    const almacen = almacenDisco(raiz);
    for (const slug of ["../precios", "a/b", "no-existe"]) {
      await expect(guardarNovedad(almacen, { slug, datos, foto: null, quitarFoto: false })).rejects.toThrow();
      await expect(borrarNovedad(almacen, slug)).rejects.toThrow();
    }
    expect(await archivos("content")).toEqual([]);
  });

  it("listarNovedades: la más nueva primero, tolerando campos que faltan", async () => {
    const almacen = almacenDisco(raiz);
    await mkdir(path.join(raiz, "content/novedades"), { recursive: true });
    await writeFile(path.join(raiz, "content/novedades/vieja.json"), JSON.stringify({ titulo: "Vieja", fecha: "2026-11-01T09:00", texto: "t" }));
    await writeFile(path.join(raiz, "content/novedades/rota.json"), "{no es json");
    await writeFile(path.join(raiz, "content/novedades/nueva.json"), JSON.stringify({ titulo: "Nueva", fecha: "2026-11-20T09:00", texto: "t", foto: null, tamano: "grande" }));
    const lista = await listarNovedades(almacen);
    expect(lista.map((n) => n.slug)).toEqual(["nueva", "vieja"]);
    expect(lista[1]).toMatchObject({ foto: null, tamano: "mediana" });
  });

  it("precios: se leen y se guardan en content/precios.json", async () => {
    const almacen = almacenDisco(raiz);
    expect(await leerPrecios(almacen)).toBeNull();
    await guardarPrecios(almacen, { unaVez: 41000, dosVeces: 50000, tresVeces: 55000, paseLibre: 60000, dia: 15000 });
    expect(JSON.parse(await leer("content/precios.json"))).toEqual({ unaVez: 41000, dosVeces: 50000, tresVeces: 55000, paseLibre: 60000, dia: 15000 });
    expect((await leerPrecios(almacen))?.unaVez).toBe(41000);
  });
});

describe("almacenDelEntorno", () => {
  it("con GITHUB_TOKEN usa GitHub", () => {
    expect(almacenDelEntorno({ GITHUB_TOKEN: "x", NODE_ENV: "production" })?.modo).toBe("github");
  });

  it("sin token, solo en desarrollo escribe en el disco", () => {
    expect(almacenDelEntorno({ NODE_ENV: "development" })?.modo).toBe("disco");
  });

  it("sin token en producción no hay almacén: el panel avisa en vez de simular", () => {
    expect(almacenDelEntorno({ NODE_ENV: "production" })).toBeNull();
    expect(almacenDelEntorno({ NODE_ENV: "production", GITHUB_TOKEN: "  " })).toBeNull();
    expect(almacenDelEntorno({})).toBeNull();
  });
});

describe("procesarFoto", () => {
  const imagen = (ancho: number, alto: number) => sharp({ create: { width: ancho, height: alto, channels: 3, background: "#ff0000" } });

  it("achica a 1600 de lado largo, WebP, sin agrandar", async () => {
    const grande = await imagen(3000, 2000).jpeg().toBuffer();
    const r = await procesarFoto(grande);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const meta = await sharp(r.valor).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1600);
    expect(meta.height).toBe(1067);

    const chica = await procesarFoto(await imagen(400, 300).png().toBuffer());
    expect(chica.ok && (await sharp(chica.valor).metadata()).width).toBe(400);
  });

  it("endereza según EXIF y saca los metadatos", async () => {
    const parada = await imagen(800, 400).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    expect((await sharp(parada).metadata()).orientation).toBe(6);
    const r = await procesarFoto(parada);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const meta = await sharp(r.valor).metadata();
    expect([meta.width, meta.height]).toEqual([400, 800]);
    expect(meta.exif).toBeUndefined();
  });

  it("conserva el color", async () => {
    const r = await procesarFoto(await imagen(100, 100).png().toBuffer());
    if (!r.ok) throw new Error(r.error);
    const { data } = await sharp(r.valor).raw().toBuffer({ resolveWithObject: true });
    expect(data[0]).toBeGreaterThan(200);
    expect(data[1]).toBeLessThan(60);
  });

  it("rechaza lo que no es una imagen, SVG incluido", async () => {
    expect((await procesarFoto(Buffer.from("esto no es una foto"))).ok).toBe(false);
    expect((await procesarFoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'))).ok).toBe(false);
    expect((await procesarFoto(new Uint8Array(0))).ok).toBe(false);
  });

  it("rechaza más de 4 MB sin intentar leerla", async () => {
    const r = await procesarFoto(new Uint8Array(MAX_BYTES_FOTO + 1));
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.error).toContain("4 MB");
  });
});

describe("quién guardó (mensaje del commit)", () => {
  it("el mensaje lleva el nombre: 'Panel (Mati): ...', y sin nombre queda 'Panel: ...'", async () => {
    const mensajes: string[] = [];
    const almacen = { ...almacenDisco(raiz), guardar: async (_c: unknown, m: string) => (mensajes.push(m), { antes: [], despues: [] }) };
    await guardarPrecios(almacen, { mensual: 1 } as never, "Mati");
    await guardarPrecios(almacen, { mensual: 1 } as never);
    expect(mensajes).toEqual(["Panel (Mati): actualizar precios", "Panel: actualizar precios"]);
  });

  it("borrarNovedad devuelve el título para el historial", async () => {
    const almacen = almacenDisco(raiz);
    const { slug } = await guardarNovedad(almacen, { slug: null, datos, foto: null, quitarFoto: false, quien: "Mati" });
    expect(await borrarNovedad(almacen, slug, "Mati")).toMatchObject({ titulo: datos.titulo });
  });
});

describe("deshacer (en disco, igual que en GitHub pero sin red)", () => {
  const foto = new Uint8Array([1, 2, 3]);
  const leer = (ruta: string) => readFile(path.join(raiz, ...ruta.split("/")), "utf8").catch(() => null);

  it("shaGit da el mismo sha que git hash-object", () => {
    expect(shaGit("hello\n")).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
    expect(shaGit(new TextEncoder().encode("hello\n"))).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
  });

  it("deshacer una edición vuelve el texto y la foto de antes", async () => {
    const almacen = almacenDisco(raiz);
    const { slug } = await guardarNovedad(almacen, { slug: null, datos, foto, quitarFoto: false });
    const antes = await leer(`content/novedades/${slug}.json`);
    const { huella } = await guardarNovedad(almacen, { slug, datos: { ...datos, titulo: "Otro título" }, foto: new Uint8Array([9]), quitarFoto: false });
    await deshacerHuella(almacen, huella, "deshacer");
    expect(await leer(`content/novedades/${slug}.json`)).toBe(antes);
    expect(new Uint8Array(await readFile(path.join(raiz, "public/fotos/novedades", slug, "foto.webp")))).toEqual(foto);
  });

  it("deshacer una creación la borra; deshacer un borrado la recupera con su foto", async () => {
    const almacen = almacenDisco(raiz);
    const creada = await guardarNovedad(almacen, { slug: null, datos, foto, quitarFoto: false });
    const ruta = `content/novedades/${creada.slug}.json`;
    const texto = await leer(ruta);
    const { huella } = await borrarNovedad(almacen, creada.slug);
    expect(await leer(ruta)).toBeNull();
    await deshacerHuella(almacen, huella, "deshacer");
    expect(await leer(ruta)).toBe(texto);
    await deshacerHuella(almacen, creada.huella, "deshacer");
    expect(await leer(ruta)).toBeNull();
    expect(await readdir(path.join(raiz, "public/fotos/novedades")).catch(() => [])).not.toContain(creada.slug);
  });

  it("no deshace si después se volvió a tocar lo mismo", async () => {
    const almacen = almacenDisco(raiz);
    const creada = await guardarNovedad(almacen, { slug: null, datos, foto: null, quitarFoto: false });
    await guardarNovedad(almacen, { slug: creada.slug, datos: { ...datos, texto: "Cambió" }, foto: null, quitarFoto: false });
    await expect(deshacerHuella(almacen, creada.huella, "deshacer")).rejects.toThrow(MENSAJE_CAMBIO_PISADO);
    expect(await leer(`content/novedades/${creada.slug}.json`)).toContain("Cambió");
  });
});
