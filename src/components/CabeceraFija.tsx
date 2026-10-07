"use client";

import { useEffect, useRef } from "react";

/** Cuánto hay que quedarse quieto para que la cabecera, si quedó a medio camino, termine de entrar o de irse. */
const PAUSA = 180;

/**
 * Cabecera pegada arriba que acompaña el scroll: al bajar se va corriendo hacia arriba y al subir vuelve a entrar de a
 * poco, tanto como se subió (como la barra del navegador en el celular). Arriba de todo siempre está a la vista. Si se
 * frena a medio camino, termina de entrar o de irse, lo que quede más cerca. Con el menú abierto o el foco de teclado
 * adentro se queda entera. El corrimiento va directo al estilo (--desplazo), sin re-render en cada cuadro.
 */
export default function CabeceraFija({ children }: { children: React.ReactNode }) {
  const cabecera = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = cabecera.current;
    if (!el) return;
    let anterior = window.scrollY;
    let desplazo = 0;
    let cuadro = 0;
    let espera = 0;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");

    function aplicar(alto: number) {
      el!.style.setProperty("--desplazo", `${desplazo}px`);
      el!.toggleAttribute("data-despegada", window.scrollY > 0);
      el!.toggleAttribute("data-oculta", desplazo >= alto);
    }

    function acomodar() {
      const alto = el!.offsetHeight;
      if (desplazo <= 0 || desplazo >= alto) return;
      desplazo = desplazo < alto / 2 || window.scrollY < alto ? 0 : alto;
      el!.setAttribute("data-acomoda", "");
      aplicar(alto);
    }

    function medir() {
      cuadro = 0;
      const alto = el!.offsetHeight;
      const tope = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      // En iOS el rebote pasa del principio y del final: sin recortar, la vuelta del rebote de abajo se leería como subida.
      const y = Math.min(Math.max(window.scrollY, 0), tope);
      const delta = y - anterior;
      anterior = y;
      // Si se estaba acomodando, sigue desde donde va la transición y no desde su destino: si no, salta.
      if (el!.hasAttribute("data-acomoda")) {
        const enCurso = parseFloat(getComputedStyle(el!).translate.split(" ")[1] ?? "0");
        if (Number.isFinite(enCurso)) desplazo = -enCurso;
        el!.removeAttribute("data-acomoda");
      }

      // Entera con movimiento reducido, con el menú abierto o con el foco de teclado adentro; si no, se corre lo que se
      // movió la página, sin pasarse de su alto ni dejar un hueco arriba de todo.
      if (quieto.matches || el!.querySelector('[aria-expanded="true"], :focus-visible')) desplazo = 0;
      else desplazo = Math.min(Math.max(desplazo + delta, 0), alto, y);
      aplicar(alto);

      window.clearTimeout(espera);
      espera = window.setTimeout(acomodar, PAUSA);
    }

    function alDesplazar() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }

    // La primera medida también va en un cuadro: si se vuelve a una página ya bajada, la sombra aparece sola.
    cuadro = requestAnimationFrame(medir);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    quieto.addEventListener("change", alDesplazar);
    return () => {
      window.removeEventListener("scroll", alDesplazar);
      quieto.removeEventListener("change", alDesplazar);
      cancelAnimationFrame(cuadro);
      window.clearTimeout(espera);
    };
  }, []);

  return (
    <header ref={cabecera} className="cabecera sticky top-0 z-30 border-b border-border bg-bg bg-(image:--grano)">
      {children}
    </header>
  );
}
