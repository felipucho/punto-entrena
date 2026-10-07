import type { Metadata } from "next";
import { claseSuelta, negocio, planes, type Profe, profes } from "@/data/site";
import { preguntasResueltas } from "@/lib/faq";
import { formatearPrecio, telefonoInternacional, urlMapa } from "@/lib/formato";
import { gruposDeDias, type Dia } from "@/lib/horarios";
import { enlaceContacto, navegacion, type Ruta } from "@/lib/rutas";

// Una variable vacía (típica de un .env de plantilla) cuenta como no definida.
// new URL(...).origin saca la barra final y falla con un error claro si falta el protocolo.
// El dominio va fijo: así los deploys de preview y el build local también declaran como canónico el sitio real.
const urlConfigurada = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://puntoentrena.com";

/** URL base del sitio: https://puntoentrena.com, salvo que NEXT_PUBLIC_SITE_URL diga otra cosa. */
export const siteUrl = new URL(urlConfigurada).origin;

const { localidad } = negocio.direccion;

/** Template de títulos: "%s | Punto Entrenamiento y Salud, Las Varillas". */
export const plantillaTitulo = `%s | ${negocio.nombre}, ${localidad}`;

/** Título del inicio: "Punto Entrenamiento y Salud | Gimnasio en Las Varillas". */
export const tituloInicio = `${negocio.nombre} | Gimnasio en ${localidad}`;

/**
 * Imagen para compartir, generada por src/app/opengraph-image.tsx. Va explícita en cada página porque el openGraph
 * de una página reemplaza entero al del layout y, sin esto, las páginas internas salían sin imagen.
 */
export const imagenCompartir = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${negocio.nombre}, gimnasio en ${localidad}`,
};

type DatosMetadata = {
  /** Título corto de la página; se completa con la plantilla. */
  titulo: string;
  /** Hasta 155 caracteres, con datos reales de la página. */
  descripcion: string;
  ruta: Ruta;
  /** Usa `titulo` tal cual, sin plantilla (solo el inicio). */
  absoluto?: boolean;
};

/** Metadata de cada página: title, description, canonical y Open Graph básico. */
export function metadataDePagina({ titulo, descripcion, ruta, absoluto = false }: DatosMetadata): Metadata {
  const tituloCompleto = absoluto ? titulo : plantillaTitulo.replace("%s", titulo);
  return {
    title: absoluto ? { absolute: titulo } : titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: negocio.nombre,
      title: tituloCompleto,
      description: descripcion,
      url: ruta,
      images: [imagenCompartir],
    },
  };
}

const DIA_SCHEMA: Record<Dia, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

/** openingHoursSpecification derivado de la grilla. */
function horariosSchema() {
  return gruposDeDias().flatMap(({ dias, segmentos }) =>
    segmentos.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dias.map((d) => DIA_SCHEMA[d]),
      opens: s.desde,
      closes: s.hasta,
    })),
  );
}

/** @id del gimnasio: los demás bloques (sitio, profes) lo referencian en vez de repetirlo. */
export const idGimnasio = `${siteUrl}/#gimnasio`;

/** Rango de precios, de la opción más barata (el día) al plan más caro: "$ 15.000 - $ 60.000". */
function rangoDePrecios(): string {
  const precios = [claseSuelta.precio, ...planes.map((plan) => plan.precio)];
  return `${formatearPrecio(Math.min(...precios))} - ${formatearPrecio(Math.max(...precios))}`;
}

/** Los planes por mes y el día suelto, como ofertas con precio en pesos. unitCode: MON = mes, DAY = día (UN/CEFACT). */
function catalogoDePlanes() {
  const oferta = (nombre: string, precio: number, unitCode: "MON" | "DAY") => ({
    "@type": "Offer",
    name: nombre,
    price: precio,
    priceCurrency: "ARS",
    priceSpecification: { "@type": "UnitPriceSpecification", price: precio, priceCurrency: "ARS", unitCode },
  });
  return {
    "@type": "OfferCatalog",
    name: "Planes y precios",
    itemListElement: [
      ...planes.map((plan) => oferta(plan.nombre, plan.precio, "MON")),
      oferta(claseSuelta.nombre, claseSuelta.precio, "DAY"),
    ],
  };
}

