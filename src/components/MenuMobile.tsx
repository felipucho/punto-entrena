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

  // Cierra con Escape y devuelve el foco al botón.
  useEffect(() => {
    if (!abierto) return;
    function alTocarTecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    }
    document.addEventListener("keydown", alTocarTecla);
    return () => document.removeEventListener("keydown", alTocarTecla);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="btn btn-secundario lg:hidden"
        aria-expanded={abierto}
        aria-controls={ID_MENU}
        onClick={() => setAbierto((valor) => !valor)}
      >
        Menú
      </button>
      <ul
        id={ID_MENU}
        className={`${abierto ? "flex" : "hidden"} absolute inset-x-0 top-full z-30 flex-col gap-1 border-b border-border bg-bg px-4 pt-2 pb-4 lg:static lg:flex lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:p-0`}
      >
        {enlaces.map((enlace) => {
          const activo = esActivo(ruta, enlace.href);
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                onClick={cerrar}
                className={`block rounded-card px-3 py-2.5 hover:bg-surface lg:py-2 ${
                  activo ? "font-semibold underline decoration-2 underline-offset-[0.35em]" : ""
                }`}
              >
                {enlace.label}
              </Link>
            </li>
          );
        })}
        <li className="mt-2 lg:mt-0 lg:ml-2">
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
