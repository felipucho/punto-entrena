import type { Metadata } from "next";
import { Anton, Roboto } from "next/font/google";
import "../globals.css";

/*
 * Raíz propia de la vista previa de una novedad: el CSS y las fuentes del sitio, sin Header, Footer ni botones
 * flotantes. La carga como iframe el panel (/keystatic), así lo que se ve ahí es lo que sale en /novedades.
 */
export const metadata: Metadata = { title: "Vista previa de una novedad", robots: { index: false, follow: false } };

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-roboto", display: "swap", preload: false });

export default function VistaPreviaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
