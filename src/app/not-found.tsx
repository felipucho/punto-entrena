import type { Metadata } from "next";
import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import { negocio } from "@/data/site";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: `Esta página no existe. Volvé al inicio o mirá los planes y horarios de ${negocio.nombre}.`,
};

export default function NoEncontrada() {
  return (
    <div className="contenedor relative isolate min-h-[60svh] overflow-hidden pt-section pb-section">
      {/* Cuña y punto al 25 % del amarillo: plenos quedaban detrás del final del h1 (800 a 870 px) y el blanco no se leía. */}
      <Isotipo className="pointer-events-none absolute -right-16 top-6 -z-10 h-[20rem] w-auto text-surface-alt [--color-punto:color-mix(in_srgb,var(--color-accent)_25%,transparent)] sm:right-0 sm:h-[28rem]" />
      <h1>No encontramos esta página</h1>
      <p className="intro mt-4">
        Puede que el enlace haya cambiado. Los precios están en{" "}
        <Link href="/planes" className="enlace">
          planes
        </Link>{" "}
        y la grilla de profes, en{" "}
        <Link href="/horarios" className="enlace">
          horarios
        </Link>
        . Si buscabas otra cosa, escribinos.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primario">
          Volver al inicio
        </Link>
        <Link href="/contacto" className="btn btn-secundario">
          Ver contacto
        </Link>
      </div>
    </div>
  );
}
