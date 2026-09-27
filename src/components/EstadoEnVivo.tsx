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
// En el HTML estático no hay "ahora": se muestra el horario general.
const sinEstado = () => null;

/**
 * Una línea con el estado del gimnasio ("Abierto ahora · te atiende …"), con el toggle "ON" de las historias
 * adelante: abierto, pista amarilla con la perilla a la derecha y una luz que late; cerrado, apagado. El toggle es
 * decorativo: el texto dice el estado. "Abierto ahora" / "Cerrado" van en Anton y el detalle en Roboto; el texto
 * es el mismo que devuelve getEstado.
 * El HTML estático trae el horario general y al montar se reemplaza por el estado en vivo.
 * Para que no haya salto de layout, los dos textos comparten la misma celda de grid: el horario
 * general queda invisible y sigue marcando el alto, a cualquier ancho o tamaño de letra.
 */
export default function EstadoEnVivo({ className = "" }: { className?: string }) {
  const estado = useSyncExternalStore(suscribir, estadoActual, sinEstado);
  const situacion = estado === null ? "desconocido" : estado.startsWith("Abierto") ? "abierto" : "cerrado";
  const corte = estado?.indexOf(SEPARADOR) ?? -1;

  return (
    <p data-estado={situacion} className={`estado font-semibold ${className}`.trim()}>
      <span aria-hidden="true" className="estado-toggle">
        <span className="estado-perilla" />
      </span>
      <span className="grid">
        <span className={`[grid-area:1/1] ${estado ? "invisible" : ""}`}>{horarioGeneral()}</span>
        {estado && (
          <span className="[grid-area:1/1] self-center">
            {corte === -1 ? (
              <span className="estado-titular">{estado}</span>
            ) : (
              <>
                <span className="estado-titular">{estado.slice(0, corte)}</span>
                {estado.slice(corte)}
              </>
            )}
          </span>
        )}
      </span>
    </p>
  );
}
