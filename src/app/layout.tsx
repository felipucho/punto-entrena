import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Anton, Roboto } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import VolverArriba from "@/components/VolverArriba";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import { negocio } from "@/data/site";
import { jsonLdGimnasio, plantillaTitulo, siteUrl, tituloInicio } from "@/lib/seo";
import "./globals.css";

/*
 * Las dos familias de las placas de redes. Anton reemplaza a Zuume Rough Bold (sin licencia web confirmada).
 * Solo Anton se precarga: pesa 12 KB y es la de los titulares de arriba, donde su respaldo cambia mucho el ancho.
 * Roboto (normal + itálica, ~79 KB) no: con swap el texto pinta enseguida con el respaldo de métricas ajustadas y
 * cambia al llegar la fuente, sin sacarle ancho de banda al primer render (el LCP de las páginas es texto).
 * La itálica no va en otra llamada: sería otra familia y cada `italic` del sitio caería en una oblicua sintetizada.
 */
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const roboto = Roboto({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-roboto",
  display: "swap",
  preload: false,
});

/* Contrato de dirección (Fase 2, seed punto-placas). Va como comentario en el HTML para que viaje con el sitio. */
const CONTRATO_DIRECCION = `<!-- punto-placas · THESIS: el sitio es una placa de Punto: negro con grano, amarillo solo para el dato y la acción, blanco de contraste. OWN-WORLD: la P del logo (barra con corte diagonal, pata con cuña amarilla, el punto) y los recursos de redes de Camaleón (bloque de dato con etiqueta, cinta, titular mixto, pill con flecha, toggle ON). STORY: claridad antes que épica; cada sección cierra en WhatsApp. FIRST VIEWPORT (375 px): titular mixto GIMNASIO EN / LAS VARILLAS en Anton, cinta con el nombre, bajada en Roboto itálica y CTA amarillo cortado; el hero termina en el corte de la pata con su cuña y debajo va el estado en vivo con el toggle ON y el punto como luz de abierto. FORM + FINISH: Anton para titulares, números y cintas; Roboto 17 px para leer; AA en todos los pares; placas amarillas como quiebre; motion solo CSS y quieto con reduced-motion. -->`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: { google: "-NjuH-Ar5VmF0e6rIjZxZcMipBoPS32ws3Yg4uDgLb8" },
  title: { default: tituloInicio, template: plantillaTitulo },
  applicationName: negocio.nombre,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: negocio.nombre,
    // La imagen sale de src/app/opengraph-image.tsx.
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // Sincronizado a mano con --color-bg de src/app/estilos/tokens.css (primitivo --negro-grano): si cambia uno, cambiar el otro.
  themeColor: "#0d0d0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${roboto.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRATO_DIRECCION }} />
        <a href="#contenido" className="btn btn-primario saltar">
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <aside aria-label="Accesos rápidos">
          <VolverArriba />
          <WhatsAppFlotante />
        </aside>
        <JsonLd datos={jsonLdGimnasio()} />
        <Analytics />
      </body>
    </html>
  );
}
