"use client";

import { useState, useTransition } from "react";
import { formatearPrecio } from "@/lib/formato";
import { CAMPOS_PRECIOS, type Precios } from "@/lib/panel-contenido";
import { planes } from "@/data/site";
import { guardarPreciosAccion, type Respuesta } from "./acciones";
import { IconoAlerta, IconoTilde } from "./iconos";

/** Clases por mes de cada plan, para mostrar el precio por clase mientras se escribe (el mismo cálculo que el sitio). */
const PLAN_DE_CAMPO: Partial<Record<keyof Precios, string>> = { unaVez: "1-vez", dosVeces: "2-veces", tresVeces: "3-veces", paseLibre: "pase-libre" };

function porClase(campo: keyof Precios, valor: string): string {
  const monto = Number(valor);
  if (valor === "" || !Number.isInteger(monto) || monto <= 0) return "Escribí el precio";
  if (campo === "dia") return "Una clase suelta";
  const plan = planes.find((p) => p.id === PLAN_DE_CAMPO[campo]);
  return plan ? `${formatearPrecio(Math.round(monto / plan.clasesPorMes))} por clase` : "";
}

export default function FormularioPrecios({ inicial }: { inicial: Precios }) {
  const [guardados, setGuardados] = useState<Record<keyof Precios, string>>(() => aTexto(inicial));
  const [valores, setValores] = useState(guardados);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [pendiente, empezar] = useTransition();
  const cambiados = CAMPOS_PRECIOS.filter(({ campo }) => valores[campo] !== guardados[campo]).length;

  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setRespuesta(null);
    empezar(async () => {
      try {
        const r = await guardarPreciosAccion(datos);
        setRespuesta(r);
        if (r.ok) setGuardados(valores);
      } catch {
        setRespuesta({ ok: false, error: "No se pudo guardar. Revisá la conexión y probá de nuevo." });
      }
    });
  }

  return (
    <form onSubmit={alEnviar}>
      <div className="panel-precios">
        {CAMPOS_PRECIOS.map(({ campo, etiqueta }) => (
          <div key={campo} className="panel-precio" data-cambiado={valores[campo] !== guardados[campo] || undefined}>
            <label htmlFor={`precio-${campo}`}>{etiqueta}</label>
            <div className="panel-monto">
              <span aria-hidden="true">$</span>
              <input
                id={`precio-${campo}`}
                name={campo}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={valores[campo]}
                onChange={(e) => {
                  setRespuesta(null);
                  setValores((v) => ({ ...v, [campo]: e.target.value.replace(/\D/g, "") }));
                }}
                required
                aria-describedby={`por-clase-${campo}`}
              />
            </div>
            <p id={`por-clase-${campo}`} className="panel-por-clase">
              {porClase(campo, valores[campo])}
            </p>
          </div>
        ))}
      </div>
      <div className="panel-pie">
        <p className="panel-mensaje" data-tipo={respuesta ? (respuesta.ok ? "ok" : "error") : undefined} role="status" aria-live="polite">
          {respuesta ? (
            <>
              {respuesta.ok ? <IconoTilde /> : <IconoAlerta />}
              {respuesta.ok ? respuesta.mensaje : respuesta.error}
            </>
          ) : cambiados > 0 ? (
            cambiados === 1 ? "1 precio sin guardar." : `${cambiados} precios sin guardar.`
          ) : null}
        </p>
        {cambiados > 0 && (
          <button type="button" className="panel-boton" disabled={pendiente} onClick={() => setValores(guardados)}>
            Deshacer
          </button>
        )}
        <button type="submit" disabled={pendiente || cambiados === 0} aria-busy={pendiente} className="btn btn-primario">
          {pendiente ? "Guardando…" : "Guardar precios"}
        </button>
      </div>
    </form>
  );
}

function aTexto(p: Precios): Record<keyof Precios, string> {
  return Object.fromEntries(CAMPOS_PRECIOS.map(({ campo }) => [campo, String(p[campo])])) as Record<keyof Precios, string>;
}
