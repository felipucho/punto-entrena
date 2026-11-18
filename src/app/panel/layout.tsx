import type { Metadata } from "next";
import { Anton, Roboto } from "next/font/google";
import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import { haySesion } from "@/lib/panel-auth";
import { salir } from "./acciones";
import { IconoAfuera } from "./iconos";
import "../globals.css";
import "./panel.css";

// Nada del panel se genera en el build ni se cachea: cada pedido mira la cookie.
export const dynamic = "force-dynamic";

/* Raíz aparte de la del sitio: el panel lleva el CSS y las fuentes del sitio, pero no Header, Footer ni botones flotantes. */
export const metadata: Metadata = { title: "Panel de Punto", robots: { index: false, follow: false } };

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-roboto", display: "swap", preload: false });

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const usuario = await haySesion();
  return (
    <html lang="es-AR" className={`${anton.variable} ${roboto.variable}`}>
      <body className="panel-cuerpo">
        <header className="panel-barra">
          <div className="contenedor panel-barra-interior">
            <Link href="/panel" className="panel-marca">
              <Isotipo />
              Panel
            </Link>
            {usuario && (
              <div className="panel-barra-acciones">
                <a href="/novedades" target="_blank" rel="noopener" className="panel-enlace">
                  <span className="max-sm:sr-only">Ver la página</span>
                  <IconoAfuera />
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
                <span className="panel-quien" title="Sesión iniciada">
                  {usuario.nombre}
                </span>
                <form action={salir}>
                  <button type="submit" className="panel-enlace">
                    Salir
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="contenedor">{children}</main>
      </body>
    </html>
  );
}