/** JSON-LD ExerciseGym del layout. */
export function jsonLdGimnasio() {
  const redes = Object.values(negocio.redes).filter((url): url is string => url !== null);
  // Nombre de la ficha de Google Maps, si se escribe distinto: ayuda a unir las dos como el mismo negocio.
  const nombreEnMaps = negocio.mapa?.nombre;
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    "@id": idGimnasio,
    name: negocio.nombre,
    ...(nombreEnMaps && nombreEnMaps !== negocio.nombre ? { alternateName: nombreEnMaps } : {}),
    url: `${siteUrl}/`,
    image: `${siteUrl}/fotos/planta-baja/vista-general-desde-recepcion.jpg`,
    hasMap: urlMapa(),
    telephone: telefonoInternacional(),
    address: {
      "@type": "PostalAddress",
      streetAddress: negocio.direccion.calle,
      addressLocality: negocio.direccion.localidad,
      addressRegion: negocio.direccion.provincia,
      postalCode: negocio.direccion.codigoPostal,
      addressCountry: negocio.direccion.pais,
    },
    ...(negocio.mapa
      ? { geo: { "@type": "GeoCoordinates", latitude: negocio.mapa.latitud, longitude: negocio.mapa.longitud } }
      : {}),
    areaServed: { "@type": "City", name: negocio.direccion.localidad },
    openingHoursSpecification: horariosSchema(),
    priceRange: rangoDePrecios(),
    currenciesAccepted: "ARS",
    hasOfferCatalog: catalogoDePlanes(),
    ...(redes.length > 0 ? { sameAs: redes } : {}),
    // TODO: agregar "logo" cuando esté el vector original del logo.
  };
}

/** JSON-LD WebSite del layout: el sitio y quién lo publica. Sin SearchAction porque el sitio no tiene buscador. */
export function jsonLdSitio() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#sitio`,
    name: negocio.nombre,
    url: `${siteUrl}/`,
    inLanguage: "es-AR",
    publisher: { "@id": idGimnasio },
  };
}

/**
 * JSON-LD Person de cada profe para /equipo. Solo nombre, retrato y dónde trabaja: la formación de cada uno
 * todavía no está confirmada (ver formacionProfes en site.ts), así que no va jobTitle.
 * `retrato` devuelve la ruta en public/ de la foto del profe, o null si todavía no está.
 */
export function jsonLdProfes(retrato: (profe: Profe) => string | null) {
  return {
    "@context": "https://schema.org",
    "@graph": profes.map((profe) => {
      const foto = retrato(profe);
      return {
        "@type": "Person",
        "@id": `${siteUrl}/equipo#${profe.id}`,
        name: profe.nombre,
        url: `${siteUrl}/equipo#${profe.id}`,
        ...(foto ? { image: `${siteUrl}${foto}` } : {}),
        worksFor: { "@id": idGimnasio },
      };
    }),
  };
}

/** Nombre de cada página en las migas: el del menú, el del botón de contacto o el del footer. */
const enlacesConNombre = [
  ...navegacion,
  enlaceContacto,
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
];

/** JSON-LD BreadcrumbList de una página interna: Inicio → la página. */
export function jsonLdMigas(ruta: Exclude<Ruta, "/">) {
  const nombre = enlacesConNombre.find((enlace) => enlace.href === ruta)?.label;
  if (!nombre) throw new Error(`Falta el nombre de ${ruta} para las migas en src/lib/seo.ts`);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: nombre, item: `${siteUrl}${ruta}` },
    ],
  };
}

/** JSON-LD FAQPage de /faq, con las respuestas ya interpoladas. */
export function jsonLdFaq() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntasResueltas().map(({ pregunta, respuesta }) => ({
      "@type": "Question",
      name: pregunta,
      acceptedAnswer: { "@type": "Answer", text: respuesta },
    })),
  };
}
