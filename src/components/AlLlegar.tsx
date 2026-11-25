"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/**
 * Enlace a otro sitio que, la primera vez que entra entero en pantalla, pasa `data-llego` a "si" y un rato después a
 * "volvio". Solo cambia ese dato: el movimiento lo hacen las transiciones del CSS, que trabajan al afinarse y al volver
 * pero no durante la pausa. Si la persona pidió menos movimiento, no hace nada.
 */
export default function AlLlegar(props: ComponentProps<"a">) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [llego, setLlego] = useState<"si" | "volvio">();

  useEffect(() => {
    const enlace = ref.current;
    if (!enlace || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        timers.push(
          window.setTimeout(() => setLlego("si"), 300),
          window.setTimeout(() => setLlego("volvio"), 1600),
        );
      },
      { threshold: 1 },
    );
    observador.observe(enlace);
    return () => {
      observador.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return <a {...props} ref={ref} target="_blank" rel="noopener" data-llego={llego} />;
}
