import { describe, expect, it } from "vitest";
import { MENSAJE_CAMBIO_PISADO, almacenGitHub, deshacerHuella } from "./panel-almacen";
import { ErrorGitHub, commitear, leerTextoGitHub, listarCarpetaGitHub } from "./panel-github";
import { borrarNovedad, guardarNovedad } from "./panel-novedades";

type Llamada = { metodo: string; ruta: string; cuerpo: unknown };

/** Un GitHub falso: lleva la cuenta de lo que se le pide y devuelve lo que `responder` decida (o un 200 por defecto). */
function githubFalso(responder?: (l: Llamada, n: number) => Response | undefined) {
  const llamadas: Llamada[] = [];
  let blobs = 0;
  const fetchFalso = (async (url: string | URL | Request, init?: RequestInit) => {
    const ruta = String(url).replace("https://api.github.com/repos/felipucho/punto-entrena", "").replace("https://api.github.com", "");
    const llamada: Llamada = { metodo: init?.method ?? "GET", ruta, cuerpo: init?.body ? JSON.parse(String(init.body)) : undefined };
    llamadas.push(llamada);
    const propia = responder?.(llamada, llamadas.length);
    if (propia) return propia;
    const json = (datos: unknown, status = 200) => new Response(JSON.stringify(datos), { status });
    if (ruta === "/user") return json({ id: 42, login: "felipucho" });
    if (ruta === "/git/blobs") return json({ sha: `blob${++blobs}` }, 201);
    if (ruta.startsWith("/git/ref/heads/")) return json({ object: { sha: "punta" } });
    if (ruta === "/git/commits/punta") return json({ tree: { sha: "arbol-base" } });
    if (ruta === "/git/trees") return json({ sha: "arbol-nuevo" }, 201);
    if (ruta === "/git/commits") return json({ sha: "commit-nuevo" }, 201);
    if (ruta.startsWith("/git/refs/heads/")) return json({ ref: "refs/heads/master" });
    return json({ message: "Not Found" }, 404);
  }) as typeof fetch;
  return { fetchFalso, llamadas };
}

