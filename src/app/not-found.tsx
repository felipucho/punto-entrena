import type { Metadata } from "next";
import Link from "next/link";
import { negocio } from "@/data/site";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: `La página que buscás no existe en el sitio de ${negocio.nombre}.`,
};

export default function NoEncontrada() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>No encontramos esta página</h1>
      <p className="intro mt-4">
        Puede que el enlace esté mal escrito o que la página ya no exista.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primario">
          Ir al inicio
        </Link>
        <Link href="/contacto" className="btn btn-secundario">
          Ver cómo contactarnos
        </Link>
      </div>
    </div>
  );
}
