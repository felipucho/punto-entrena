import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import MenuMobile from "@/components/MenuMobile";
import { negocio } from "@/data/site";
import { nombreCorto } from "@/lib/formato";
import { enlaceContacto, navegacion } from "@/lib/rutas";

/** "Entrenamiento y Salud": lo que sigue al nombre corto, en la bajada del logo. */
const bajada = negocio.nombre.slice(nombreCorto.length).trim();

export default function Header() {
  return (
    <header className="relative z-30 border-b border-border bg-bg">
      <div className="contenedor flex min-h-18 items-center justify-between gap-4 py-3">
        {/*
         * Isotipo redibujado + el nombre como texto, armado como el logo horizontal: PUNTO en itálica negra y la
         * bajada chica y espaciada en amarillo. Se lee "Punto Entrenamiento y Salud". Por debajo de 440 px la bajada
         * queda solo para lectores de pantalla, para que entre el botón del menú.
         * TODO: reemplazar el isotipo por el vector original cuando esté.
         */}
        <Link href="/" className="marca">
          <Isotipo className="h-10 w-auto shrink-0" />
          <span>
            <span className="marca-nombre">{nombreCorto}</span>{" "}
            <span className="marca-bajada max-[27.5rem]:sr-only">{bajada}</span>
          </span>
        </Link>
        <nav aria-label="Principal">
          <MenuMobile enlaces={navegacion} destacado={enlaceContacto} />
        </nav>
      </div>
    </header>
  );
}