describe("commitear", () => {
  it("un solo commit con el JSON y la foto, en el orden blobs → árbol → commit → rama", async () => {
    const { fetchFalso, llamadas } = githubFalso();
    const sha = await commitear({
      token: "tok",
      fetchFn: fetchFalso,
      mensaje: "Panel: nueva novedad «Hola»",
      cambios: [
        { ruta: "content/novedades/hola.json", contenido: '{"titulo":"Hola"}\n' },
        { ruta: "public/fotos/novedades/hola/foto.webp", contenido: new Uint8Array([1, 2, 3]) },
      ],
    });
    expect(sha).toBe("commit-nuevo");

    const rutas = llamadas.map((l) => `${l.metodo} ${l.ruta}`);
    expect(rutas.filter((r) => r === "POST /git/commits")).toHaveLength(1);
    expect(rutas.filter((r) => r === "POST /git/blobs")).toHaveLength(2);
    expect(rutas.indexOf("POST /git/trees")).toBeGreaterThan(rutas.lastIndexOf("POST /git/blobs"));
    expect(rutas.indexOf("POST /git/commits")).toBeGreaterThan(rutas.indexOf("POST /git/trees"));
    expect(rutas.at(-1)).toBe("PATCH /git/refs/heads/master");

    const blobs = llamadas.filter((l) => l.ruta === "/git/blobs").map((l) => l.cuerpo as { content: string; encoding: string });
    expect(blobs.every((b) => b.encoding === "base64")).toBe(true);
    expect(Buffer.from(blobs[0].content, "base64").toString("utf8")).toBe('{"titulo":"Hola"}\n');
    expect([...Buffer.from(blobs[1].content, "base64")]).toEqual([1, 2, 3]);

    const arbol = llamadas.find((l) => l.ruta === "/git/trees")!.cuerpo as { base_tree: string; tree: { path: string; sha: string }[] };
    expect(arbol.base_tree).toBe("arbol-base");
    expect(arbol.tree.map((e) => e.path)).toEqual(["content/novedades/hola.json", "public/fotos/novedades/hola/foto.webp"]);

    const commit = llamadas.find((l) => l.ruta === "/git/commits")!.cuerpo as {
      message: string;
      parents: string[];
      tree: string;
      author: { name: string; email: string };
    };
    expect(commit.message).toBe("Panel: nueva novedad «Hola»");
    expect(commit.parents).toEqual(["punta"]);
    expect(commit.tree).toBe("arbol-nuevo");
    expect(commit.author.name).toBe("Panel de Punto");
    expect(commit.author.email).toBe("42+felipucho@users.noreply.github.com");
  });

  it("manda el token como Bearer y apunta a la rama master del repo", async () => {
    const vistos: { url: string; auth: string | null }[] = [];
    const { fetchFalso } = githubFalso();
    const envoltorio = ((url: string, init?: RequestInit) => {
      vistos.push({ url: String(url), auth: new Headers(init?.headers).get("authorization") });
      return fetchFalso(url, init);
    }) as typeof fetch;
    await commitear({ token: "secreto", fetchFn: envoltorio, mensaje: "m", cambios: [{ ruta: "content/precios.json", contenido: "{}" }] });
    expect(vistos.every((v) => v.auth === "Bearer secreto")).toBe(true);
    expect(vistos.some((v) => v.url.includes("/repos/felipucho/punto-entrena/git/ref/heads/master"))).toBe(true);
  });

  it("borrar manda sha null en el árbol, sin crear blobs", async () => {
    const { fetchFalso, llamadas } = githubFalso();
    await commitear({
      token: "t",
      fetchFn: fetchFalso,
      mensaje: "m",
      cambios: [
        { ruta: "content/novedades/hola.json", borrar: true },
        { ruta: "public/fotos/novedades/hola/foto.webp", borrar: true },
      ],
    });
    expect(llamadas.some((l) => l.ruta === "/git/blobs")).toBe(false);
    const arbol = llamadas.find((l) => l.ruta === "/git/trees")!.cuerpo as { tree: { path: string; sha: string | null }[] };
    expect(arbol.tree).toEqual([
      { path: "content/novedades/hola.json", mode: "100644", type: "blob", sha: null },
      { path: "public/fotos/novedades/hola/foto.webp", mode: "100644", type: "blob", sha: null },
    ]);
  });

  it("si la rama avanzó (422), vuelve a leer la punta y reintenta una vez", async () => {
    let puntas = 0;
    let intentosRef = 0;
    const { fetchFalso, llamadas } = githubFalso((l) => {
      if (l.ruta.startsWith("/git/ref/heads/")) return new Response(JSON.stringify({ object: { sha: `punta${++puntas}` } }));
      if (l.ruta.startsWith("/git/commits/punta")) return new Response(JSON.stringify({ tree: { sha: `arbol-de-${l.ruta.split("/").pop()}` } }));
      if (l.metodo === "PATCH") return ++intentosRef === 1 ? new Response("{}", { status: 422 }) : new Response("{}");
      return undefined;
    });
    await commitear({ token: "t", fetchFn: fetchFalso, mensaje: "m", cambios: [{ ruta: "content/precios.json", contenido: "{}" }] });

    expect(puntas).toBe(2);
    expect(llamadas.filter((l) => l.metodo === "PATCH")).toHaveLength(2);
    // Los blobs no se repiten; el commit del reintento cuelga de la punta nueva.
    expect(llamadas.filter((l) => l.ruta === "/git/blobs")).toHaveLength(1);
    const commits = llamadas.filter((l) => l.ruta === "/git/commits").map((l) => (l.cuerpo as { parents: string[] }).parents[0]);
    expect(commits).toEqual(["punta1", "punta2"]);
  });

  it("también reintenta con 409, pero no más de una vez", async () => {
    const { fetchFalso, llamadas } = githubFalso((l) => (l.metodo === "PATCH" ? new Response("{}", { status: 409 }) : undefined));
    await expect(
      commitear({ token: "t", fetchFn: fetchFalso, mensaje: "m", cambios: [{ ruta: "content/precios.json", contenido: "{}" }] }),
    ).rejects.toMatchObject({ estado: 409 });
    expect(llamadas.filter((l) => l.metodo === "PATCH")).toHaveLength(2);
  });

  it("un 403 (token sin permiso) no se reintenta y llega como ErrorGitHub", async () => {
    const { fetchFalso, llamadas } = githubFalso((l) => (l.metodo === "PATCH" ? new Response("{}", { status: 403 }) : undefined));
    const error = await commitear({
      token: "t",
      fetchFn: fetchFalso,
      mensaje: "m",
      cambios: [{ ruta: "content/precios.json", contenido: "{}" }],
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ErrorGitHub);
    expect(error.estado).toBe(403);
    expect(error.message).not.toContain("Bearer");
    expect(llamadas.filter((l) => l.metodo === "PATCH")).toHaveLength(1);
  });

  it("sin /user, el commit sale igual con un correo propio", async () => {
    const { fetchFalso, llamadas } = githubFalso((l) => (l.ruta === "/user" ? new Response("{}", { status: 401 }) : undefined));
    await commitear({ token: "t", fetchFn: fetchFalso, mensaje: "m", cambios: [{ ruta: "content/precios.json", contenido: "{}" }] });
    const commit = llamadas.find((l) => l.ruta === "/git/commits")!.cuerpo as { author: { name: string; email: string } };
    expect(commit.author).toMatchObject({ name: "Panel de Punto", email: "panel@puntoentrena.com" });
  });

  it("sin cambios falla antes de llamar a GitHub", async () => {
    const { fetchFalso, llamadas } = githubFalso();
    await expect(commitear({ token: "t", fetchFn: fetchFalso, mensaje: "m", cambios: [] })).rejects.toThrow();
    expect(llamadas).toHaveLength(0);
  });
});

describe("lecturas", () => {
  it("leerTextoGitHub: el texto, o null si no existe", async () => {
    const { fetchFalso } = githubFalso((l) => (l.ruta.includes("existe.json") ? new Response('{"a":1}') : new Response("{}", { status: 404 })));
    expect(await leerTextoGitHub({ token: "t", fetchFn: fetchFalso }, "content/novedades/existe.json")).toBe('{"a":1}');
    expect(await leerTextoGitHub({ token: "t", fetchFn: fetchFalso }, "content/novedades/no.json")).toBeNull();
  });

  it("listarCarpetaGitHub: solo archivos; carpeta inexistente = []", async () => {
    const { fetchFalso } = githubFalso((l) =>
      l.ruta.includes("hay")
        ? new Response(JSON.stringify([{ name: "foto.png", type: "file" }, { name: "sub", type: "dir" }]))
        : new Response("{}", { status: 404 }),
    );
    expect(await listarCarpetaGitHub({ token: "t", fetchFn: fetchFalso }, "public/fotos/novedades/hay")).toEqual(["foto.png"]);
    expect(await listarCarpetaGitHub({ token: "t", fetchFn: fetchFalso }, "public/fotos/novedades/nada")).toEqual([]);
  });
});

describe("novedades sobre GitHub", () => {
  const datos = { titulo: "Feriado", fecha: "2026-11-23T09:00", texto: "Texto", tamano: "mediana" as const };

  it("una novedad nueva con foto es UN commit con el JSON y la foto", async () => {
    const { fetchFalso, llamadas } = githubFalso((l) => {
      if (!l.ruta.startsWith("/contents/")) return undefined;
      // Un archivo que todavía no existe da 404; una carpeta vacía, [].
      return /\.(json|webp)\?/.test(l.ruta) ? new Response("{}", { status: 404 }) : new Response("[]");
    });
    const almacen = almacenGitHub("t", fetchFalso);
    const r = await guardarNovedad(almacen, { slug: null, datos, foto: new Uint8Array([9, 9]), quitarFoto: false });
    expect(r).toMatchObject({ slug: "feriado", foto: "/fotos/novedades/feriado/foto.webp", nueva: true });

    expect(llamadas.filter((l) => l.ruta === "/git/commits")).toHaveLength(1);
    const arbol = llamadas.find((l) => l.ruta === "/git/trees")!.cuerpo as { tree: { path: string }[] };
    expect(arbol.tree.map((e) => e.path).sort()).toEqual(["content/novedades/feriado.json", "public/fotos/novedades/feriado/foto.webp"]);
    const blobJson = llamadas.filter((l) => l.ruta === "/git/blobs").map((l) => Buffer.from((l.cuerpo as { content: string }).content, "base64").toString("utf8"));
    const json = JSON.parse(blobJson.find((t) => t.startsWith("{"))!);
    expect(json).toEqual({ ...datos, foto: "/fotos/novedades/feriado/foto.webp" });
    const commit = llamadas.find((l) => l.ruta === "/git/commits")!.cuerpo as { message: string };
    expect(commit.message).toBe("Panel: nueva novedad «Feriado»");
  });

  it("borrar quita el JSON y toda la carpeta de la foto en un solo commit", async () => {
    const { fetchFalso, llamadas } = githubFalso((l) => {
      // El mismo JSON sirve de contenido (raw) y de metadatos (sha) para el falso.
      if (l.ruta.startsWith("/contents/content/novedades/feriado.json")) {
        return new Response(JSON.stringify({ titulo: "Feriado", fecha: "2026-11-23T09:00", texto: "T", sha: "a".repeat(40) }));
      }
      if (l.ruta.startsWith("/contents/public/fotos/novedades/feriado/foto")) return new Response(JSON.stringify({ sha: "b".repeat(40) }));
      if (l.ruta.startsWith("/contents/public/fotos/novedades/feriado")) {
        return new Response(JSON.stringify([{ name: "foto.png", type: "file" }, { name: "foto.webp", type: "file" }]));
      }
      return undefined;
    });
    await borrarNovedad(almacenGitHub("t", fetchFalso), "feriado");

    expect(llamadas.filter((l) => l.ruta === "/git/commits")).toHaveLength(1);
    expect(llamadas.some((l) => l.ruta === "/git/blobs")).toBe(false);
    const arbol = llamadas.find((l) => l.ruta === "/git/trees")!.cuerpo as { tree: { path: string; sha: string | null }[] };
    expect(arbol.tree.map((e) => e.path)).toEqual([
      "content/novedades/feriado.json",
      "public/fotos/novedades/feriado/foto.png",
      "public/fotos/novedades/feriado/foto.webp",
    ]);
    expect(arbol.tree.every((e) => e.sha === null)).toBe(true);
    const commit = llamadas.find((l) => l.ruta === "/git/commits")!.cuerpo as { message: string };
    expect(commit.message).toBe("Panel: borrar novedad «Feriado»");
  });

  it("deshacer vuelve a los blobs de antes sin subir nada, y no deshace si el archivo cambió después", async () => {
    const antes = "c".repeat(40);
    const despues = "d".repeat(40);
    const huella = {
      antes: [
        { ruta: "content/precios.json", sha: antes },
        { ruta: "content/novedades/nueva.json", sha: null },
      ],
      despues: [
        { ruta: "content/precios.json", sha: despues },
        { ruta: "content/novedades/nueva.json", sha: "e".repeat(40) },
      ],
    };
    const conActual = (precios: string) =>
      githubFalso((l) => {
        if (l.ruta.startsWith("/contents/content/precios.json")) return new Response(JSON.stringify({ sha: precios }));
        if (l.ruta.startsWith("/contents/content/novedades/nueva.json")) return new Response(JSON.stringify({ sha: "e".repeat(40) }));
        return undefined;
      });

    const ok = conActual(despues);
    await deshacerHuella(almacenGitHub("t", ok.fetchFalso), huella, "Panel (Mati): deshacer el cambio de precios");
    expect(ok.llamadas.some((l) => l.ruta === "/git/blobs")).toBe(false);
    const arbol = ok.llamadas.find((l) => l.ruta === "/git/trees")!.cuerpo as { tree: { path: string; sha: string | null }[] };
    expect(arbol.tree).toEqual([
      { path: "content/precios.json", mode: "100644", type: "blob", sha: antes },
      { path: "content/novedades/nueva.json", mode: "100644", type: "blob", sha: null },
    ]);

    const pisado = conActual("f".repeat(40));
    await expect(deshacerHuella(almacenGitHub("t", pisado.fetchFalso), huella, "m")).rejects.toThrow(MENSAJE_CAMBIO_PISADO);
    expect(pisado.llamadas.some((l) => l.ruta === "/git/commits")).toBe(false);
  });

  it("no toca rutas fuera de las del panel", async () => {
    const { fetchFalso, llamadas } = githubFalso();
    await expect(almacenGitHub("t", fetchFalso).guardar([{ ruta: ".github/workflows/sync-fork.yml", contenido: "x" }], "m")).rejects.toThrow(/Ruta no permitida/);
    expect(llamadas).toHaveLength(0);
  });
});
