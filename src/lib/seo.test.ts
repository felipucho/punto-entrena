import { describe, expect, it } from "vitest";
import { claseSuelta, negocio, planes, profes } from "@/data/site";
import { urlMapa } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";
import { type Ruta, rutas } from "@/lib/rutas";
import {
  idGimnasio,
  imagenCompartir,
  jsonLdGimnasio,
  jsonLdMigas,
  jsonLdProfes,
  jsonLdSitio,
  metadataDePagina,
  plantillaTitulo,
  siteUrl,
} from "@/lib/seo";

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

  it("cierra los días cuya columna de la grilla no tiene profe", () => {
    const lunes = datos.openingHoursSpecification
      .filter((franja) => franja.dayOfWeek.includes("Monday"))
      .map((franja) => `${franja.opens}-${franja.closes}`);
    const martes = datos.openingHoursSpecification
      .filter((franja) => franja.dayOfWeek.includes("Tuesday"))
      .map((franja) => `${franja.opens}-${franja.closes}`);
    expect(lunes).toEqual(["07:00-12:00", "13:00-16:00", "17:00-21:00"]);
    expect(martes).toEqual(["07:00-12:00", "13:00-21:00"]);
  });

  it("no deja valores vacíos ni la palabra undefined", () => {
    const json = JSON.stringify(datos);
    expect(json).not.toContain("undefined");
    expect(json).not.toContain(":null");
  });

  it("tiene un @id que referencian el sitio y los profes", () => {
    expect(datos["@id"]).toBe(idGimnasio);
    expect(jsonLdSitio().publisher).toEqual({ "@id": idGimnasio });
  });

  it("ofrece cada plan por mes y el día suelto, en pesos", () => {
    const ofertas = datos.hasOfferCatalog.itemListElement;
    expect(ofertas.map((oferta) => oferta.price)).toEqual([...planes.map((plan) => plan.precio), claseSuelta.precio]);
    for (const oferta of ofertas) expect(oferta.priceCurrency).toBe("ARS");
    expect(ofertas.at(-1)?.priceSpecification.unitCode).toBe("DAY");
  });

  it("manda alternateName solo si la ficha de Maps tiene otro nombre", () => {
    const ficha = negocio.mapa;
    try {
      if (ficha) negocio.mapa = { ...ficha, nombre: negocio.nombre };
      expect(jsonLdGimnasio()).not.toHaveProperty("alternateName");
    } finally {
      negocio.mapa = ficha;
    }
  });
});

describe("jsonLdProfes", () => {
  it("vincula cada profe con el gimnasio y suma el retrato solo si existe", () => {
    const { "@graph": personas } = jsonLdProfes((profe) => (profe.id === profes[0].id ? "/fotos/retrato.jpg" : null));
    expect(personas.map((persona) => persona.name)).toEqual(profes.map((profe) => profe.nombre));
    for (const persona of personas) expect(persona.worksFor).toEqual({ "@id": idGimnasio });
    expect(personas[0].image).toBe(`${siteUrl}/fotos/retrato.jpg`);
    expect(personas[1]).not.toHaveProperty("image");
  });
});

describe("jsonLdMigas", () => {
  it.each(rutas.filter((ruta): ruta is Exclude<Ruta, "/"> => ruta !== "/"))("arma Inicio → %s con URLs absolutas", (ruta) => {
    const [inicio, pagina] = jsonLdMigas(ruta).itemListElement;
    expect(inicio.item).toBe(`${siteUrl}/`);
    expect(pagina.item).toBe(`${siteUrl}${ruta}`);
    expect(pagina.name).not.toBe("");
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
