import Link from "next/link";
import CabeceraFija from "@/components/CabeceraFija";
import Isotipo from "@/components/Isotipo";
import MenuMobile from "@/components/MenuMobile";
import { negocio } from "@/data/site";
import { nombreCorto } from "@/lib/formato";
import { enlaceContacto, navegacion } from "@/lib/rutas";

/** "Entrenamiento y Salud": lo que sigue al nombre corto, en la bajada del logo. */
const bajada = negocio.nombre.slice(nombreCorto.length).trim();

export default function Header() {
  return (
    <CabeceraFija>
      <div className="contenedor flex min-h-18 items-center justify-between gap-4 py-3">
        {/*
         * Isotipo redibujado + el nombre como texto, armado como el logo horizontal: PUNTO en itálica negra y la
         * bajada chica y espaciada en amarillo. Se lee "Punto Entrenamiento y Salud". Por debajo de 440 px la bajada
         * queda solo para lectores de pantalla, para que entre el botón del menú.
         * TODO: reemplazar el isotipo por el vector original cuando esté.
         */}
        <Link href="/" prefetch={false} className="marca">
          <Isotipo className="h-10 w-auto shrink-0" />
          <span>
            <span className="marca-nombre">{nombreCorto}</span>{" "}
            <span className="marca-bajada max-[27.5rem]:sr-only">{bajada}</span>
          </span>
        </Link>
        <nav aria-label="Principal">
          <MenuMobile enlaces={navegacion} destacado={enlaceContacto} />
          {/*
           * Sin JavaScript el botón "Menú" no abre nada: se oculta y la lista queda a la vista, en fila y con salto de
           * renglón. Con !important le gana al display: none de la utilidad hidden. Tampoco queda fija: con la lista en
           * fila puede ocupar varios renglones.
           */}
          <noscript>
            <style>{`#menu-principal{display:flex!important;position:static!important;flex-flow:row wrap!important;gap:.25rem .75rem;border:0!important;background:transparent!important;padding:0!important}.btn-menu{display:none!important}header .contenedor{flex-wrap:wrap}.cabecera{position:relative!important}`}</style>
          </noscript>
        </nav>
      </div>
    </CabeceraFija>
  );
}
