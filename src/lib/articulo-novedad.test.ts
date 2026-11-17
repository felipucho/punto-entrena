import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (p: { src: string; alt: string; width: number; height: number; sizes?: string; className?: string }) =>
    createElement("img", { "data-next": "1", src: p.src, alt: p.alt, width: p.width, height: p.height, sizes: p.sizes, className: p.className }),
}));

import ArticuloNovedad from "@/components/ArticuloNovedad";

const foto = { src: "/fotos/novedades/a.jpg?v=abc", ancho: 800, alto: 600 };
const html = (props: Partial<Parameters<typeof ArticuloNovedad>[0]> = {}) =>
  renderToStaticMarkup(createElement(ArticuloNovedad, { titulo: "Hola", texto: "Uno", ...props }));

describe("ArticuloNovedad", () => {
  it("sin foto no dibuja <img> ni <figure>", () => {
    const h = html();
    expect(h).not.toContain("<img");
    expect(h).not.toContain("<figure");
  });

  it("con foto usa next/image con ancho, alto y alt = titulo", () => {
    const h = html({ foto });
    expect(h).toContain('data-next="1"');
    expect(h).toContain('width="800"');
    expect(h).toContain('height="600"');
    expect(h).toContain('alt="Hola"');
  });

  it.each([
    ["chica", "w-1/2 @lg:w-1/3", "(min-width: 600px) 210px, 50vw"],
    ["mediana", "w-full @lg:w-2/3", "(min-width: 600px) 420px, 100vw"],
    ["grande", "w-full relative", "(min-width: 600px) 620px, 100vw"],
  ] as const)("tamano %s", (tamano, clase, sizes) => {
    const h = html({ foto, tamano });
    expect(h).toContain(`<figure class="${clase}`);
    expect(h).toContain(`sizes="${sizes}"`);
  });

  it("tamano ausente = mediana", () => {
    expect(html({ foto })).toContain('<figure class="w-full @lg:w-2/3');
  });

  it("sinOptimizar dibuja <img> plano con la URL tal cual", () => {
    const h = html({ foto: { src: "blob:http://x/1", ancho: 0, alto: 0 }, sinOptimizar: true });
    expect(h).toContain('src="blob:http://x/1"');
    expect(h).not.toContain("data-next");
    expect(h).not.toContain('width="0"');
  });

  it("separa parrafos en lineas en blanco (con espacios) y recorta", () => {
    const h = html({ texto: "Uno\n\n  Dos  \n \t \nTres\ncontinua" });
    expect(h.match(/<p /g)).toHaveLength(3);
    expect(h).toContain(">Dos</p>");
    expect(h).toContain("Tres\ncontinua");
  });

  it("el articulo lleva wrap-anywhere y min-w-0 para titulos largos", () => {
    const h = html({ titulo: "A".repeat(300) });
    expect(h).toMatch(/<article class="[^"]*wrap-anywhere/);
    expect(h).toMatch(/<article class="[^"]*min-w-0/);
    expect(h).toContain("A".repeat(300));
  });

  it("rotulo de fecha: dateTime sin hora y texto largo en espanol", () => {
    const h = html({ fecha: "2026-11-15T10:00" });
    expect(h).toContain('dateTime="2026-11-15"');
    expect(h).toContain("15 de noviembre de 2026");
    expect(h).not.toContain("10:00");
  });

  it("sin fecha no hay <time>; titulo vacio no hay <h2>", () => {
    expect(html()).not.toContain("<time");
    expect(html({ titulo: "   " })).not.toContain("<h2");
  });

  it("escapa HTML del texto y titulo", () => {
    const h = html({ titulo: "<script>x</script>", texto: "<b>hola</b>" });
    expect(h).not.toContain("<script>");
    expect(h).not.toContain("<b>hola");
  });
});
