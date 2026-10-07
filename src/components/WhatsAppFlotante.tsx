"use client";

import { useEffect, useState } from "react";
import { IconoWhatsApp } from "@/components/BotonWhatsApp";
import { negocio } from "@/data/site";
import { urlWhatsApp } from "@/lib/whatsapp";

/** Scroll a partir del cual aparece en el celular. */
const UMBRAL = 120;

/**
 * Botón fijo abajo a la derecha, en todas las páginas: la cápsula amarilla de las historias, con un anillo negro
 * fino para que se despegue también de las placas amarillas. Entra desde abajo después de la primera vista.
 * En el celular arranca escondido (data-oculto) y aparece al scrollear, para no tapar lo que queda abajo de la
 * primera pantalla (el CTA de /planes, una celda de la grilla); en páginas que casi no scrollean aparece de una.
 */
export default function WhatsAppFlotante() {
  const [oculto, setOculto] = useState(true);

  useEffect(() => {
    let cuadro = 0;

    function medir() {
      cuadro = 0;
      const recorrido = document.documentElement.scrollHeight - window.innerHeight;
      setOculto(window.scrollY < UMBRAL && recorrido > UMBRAL);
    }

    function alCambiar() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }

    medir();
    window.addEventListener("scroll", alCambiar, { passive: true });
    window.addEventListener("resize", alCambiar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alCambiar);
      window.removeEventListener("resize", alCambiar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <a
      href={urlWhatsApp(negocio.mensajeWhatsappGeneral)}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp (se abre en una pestaña nueva)"
      data-oculto={oculto || undefined}
      className="btn-flotante fixed right-4 bottom-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-fg transition-[background-color,translate,scale,opacity,visibility] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover active:scale-[.97] sm:right-6 sm:bottom-6"
    >
      <IconoWhatsApp className="size-5 shrink-0" />
      WhatsApp
    </a>
  );
}
