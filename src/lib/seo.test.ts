import { describe, expect, it } from "vitest";
import { negocio } from "@/data/site";
import { urlMapa } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";
import { imagenCompartir, jsonLdGimnasio, metadataDePagina, plantillaTitulo } from "@/lib/seo";

describe("urlMapa", () => {
  it("usa la ficha de Google Maps cuando está cargada", () => {
    expect(negocio.mapa).not.toBeNull();
    expect(urlMapa()).toBe(negocio.mapa?.url);
  });

  it("cae a la búsqueda por dirección cuando no hay ficha", () => {
    const ficha = negocio.mapa;
    negocio.mapa = null;
    try {
      expect(urlMapa()).toMatch(/^https:\/\/www\.google\.com\/maps\?q=/);
      expect(urlMapa()).toContain(encodeURIComponent(negocio.direccion.calle));
    } finally {
      negocio.mapa = ficha;
    }
  });
});

describe("redesActivas", () => {
  it("lista solo las redes con URL cargada, todas con https", () => {
    const redes = redesActivas();
    expect(redes.length).toBeGreaterThan(0);
    for (const red of redes) expect(red.url).toMatch(/^https:\/\//);
  });
});

describe("jsonLdGimnasio", () => {
  const datos = jsonLdGimnasio();

  it("apunta hasMap a la misma URL que el botón de contacto", () => {
    expect(datos.hasMap).toBe(urlMapa());
  });

  it("incluye geo con las coordenadas de la ficha", () => {
    expect(datos.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: negocio.mapa?.latitud,
      longitude: negocio.mapa?.longitud,
    });
  });

  it("lista en sameAs las redes activas", () => {
    expect(datos.sameAs).toEqual(redesActivas().map((red) => red.url));
  });

  it("arma los horarios con formato HH:MM", () => {
    expect(datos.openingHoursSpecification.length).toBeGreaterThan(0);
    for (const franja of datos.openingHoursSpecification) {
      expect(franja.opens).toMatch(/^\d{2}:\d{2}$/);
      expect(franja.closes).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("no deja valores vacíos ni la palabra undefined", () => {
    const json = JSON.stringify(datos);
    expect(json).not.toContain("undefined");
    expect(json).not.toContain(":null");
  });
});

describe("metadataDePagina", () => {
  const metadata = metadataDePagina({ titulo: "Planes", descripcion: "Descripción de prueba.", ruta: "/planes" });

  it("pone la ruta en canonical y en og:url", () => {
    expect(metadata.alternates?.canonical).toBe("/planes");
    expect(metadata.openGraph?.url).toBe("/planes");
  });

  it("suma la imagen para compartir a Open Graph", () => {
    expect(metadata.openGraph?.images).toEqual([imagenCompartir]);
  });

  it("completa el título con la plantilla, salvo en el inicio", () => {
    expect(metadata.openGraph?.title).toBe(plantillaTitulo.replace("%s", "Planes"));
    const inicio = metadataDePagina({ titulo: "Inicio", descripcion: "Descripción de prueba.", ruta: "/", absoluto: true });
    expect(inicio.title).toEqual({ absolute: "Inicio" });
  });
});
