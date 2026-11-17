"use client";

import { useEffect, useRef, useState } from "react";
import ArticuloNovedad from "@/components/ArticuloNovedad";
import { MENSAJE_ALTO, MENSAJE_LISTA, MENSAJE_VALORES, type ValoresVistaPrevia } from "@/lib/vista-previa-novedad";

/** Lo que dibuja el iframe: la novedad con lo que el panel le manda, en la columna de texto del sitio. */
export default function VistaPrevia() {
  const [valores, setValores] = useState<ValoresVistaPrevia | null>(null);
  const [medida, setMedida] = useState<{ src: string; ancho: number; alto: number } | null>(null);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mismo origen que el panel y solo la ventana que nos incluye: nadie más puede mandar datos acá.
    const alRecibir = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== window.parent) return;
      if (e.data?.tipo === MENSAJE_VALORES) setValores(e.data.valores as ValoresVistaPrevia);
    };
    window.addEventListener("message", alRecibir);
    window.parent.postMessage({ tipo: MENSAJE_LISTA }, location.origin);
    return () => window.removeEventListener("message", alRecibir);
  }, []);

  // Tamaño real de la foto (con la orientación que le dio el celular, que el navegador ya aplica).
  const fotoSrc = valores?.fotoSrc ?? null;
  useEffect(() => {
    if (!fotoSrc) return;
    let vigente = true;
    const img = new Image();
    img.onload = () => vigente && setMedida({ src: fotoSrc, ancho: img.naturalWidth, alto: img.naturalHeight });
    img.src = fotoSrc;
    return () => {
      vigente = false;
    };
  }, [fotoSrc]);

  // El iframe no scrollea: le avisa al panel cuánto mide para que lo ajuste.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const avisar = () => window.parent.postMessage({ tipo: MENSAJE_ALTO, alto: Math.ceil(el.getBoundingClientRect().height) }, location.origin);
    const observador = new ResizeObserver(avisar);
    observador.observe(el);
    avisar();
    return () => observador.disconnect();
  }, []);

  const foto = fotoSrc && medida?.src === fotoSrc ? { src: fotoSrc, ancho: medida.ancho, alto: medida.alto } : undefined;
  const vacio = !valores || (valores.titulo.trim() === "" && valores.texto.trim() === "");

  return (
    <div ref={caja} className="contenedor py-4">
      <div className="max-w-[65ch]">
        {vacio ? (
          <p className="text-muted">Escribí el título y el texto para ver cómo queda.</p>
        ) : (
          <ArticuloNovedad
            fecha={valores.fecha ?? undefined}
            titulo={valores.titulo}
            texto={valores.texto}
            foto={foto}
            tamano={valores.tamano}
            sinOptimizar
          />
        )}
      </div>
    </div>
  );
}
