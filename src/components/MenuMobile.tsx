"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Enlace } from "@/lib/rutas";

type Props = {
  enlaces: readonly Enlace[];
  destacado: Enlace;
};

const ID_MENU = "menu-principal";

/** Las rutas del sitio son de un solo nivel: activo solo si coincide exacto (así un 404 no marca nada). */
function esActivo(ruta: string, href: string) {
  return ruta === href;
}

/**
 * Lista de la nav principal. Desde 1024 px se ve en línea (antes no entra en una fila); en pantallas
 * más chicas se reemplaza por un botón "Menú" que la despliega. Es cliente porque necesita la ruta (aria-current) y el estado abierto.
 * Los links igual vienen en el HTML estático.
 */
export default function MenuMobile({ enlaces, destacado }: Props) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(ruta);
  const boton = useRef<HTMLButtonElement>(null);

  // Cierra al navegar.
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta);
    setAbierto(false);
  }

  /*
   * Cierra con Escape (y devuelve el foco al botón) o cuando el foco o un toque se van afuera de la nav: con la
   * cabecera fija el menú queda clavado arriba y taparía lo que se está por usar.
   */
  useEffect(() => {
    if (!abierto) return;
    function alTocarTecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    }
    function alSalir(evento: Event) {
      const nav = boton.current?.closest("nav");
      if (nav && !nav.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("keydown", alTocarTecla);
    document.addEventListener("focusin", alSalir);
    document.addEventListener("pointerdown", alSalir);
    return () => {
      document.removeEventListener("keydown", alTocarTecla);
      document.removeEventListener("focusin", alSalir);
      document.removeEventListener("pointerdown", alSalir);
    };
  }, [abierto]);

  // Al pasar a escritorio (girar la tablet, agrandar la ventana) la lista queda en fila: el menú se da por cerrado.
  useEffect(() => {
    const escritorio = window.matchMedia("(min-width: 64rem)");
    function alCambiar() {
      if (escritorio.matches) setAbierto(false);
    }
    escritorio.addEventListener("change", alCambiar);
    return () => escritorio.removeEventListener("change", alCambiar);
  }, []);

  const cerrar = () => setAbierto(false);

  return (
    <>
      {/* Dos barras: la de abajo, amarilla y más corta; con el menú abierto se cruzan en una X. */}
      <button
        ref={boton}
        type="button"
        className="btn btn-menu lg:hidden"
        aria-expanded={abierto}
        aria-controls={ID_MENU}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span aria-hidden="true" className="menu-icono" />
        Menú
      </button>
      {/* La página actual se marca con el punto (mobile) o la barra amarilla (desktop), no solo con el color. */}
      <ul
        id={ID_MENU}
        className={`${abierto ? "flex" : "hidden"} menu-lista absolute inset-x-0 top-full z-30 flex-col border-b border-border bg-surface px-4 pt-1 pb-5 lg:static lg:flex lg:flex-row lg:items-center lg:gap-0.5 lg:border-0 lg:bg-transparent lg:p-0`}
      >
        {enlaces.map((enlace) => {
          const activo = esActivo(ruta, enlace.href);
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                onClick={cerrar}
                className="nav-enlace"
              >
                {enlace.label}
              </Link>
            </li>
          );
        })}
        <li className="mt-4 lg:mt-0 lg:ml-3">
          <Link
            href={destacado.href}
            aria-current={esActivo(ruta, destacado.href) ? "page" : undefined}
            onClick={cerrar}
            className="btn btn-primario w-full lg:w-auto"
          >
            {destacado.label}
          </Link>
        </li>
      </ul>
    </>
  );
}
