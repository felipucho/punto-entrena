"use client";

import { useEffect, useState } from "react";

/**
 * Flecha para volver arriba, apilada encima del botón de WhatsApp. Aparece cerca del final de las páginas largas:
 * pasados tres cuartos de pantalla y con menos de una pantalla por delante. Sube con scroll suave (de golpe con
 * movimiento reducido) y deja el foco en el logo, para que el teclado siga desde arriba y no se pierda cuando la
 * flecha se esconde. El aspecto y la animación van en .btn-arriba.
 */
export default function VolverArriba() {
  const [visible, setVisible] = useState(false);
  const [despega, setDespega] = useState(false);

  useEffect(() => {
    let cuadro = 0;

    function medir() {
      cuadro = 0;
      const pantalla = window.innerHeight;
      const y = window.scrollY;
      const restante = document.documentElement.scrollHeight - pantalla - y;
      setVisible(y > pantalla * 0.75 && restante < pantalla);
    }

    function alCambiar() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }

    cuadro = requestAnimationFrame(medir);
    window.addEventListener("scroll", alCambiar, { passive: true });
    window.addEventListener("resize", alCambiar, { passive: true });
    // Si la página cambia de alto sin scroll (una duda del FAQ que se abre), también cambia cuánto falta.
    const observador = new ResizeObserver(alCambiar);
    observador.observe(document.body);
    return () => {
      window.removeEventListener("scroll", alCambiar);
      window.removeEventListener("resize", alCambiar);
      observador.disconnect();
      cancelAnimationFrame(cuadro);
    };
  }, []);

  function subir() {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!quieto) setDespega(true);
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    document.querySelector<HTMLElement>(".cabecera .marca")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Volver arriba"
      data-visible={visible || undefined}
      data-despega={despega || undefined}
      className="btn-arriba"
    >
      <span aria-hidden="true" className="btn-arriba-flecha" onAnimationEnd={() => setDespega(false)} />
    </button>
  );
}
