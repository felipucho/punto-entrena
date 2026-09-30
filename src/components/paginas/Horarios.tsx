import type contenido from "@content/paginas/horarios.json";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import EstadoEnVivo from "@/components/EstadoEnVivo";
import GrillaHorarios from "@/components/GrillaHorarios";
import { horasTranquilas, negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";

/**
 * /horarios. Los textos fijos salen de content/paginas/horarios.json.
 * El horario, la grilla de profes y las horas tranquilas salen de src/data/site.ts y src/lib.
 */
export default function Horarios({ c }: { c: typeof contenido }) {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>{c.titulo}</h1>
        <p className="intro mt-4">
          {`${c.introAntes} `}
          {minusculaInicial(horarioGeneral())}
        </p>
        <EstadoEnVivo className="mt-6 w-fit rounded-card border border-border bg-surface px-4 py-3 text-lg" />
      </div>

      <section aria-labelledby="quien-te-atiende" className="seccion">
        <div className="contenedor">
          <h2 id="quien-te-atiende" className="revelar mb-4">{c.profesTitulo}</h2>
          <GrillaHorarios />
          {c.profesNota.trim() !== "" && <p className="mt-4 max-w-[65ch]">{c.profesNota}</p>}
        </div>
      </section>

      {horasTranquilas !== null && (
        <section aria-labelledby="horas-tranquilas" className="seccion">
          <div className="contenedor">
            <h2 id="horas-tranquilas" className="revelar mb-4">{c.tranquilasTitulo}</h2>
            <p className="max-w-[65ch]">{horasTranquilas}</p>
          </div>
        </section>
      )}

      <div className="contenedor pb-section">
        <BotonWhatsApp mensaje={negocio.mensajeWhatsappHorarios}>
          <span>
            {c.boton}
            <span className="sr-only"> por WhatsApp</span>
          </span>
        </BotonWhatsApp>
      </div>
    </>
  );
}
