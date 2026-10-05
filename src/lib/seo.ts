import type { Metadata } from "next";
import { negocio } from "@/data/site";
import { preguntasResueltas } from "@/lib/faq";
import { telefonoInternacional, urlMapa } from "@/lib/formato";
import { gruposDeDias, type Dia } from "@/lib/horarios";
import type { Ruta } from "@/lib/rutas";

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

/** JSON-LD ExerciseGym del layout. */
export function jsonLdGimnasio() {
  const redes = Object.values(negocio.redes).filter((url): url is string => url !== null);
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: negocio.nombre,
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
    openingHoursSpecification: horariosSchema(),
    ...(redes.length > 0 ? { sameAs: redes } : {}),
    // TODO: agregar "logo" cuando esté el vector original del logo.
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
