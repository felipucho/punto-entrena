import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import { negocio } from "@/data/site";
import { jsonLdGimnasio, plantillaTitulo, siteUrl, tituloInicio } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: tituloInicio, template: plantillaTitulo },
  applicationName: negocio.nombre,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: negocio.nombre,
    // TODO Felipe: imagen OG por defecto cuando esté la identidad visual.
  },
  // TODO: favicon e íconos a partir del logo (src/app/icon.svg y apple-icon.png).
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className="flex min-h-dvh flex-col">
        <a href="#contenido" className="btn btn-primario saltar">
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <WhatsAppFlotante />
        <JsonLd datos={jsonLdGimnasio()} />
      </body>
    </html>
  );
}
