"use client";

import { useEffect, useRef, useState } from "react";

/** Cuánto hay que bajar o subir seguido para que la cabecera se vaya o vuelva: filtra el temblor del dedo. */
const UMBRAL = 12;

/**
 * Cabecera pegada arriba: se va al bajar y vuelve al subir, así el contenido tiene toda la pantalla mientras se lee.
 * Arriba de todo siempre está a la vista. Acá solo se marca el estado (data-oculta, data-despegada); el movimiento y
 * las excepciones (menú abierto, foco de teclado adentro) van en CSS. El contenido llega armado desde Header.
 */
export default function CabeceraFija({ children }: { children: React.ReactNode }) {
  const cabecera = useRef<HTMLElement>(null);
  const [oculta, setOculta] = useState(false);
  const [despegada, setDespegada] = useState(false);

  useEffect(() => {
    let anterior = window.scrollY;
    let recorrido = 0;
    let cuadro = 0;

    function medir() {
      cuadro = 0;
      const tope = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      // En iOS el rebote pasa del principio y del final: sin recortar, la vuelta del rebote de abajo se leería como subida.
      const y = Math.min(Math.max(window.scrollY, 0), tope);
      const delta = y - anterior;
      anterior = y;
      setDespegada(y > 0);

      // Hasta que la cabecera no salió entera de pantalla, no hay nada que esconder.
      if (y <= (cabecera.current?.offsetHeight ?? 0)) {
        recorrido = 0;
        setOculta(false);
        return;
      }

      // Si cambió de sentido, se empieza a contar de nuevo.
      if (delta * recorrido < 0) recorrido = 0;
      recorrido += delta;
      if (recorrido > UMBRAL) setOculta(true);
      else if (recorrido < -UMBRAL) setOculta(false);
    }

    function alDesplazar() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }

    // La primera medida también va en un cuadro: si se vuelve a una página ya bajada, la sombra aparece sola.
    cuadro = requestAnimationFrame(medir);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alDesplazar);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <header
      ref={cabecera}
      data-oculta={oculta || undefined}
      data-despegada={despegada || undefined}
      className="cabecera sticky top-0 z-30 border-b border-border bg-bg bg-(image:--grano)"
    >
      {children}
      {/* La barra de la P que se estira con la lectura, con el punto en la punta (ver .cabecera-progreso). */}
      <span aria-hidden="true" className="cabecera-progreso" />
    </header>
  );
}
