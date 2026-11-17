import type { Metadata } from "next";
import { Anton, Roboto } from "next/font/google";
import "./punto.css";

/* Raíz aparte de la del sitio: el panel no lleva Header, Footer ni el CSS global. */
export const metadata: Metadata = { title: "Panel de Punto", robots: { index: false, follow: false } };

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", display: "swap" });

export default function KeystaticLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
