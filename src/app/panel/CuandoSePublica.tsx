"use client";

import { useId, useRef } from "react";
import { fechaArgentina, formatearFecha, instanteDePublicacion } from "@/lib/novedades-fechas";
import { IconoCalendario, IconoReloj, IconoTilde } from "./iconos";

/*
 * "Cuándo se publica": primero la pregunta (ahora o programada), después el día en botones y la hora en dos listas.
 * Abajo, una frase con el día y la hora exactos. Todo en hora de Argentina; el valor es "YYYY-MM-DDTHH:mm" como siempre.
 *
 * Modos: "ahora" (la fecha se pone al guardar), "programar" (la elige Mati) y "mantener" (una novedad ya publicada que
 * se corrige: conserva su fecha y no salta arriba de la lista).
 */
export type ModoPublicacion = "ahora" | "programar" | "mantener";

const DIAS_A_LA_VISTA = 14;
const MINUTOS = ["00", "15", "30", "45"];
const HORAS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

const fmtDiaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" });
const fmtDiaLargo = new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: "UTC" });
const fmtMes = new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: "UTC" });

const sinPunto = (s: string) => s.replace(".", "");
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "2026-11-18" → instante UTC de ese día a las 00:00 (solo para calcular el día de la semana y sumar días). */
const diaUTC = (dia: string) => Date.UTC(Number(dia.slice(0, 4)), Number(dia.slice(5, 7)) - 1, Number(dia.slice(8, 10)));
const sumarDias = (dia: string, n: number) => new Date(diaUTC(dia) + n * 86_400_000).toISOString().slice(0, 10);
const diasEntre = (desde: string, hasta: string) => Math.round((diaUTC(hasta) - diaUTC(desde)) / 86_400_000);

function nombreDia(dia: string, hoy: string): string {
  const d = diasEntre(hoy, dia);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  return mayuscula(sinPunto(fmtDiaSemana.format(diaUTC(dia))));
}

/** "Hoy", "mañana", "el jueves 20 de noviembre": para la frase de abajo. */
function cuandoEnPalabras(fecha: string, hoy: string): string {
  const dia = fecha.slice(0, 10);
  const d = diasEntre(hoy, dia);
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  return `el ${fmtDiaLargo.format(diaUTC(dia))} ${formatearFecha(dia).replace(/ de \d{4}$/, "")}`;
}

type Props = {
  modo: ModoPublicacion;
  onModo: (modo: ModoPublicacion) => void;
  fecha: string;
  onFecha: (fecha: string) => void;
  /** La fecha guardada de una novedad ya publicada, o null si es nueva o estaba en cola. */
  publicadaEl: string | null;
  ahora: number;
};

