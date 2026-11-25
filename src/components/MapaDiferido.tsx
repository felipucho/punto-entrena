"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/**
 * iframe del mapa que recién pide Google Maps (~450 KB de JS) cuando la página terminó de cargar y el mapa está a
 * 300 px de la pantalla. El
 * loading="lazy" del navegador no alcanzaba: Chrome lo carga desde ~1250–2500 px antes, o sea, en un celular,
 * apenas abre /contacto. Sin src el iframe ya ocupa su lugar, así que no mueve el layout.
 */
export default function MapaDiferido({ src, ...props }: ComponentProps<"iframe">) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCerca(true);
          observador.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    // En un celular el mapa queda apenas debajo del primer pantallazo: sin esperar al load, competiría igual con él.
    const observar = () => observador.observe(iframe);
    if (document.readyState === "complete") observar();
    else window.addEventListener("load", observar, { once: true });
    return () => {
      window.removeEventListener("load", observar);
      observador.disconnect();
    };
  }, []);

  return <iframe ref={ref} src={cerca ? src : undefined} {...props} />;
}
