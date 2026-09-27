"use client";

import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

/*
 * Specs de exportación del video del hero (se sube después a public/video/):
 * - 10 a 15 s en loop, sin audio.
 * - 2 a 4 MB por archivo.
 * - H.264 (.mp4) y WebM (.webm), en 1080 p (hero-1080.*) y 720 p (hero-720.*).
 * - Poster: hero-poster.jpg, primer cuadro del video.
 * Si falta algún archivo, el build no falla: se ve el poster o, sin poster, el fondo oscuro.
 */

const POSTER = "/video/hero-poster.jpg";
const MOVIMIENTO_REDUCIDO = "(prefers-reduced-motion: reduce)";
const PANTALLA_CHICA = "(max-width: 768px)";

type Calidad = "720" | "1080" | null;

type ConexionConAhorro = { saveData?: boolean };

function suscribir(avisar: () => void) {
  const consultas = [window.matchMedia(MOVIMIENTO_REDUCIDO), window.matchMedia(PANTALLA_CHICA)];
  consultas.forEach((c) => c.addEventListener("change", avisar));
  return () => consultas.forEach((c) => c.removeEventListener("change", avisar));
}

/** Qué video cargar. null = solo el poster (movimiento reducido o ahorro de datos). */
function calidadElegida(): Calidad {
  if (window.matchMedia(MOVIMIENTO_REDUCIDO).matches) return null;
  const conexion = (navigator as Navigator & { connection?: ConexionConAhorro }).connection;
  if (conexion?.saveData) return null;
  return window.matchMedia(PANTALLA_CHICA).matches ? "720" : "1080";
}

// En el HTML estático no se carga video: solo el poster.
const sinVideo = (): Calidad => null;

type Reproduccion = "sin-video" | "reproduciendo" | "pausado";

/**
 * Hero con video de fondo, overlay oscuro y el contenido como texto real encima.
 * El video se mueve más de 5 s, así que tiene un botón para pausarlo (WCAG 2.2.2). El botón
 * aparece recién cuando el video empieza a reproducirse: sin archivos en public/video no se ve.
 */
export default function HeroVideo({ children }: { children: ReactNode }) {
  const calidad = useSyncExternalStore(suscribir, calidadElegida, sinVideo);
  const video = useRef<HTMLVideoElement | null>(null);
  // La pausa que eligió la persona se respeta aunque el <video> se vuelva a montar (cambio de 720 a 1080).
  const pausadoPorUsuario = useRef(false);
  const [reproduccion, setReproduccion] = useState<Reproduccion>("sin-video");

  // Callback estable: si cambiara en cada render, React lo volvería a llamar en cada actualización.
  const conectarVideo = useCallback((elemento: HTMLVideoElement | null) => {
    video.current = elemento;
    if (!elemento) return;
    // muted como propiedad: algunos navegadores lo exigen para el autoplay.
    elemento.muted = true;
    if (pausadoPorUsuario.current) {
      elemento.pause();
    } else {
      elemento.play().catch(() => {
        // Si el navegador bloquea el autoplay, queda el poster.
      });
    }
  }, []);

  function alternarVideo() {
    const elemento = video.current;
    if (!elemento) return;
    if (elemento.paused) {
      pausadoPorUsuario.current = false;
      elemento.play().catch(() => {});
    } else {
      pausadoPorUsuario.current = true;
      elemento.pause();
    }
  }

  // El hero termina en el corte de la pata de la P: .hero recorta la sección y deja ver la cuña amarilla entre su
  // corte y el de las capas (.hero-capa). Foto y video van desaturados, como en las placas.
  return (
    <section className="superficie-oscura hero relative isolate overflow-hidden text-sobre-oscuro">
      <div
        aria-hidden="true"
        className="hero-capa hero-foto absolute inset-0 bg-oscuro bg-cover bg-center"
        style={{ backgroundImage: `url(${POSTER})` }}
      />
      {calidad && (
        <video
          key={calidad}
          ref={conectarVideo}
          onPlaying={() => setReproduccion("reproduciendo")}
          onPause={() => setReproduccion("pausado")}
          className="hero-capa hero-foto absolute inset-0 h-full w-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          aria-hidden="true"
          poster={POSTER}
        >
          <source src={`/video/hero-${calidad}.webm`} type="video/webm" />
          <source src={`/video/hero-${calidad}.mp4`} type="video/mp4" />
        </video>
      )}
      <div aria-hidden="true" className="hero-capa hero-velo absolute inset-0" />
      <div className="relative">{children}</div>
      {calidad && reproduccion !== "sin-video" && (
        <button
          type="button"
          onClick={alternarVideo}
          data-pausado={reproduccion === "pausado" || undefined}
          className="btn btn-pausa absolute top-4 right-4 min-h-11 px-3.5 py-1.5 text-sm sm:top-6 sm:right-6"
        >
          {reproduccion === "pausado" ? "Reproducir video" : "Pausar video"}
        </button>
      )}
    </section>
  );
}
