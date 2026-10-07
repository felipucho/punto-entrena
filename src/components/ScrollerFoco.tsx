"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/**
 * Un <div> igual a cualquier otro (mismos atributos, mismo markup) para los contenedores que scrollean en
 * horizontal: cuando se enfoca con teclado un descendiente, lo trae a la vista. Chrome solo scrollea hasta el foco
 * si el elemento queda totalmente fuera; uno cortado a la mitad quedaría con el anillo de foco tapado.
 * Con mouse o toque no se mueve nada (:focus-visible): el scroll en plena pulsación haría errar el click.
 * El tabIndex que se le pase solo vale mientras el contenido desborda: si no hay nada que scrollear (escritorio),
 * el contenedor no es una parada más del Tab.
 */
export default function ScrollerFoco({ onFocusCapture, tabIndex, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [desborda, setDesborda] = useState(true);

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const medir = () => setDesborda(scroller.scrollWidth > scroller.clientWidth);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(scroller);
    if (scroller.firstElementChild) observador.observe(scroller.firstElementChild);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      {...props}
      ref={ref}
      tabIndex={desborda ? tabIndex : undefined}
      onFocusCapture={(evento) => {
        onFocusCapture?.(evento);
        const foco = evento.target as Element;
        if (foco !== evento.currentTarget && foco.matches(":focus-visible")) {
          foco.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }}
    />
  );
}
