import EstadoEnVivo from "@/components/EstadoEnVivo";
import GrillaHorarios from "@/components/GrillaHorarios";
import { horasTranquilas, negocio, plantas } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Horario de ${negocio.nombre}, ${negocio.direccion.localidad}: ${minusculaInicial(horarioGeneral())}`;
const descripcionCompleta = `${baseDescripcion} Qué profe atiende en cada franja.`;

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
        <p className="intro mt-4">{horarioGeneral()}</p>
        <EstadoEnVivo className="mt-4" />
      </div>

      <section aria-labelledby="quien-te-atiende" className="seccion">
        <div className="contenedor">
          <h2 id="quien-te-atiende" className="mb-4">
            Quién te atiende en cada franja
          </h2>
          <GrillaHorarios />
          <p className="mt-4 max-w-[65ch]">
            En todo el horario de apertura tenés acceso libre a las {enPalabras(plantas.length)} plantas y no hace
            falta sacar turno.
          </p>
        </div>
      </section>

      {horasTranquilas !== null && (
        <section aria-labelledby="horas-tranquilas" className="seccion">
          <div className="contenedor">
            <h2 id="horas-tranquilas" className="mb-4">
              Horas más tranquilas
            </h2>
            <p className="max-w-[65ch]">{horasTranquilas}</p>
          </div>
        </section>
      )}
    </>
  );
}
