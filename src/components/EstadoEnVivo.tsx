"use client";

import { useSyncExternalStore } from "react";
import { getEstado, horarioGeneral } from "@/lib/horarios";

const INTERVALO_MS = 60 * 1000;

function suscribir(avisar: () => void) {
  const id = window.setInterval(avisar, INTERVALO_MS);
  return () => window.clearInterval(id);
}

// getEstado calcula siempre en la hora de Córdoba, no en la del dispositivo.
const estadoActual = () => getEstado(new Date());
// En el HTML estático no hay "ahora": se muestra el horario general.
const sinEstado = () => null;

/**
 * Una línea con el estado del gimnasio ("Abierto ahora · te atiende …").
 * El HTML estático trae el horario general y al montar se reemplaza por el estado en vivo.
 * Para que no haya salto de layout, los dos textos comparten la misma celda de grid: el horario
 * general queda invisible y sigue marcando el alto, a cualquier ancho o tamaño de letra.
 */
export default function EstadoEnVivo({ className = "" }: { className?: string }) {
  const estado = useSyncExternalStore(suscribir, estadoActual, sinEstado);

  return (
    <p className={`grid font-semibold ${className}`.trim()}>
      <span className={`[grid-area:1/1] ${estado ? "invisible" : ""}`}>{horarioGeneral()}</span>
      {estado && <span className="[grid-area:1/1] self-center">{estado}</span>}
    </p>
  );
}
