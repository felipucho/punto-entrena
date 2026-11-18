"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deshacerAccion } from "./acciones";
import { IconoDeshacer } from "./iconos";

/** "Deshacer" de una fila de Últimos cambios. Pregunta antes, y al terminar recarga la lista. */
export default function BotonDeshacer({ id, que }: { id: number; que: string }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function deshacer() {
    if (!window.confirm(`¿Deshacer: ${que}?`)) return;
    setError(null);
    empezar(async () => {
      try {
        const r = await deshacerAccion(id);
        if (r.ok) router.refresh();
        else setError(r.error);
      } catch {
        setError("No se pudo deshacer. Revisá la conexión y probá de nuevo.");
      }
    });
  }

  return (
    <>
      <button type="button" onClick={deshacer} disabled={pendiente} aria-busy={pendiente} className="panel-enlace panel-deshacer">
        <IconoDeshacer />
        {pendiente ? "Deshaciendo…" : "Deshacer"}
        <span className="sr-only">: {que}</span>
      </button>
      {error && (
        <p className="panel-mensaje panel-cambio-error" data-tipo="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
