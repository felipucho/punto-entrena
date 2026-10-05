"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export type OpcionSelector = {
  /**
   * id del botón de la opción. Un link a "#id" la abre: desde otra página (por ejemplo /equipo#gino-magnani)
   * o desde esta misma. El panel usa "id-panel", así que ninguno de los dos ids se puede repetir en la página.
   */
  id: string;
  /** Contenido visible del botón: un texto, o foto y nombre. Es también el nombre accesible del panel. */
  etiqueta: ReactNode;
  /** Lo que se muestra al elegir la opción. */
  contenido: ReactNode;
};

type Props = {
  opciones: readonly OpcionSelector[];
  /** Nombre accesible de la fila de botones, por ejemplo "Objetivos". */
  titulo: string;
  /** Clases de la fila de botones (flex, grid, gap…). */
  claseLista?: string;
  /** Clases de cada botón. La opción elegida se marca con la variante aria-selected: de Tailwind. */
  claseBoton?: string;
  /** Clases del panel visible. */
  clasePanel?: string;
};

function suscribirHash(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  window.addEventListener("popstate", avisar);
  return () => {
    window.removeEventListener("hashchange", avisar);
    window.removeEventListener("popstate", avisar);
  };
}

const hashActual = () => window.location.hash.slice(1);
// En el HTML estático no hay hash: se muestra la primera opción.
const sinHash = () => "";

/**
 * Fila de botones (pestañas) que muestra el contenido de una opción por vez, para no apilar todo en la página.
 * Sigue el patrón de pestañas de WAI-ARIA: flechas izquierda y derecha, Inicio y Fin.
 * Todos los paneles vienen en el HTML estático; los que no están elegidos quedan con el atributo hidden.
 * El panel elegido entra animado solo después de un cambio (data-entra); en la carga inicial pinta quieto.
 */
export default function Selector({ opciones, titulo, claseLista = "", claseBoton = "", clasePanel = "" }: Props) {
  const hash = useSyncExternalStore(suscribirHash, hashActual, sinHash);
  const [elegida, setElegida] = useState<string | null>(null);
  const [hashAnterior, setHashAnterior] = useState(hash);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  // Un hash nuevo (link, atrás o adelante) manda sobre la última opción tocada.
  if (hash !== hashAnterior) {
    setHashAnterior(hash);
    setElegida(null);
  }

  const ids = opciones.map((opcion) => opcion.id);
  const claveIds = ids.join(" ");
  const activa = elegida ?? (ids.includes(hash) ? hash : ids[0]);

  // La opción que pintó el HTML. El panel entra animado (data-entra) recién cuando la activa deja de ser esa: en la
  // carga pinta quieto, y tocar la pestaña que ya está abierta no lo anima.
  const [activaInicial] = useState(activa);
  const [cambio, setCambio] = useState(false);
  if (!cambio && activa !== activaInicial) setCambio(true);

  // Next.js navega a "#id" de la misma página con history.pushState, que no dispara hashchange:
  // esos clicks se leen del link mismo.
  useEffect(() => {
    const validos = claveIds.split(" ");
    function alHacerClick(evento: MouseEvent) {
      if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const enlace = evento.target instanceof Element ? evento.target.closest("a[href]") : null;
      if (!(enlace instanceof HTMLAnchorElement)) return;
      const destino = new URL(enlace.href);
      if (destino.origin !== window.location.origin || destino.pathname !== window.location.pathname) return;
      const id = destino.hash.slice(1);
      if (validos.includes(id)) setElegida(id);
    }
    document.addEventListener("click", alHacerClick);
    return () => document.removeEventListener("click", alHacerClick);
  }, [claveIds]);

  // replaceState no dispara hashchange ni scroll ni suma una entrada al historial; el render que sigue a setElegida
  // relee el hash (useSyncExternalStore) y, como ya coincide con la opción elegida, no cambia nada.
  function elegir(id: string) {
    if (hashActual() !== id) window.history.replaceState(null, "", `#${id}`);
    setElegida(id);
  }

  function alTocarTecla(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ultimo = opciones.length - 1;
    let destino: number;
    switch (evento.key) {
      case "ArrowRight":
        destino = indice === ultimo ? 0 : indice + 1;
        break;
      case "ArrowLeft":
        destino = indice === 0 ? ultimo : indice - 1;
        break;
      case "Home":
        destino = 0;
        break;
      case "End":
        destino = ultimo;
        break;
      default:
        return;
    }
    evento.preventDefault();
    elegir(opciones[destino].id);
    botones.current[destino]?.focus();
  }

  if (opciones.length === 0) return null;

  return (
    <>
      {/*
       * Sin JavaScript las pestañas no andan: se ocultan y se muestran todos los paneles, uno debajo del otro.
       * Va en @layer base para ganarle al [hidden] { display: none !important } del preflight de Tailwind.
       */}
      <noscript>
        <style>{`@layer base{[role="tablist"]{display:none!important}[role="tabpanel"][hidden]{display:block!important}}`}</style>
      </noscript>
      <div role="tablist" aria-label={titulo} className={claseLista}>
        {opciones.map((opcion, indice) => {
          const esActiva = opcion.id === activa;
          return (
            <button
              key={opcion.id}
              ref={(boton) => {
                botones.current[indice] = boton;
              }}
              type="button"
              role="tab"
              id={opcion.id}
              aria-selected={esActiva}
              aria-controls={`${opcion.id}-panel`}
              tabIndex={esActiva ? 0 : -1}
              onClick={() => elegir(opcion.id)}
              onKeyDown={(evento) => alTocarTecla(evento, indice)}
              className={claseBoton}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
      {opciones.map((opcion) => (
        <div
          key={opcion.id}
          role="tabpanel"
          id={`${opcion.id}-panel`}
          aria-labelledby={opcion.id}
          tabIndex={0}
          hidden={opcion.id !== activa}
          data-entra={cambio || undefined}
          className={clasePanel}
        >
          {opcion.contenido}
        </div>
      ))}
    </>
  );
}
