import BotonWhatsApp from "@/components/BotonWhatsApp";
import EstadoEnVivo from "@/components/EstadoEnVivo";
import GrillaHorarios from "@/components/GrillaHorarios";
import { horasTranquilas, negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Gimnasio en ${negocio.direccion.localidad}, abierto de ${minusculaInicial(horarioGeneral())}`;
const descripcionCompleta = `${baseDescripcion} Mirá qué profe está en cada horario.`;

export const metadata = metadataDePagina({
  titulo: "Horarios",
  // Si el horario cambia y la frase final ya no entra en 155 caracteres, queda solo el horario.
  descripcion: descripcionCompleta.length <= LARGO_MAXIMO_DESCRIPCION ? descripcionCompleta : baseDescripcion,
  ruta: "/horarios",
});

export default function Horarios() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Horarios</h1>
        <p className="intro mt-4">
          Abrimos de {minusculaInicial(horarioGeneral())}
        </p>
        <EstadoEnVivo className="mt-6 w-fit rounded-card border border-border bg-surface px-4 py-3 text-lg" />
      </div>

      <section aria-labelledby="quien-te-atiende" className="seccion">
        <div className="contenedor">
          <h2 id="quien-te-atiende" className="revelar mb-4">
            Qué profe vas a encontrar
          </h2>
          <GrillaHorarios />
          <p className="mt-4 max-w-[65ch]">Tocá un nombre para ver todos sus horarios.</p>
        </div>
      </section>

      {horasTranquilas !== null && (
        <section aria-labelledby="horas-tranquilas" className="seccion">
          <div className="contenedor">
            <h2 id="horas-tranquilas" className="revelar mb-4">
              Cuándo hay menos gente
            </h2>
            <p className="max-w-[65ch]">{horasTranquilas}</p>
          </div>
        </section>
      )}

      <div className="contenedor pb-section">
        <BotonWhatsApp mensaje={negocio.mensajeWhatsappHorarios}>
          <span>
            Coordiná tu primer día<span className="sr-only"> por WhatsApp</span>
          </span>
        </BotonWhatsApp>
      </div>
    </>
  );
}
