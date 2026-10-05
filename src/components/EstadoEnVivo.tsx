"use client";

import { useSyncExternalStore } from "react";
import { getEstado, horarioGeneral } from "@/lib/horarios";

const INTERVALO_MS = 60 * 1000;

/** Separador entre el estado y el detalle en el texto de getEstado ("Abierto ahora · te atiende …"). */
const SEPARADOR = " · ";

function suscribir(avisar: () => void) {
  const id = window.setInterval(avisar, INTERVALO_MS);
  return () => window.clearInterval(id);
}

// getEstado calcula siempre en la hora de Córdoba, no en la del dispositivo.
const estadoActual = () => getEstado(new Date());
// En el HTML estático no hay "ahora".
const sinEstado = () => null;

const MEDIA_HORA_MS = 30 * 60 * 1000;
const MEDIAS_HORAS_POR_SEMANA = 7 * 48;

/**
 * Todos los textos que puede devolver getEstado: se recorre una semana entera cada media hora (las franjas duran
 * al menos una hora). Sirven para reservar el alto, así no depende de qué hora sea al cargar la página.
 */
const ESTADOS_POSIBLES = [
  ...new Set(
    Array.from({ length: MEDIAS_HORAS_POR_SEMANA }, (_, i) => getEstado(new Date(i * MEDIA_HORA_MS))),
  ),
];

/** El titular en Anton y el detalle en Roboto. Lo usan el estado en vivo y los textos que reservan el alto. */
function TextoEstado({ estado }: { estado: string }) {
  const corte = estado.indexOf(SEPARADOR);
  return corte === -1 ? (
    <span className="estado-titular">{estado}</span>
  ) : (
    <>
      <span className="estado-titular">{estado.slice(0, corte)}</span>
      {estado.slice(corte)}
    </>
  );
}

/**
 * Una línea con el estado del gimnasio ("Abierto ahora · te atiende …"), con el toggle "ON" de las historias
 * adelante: abierto, pista amarilla con la perilla a la derecha y una luz que late; cerrado, apagado. El toggle es
 * decorativo: el texto dice el estado. "Abierto ahora" / "Cerrado" van en Anton y el detalle en Roboto; el texto
 * es el mismo que devuelve getEstado.
 * El HTML estático no sabe la hora: solo trae el horario general, para lectores de pantalla, y al montar se
 * reemplaza por el estado en vivo. Para que no haya salto de layout, todos los estados posibles van apilados e
 * invisibles en la misma celda de grid, con el mismo markup que el texto real: la celda mide el más alto, a
 * cualquier ancho o tamaño de letra.
 * Solo el texto en vivo es una región aria-live: el DOM cambia únicamente cuando cambia el estado (React no
 * toca el texto si getEstado devuelve lo mismo), y como se monta junto con el primer estado, ese no se anuncia.
 */
export default function EstadoEnVivo({ className = "" }: { className?: string }) {
  const estado = useSyncExternalStore(suscribir, estadoActual, sinEstado);
  const situacion = estado === null ? "desconocido" : estado.startsWith("Abierto") ? "abierto" : "cerrado";

  return (
    <p data-estado={situacion} className={`estado font-semibold ${className}`.trim()}>
      <span aria-hidden="true" className="estado-toggle">
        <span className="estado-perilla" />
      </span>
      <span className="grid">
        {ESTADOS_POSIBLES.map((posible) => (
          <span key={posible} aria-hidden="true" className="invisible [grid-area:1/1]">
            <TextoEstado estado={posible} />
          </span>
        ))}
        {estado ? (
          <span aria-live="polite" aria-atomic="true" className="[grid-area:1/1] self-center">
            <TextoEstado estado={estado} />
          </span>
        ) : (
          <span className="sr-only">{horarioGeneral()}</span>
        )}
      </span>
    </p>
  );
}