export default function CuandoSePublica({ modo, onModo, fecha, onFecha, publicadaEl, ahora }: Props) {
  const id = useId();
  const otraFecha = useRef<HTMLInputElement>(null);
  const hoy = fechaArgentina(ahora).slice(0, 10);
  const dia = fecha.slice(0, 10);
  const hora = fecha.slice(11, 13);
  const minuto = fecha.slice(14, 16);
  const dias = Array.from({ length: DIAS_A_LA_VISTA }, (_, i) => sumarDias(hoy, i));
  const diaFueraDeLista = !dias.includes(dia) && diasEntre(hoy, dia) > 0;
  const minutos = MINUTOS.includes(minuto) ? MINUTOS : [...MINUTOS, minuto].sort();
  const yaPaso = modo === "programar" && instanteDePublicacion(fecha) <= ahora;

  const opciones: { valor: ModoPublicacion; titulo: string; detalle: string }[] = [
    publicadaEl
      ? { valor: "mantener", titulo: "Dejarla como está", detalle: `Publicada el ${formatearFecha(publicadaEl)}` }
      : { valor: "ahora", titulo: "Ahora", detalle: "Sale apenas guardes" },
    { valor: "programar", titulo: "Programarla", detalle: "Elegís el día y la hora" },
  ];

  function elegirModo(nuevo: ModoPublicacion) {
    // Al programar por primera vez, se propone mañana a las 8: casi nunca se programa algo para dentro de un minuto.
    if (nuevo === "programar" && instanteDePublicacion(fecha) <= ahora) onFecha(`${sumarDias(hoy, 1)}T08:00`);
    onModo(nuevo);
  }

  return (
    <fieldset className="panel-cuando">
      <legend className="panel-etiqueta">Cuándo se publica</legend>

      <div className="panel-modos">
        {opciones.map((o) => (
          <label key={o.valor}>
            <input type="radio" name={`${id}-modo`} value={o.valor} checked={modo === o.valor} onChange={() => elegirModo(o.valor)} />
            <span className="panel-modo-titulo">{o.titulo}</span>
            <span className="panel-modo-detalle">{o.detalle}</span>
          </label>
        ))}
      </div>

      {modo === "programar" && (
        <div className="panel-programar">
          <div className="panel-campo">
            <span className="panel-subetiqueta" id={`${id}-dia`}>
              Día
            </span>
            <div className="panel-dias" role="radiogroup" aria-labelledby={`${id}-dia`}>
              {diaFueraDeLista && <BotonDia dia={dia} hoy={hoy} elegido onElegir={() => {}} />}
              {dias.map((d) => (
                <BotonDia key={d} dia={d} hoy={hoy} elegido={d === dia} onElegir={() => onFecha(`${d}T${hora}:${minuto}`)} />
              ))}
              <button
                type="button"
                className="panel-dia-boton panel-dia-otra"
                onClick={() => {
                  const input = otraFecha.current;
                  if (!input) return;
                  try {
                    input.showPicker();
                  } catch {
                    input.focus();
                  }
                }}
              >
                <IconoCalendario />
                <small>Otra fecha</small>
              </button>
              <input
                ref={otraFecha}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                className="panel-oculto"
                min={hoy}
                value={dia}
                onChange={(e) => e.target.value && onFecha(`${e.target.value}T${hora}:${minuto}`)}
              />
            </div>
          </div>

          <div className="panel-campo">
            <span className="panel-subetiqueta" id={`${id}-hora`}>
              Hora
            </span>
            <div className="panel-hora" role="group" aria-labelledby={`${id}-hora`}>
              <select aria-label="Hora" value={hora} onChange={(e) => onFecha(`${dia}T${e.target.value}:${minuto}`)} className="panel-input">
                {HORAS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span aria-hidden="true">:</span>
              <select aria-label="Minutos" value={minuto} onChange={(e) => onFecha(`${dia}T${hora}:${e.target.value}`)} className="panel-input">
                {minutos.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="panel-hora-h">h</span>
            </div>
          </div>
        </div>
      )}

      <p className="panel-resumen" data-modo={modo} data-paso={yaPaso || undefined} role="status" aria-live="polite">
        {modo === "programar" ? <IconoReloj /> : <IconoTilde />}
        <span>
          {modo === "ahora" && (
            <>
              <strong>Sale apenas guardes.</strong> Aparece en la página en uno o dos minutos.
            </>
          )}
          {modo === "mantener" && publicadaEl && (
            <>
              <strong>Sigue publicada</strong> con su fecha ({formatearFecha(publicadaEl)}, {publicadaEl.slice(11, 16)} h). Los cambios se ven en uno o dos
              minutos.
            </>
          )}
          {modo === "programar" &&
            (yaPaso ? (
              <>
                <strong>Esa hora ya pasó.</strong> Si guardás así, sale apenas guardes. Elegí una hora más adelante para programarla.
              </>
            ) : (
              <>
                <strong>
                  Sale sola {cuandoEnPalabras(fecha, hoy)} a las {hora}:{minuto} h.
                </strong>{" "}
                Hasta entonces queda en cola y no se ve en la página. Para cancelarla, borrala.
              </>
            ))}
        </span>
      </p>
    </fieldset>
  );
}

function BotonDia({ dia, hoy, elegido, onElegir }: { dia: string; hoy: string; elegido: boolean; onElegir: () => void }) {
  const fecha = diaUTC(dia);
  return (
    <button type="button" role="radio" aria-checked={elegido} className="panel-dia-boton" onClick={onElegir} aria-label={`${nombreDia(dia, hoy)}, ${formatearFecha(dia)}`}>
      <small>{nombreDia(dia, hoy)}</small>
      <b>{Number(dia.slice(8, 10))}</b>
      <small>{sinPunto(fmtMes.format(fecha))}</small>
    </button>
  );
}
