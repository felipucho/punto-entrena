import BotonWhatsApp from "@/components/BotonWhatsApp";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Selector from "@/components/Selector";
import { negocio, profes, type ColumnaGrilla, type Profe } from "@/data/site";
import { formatearLista, nombreCorto } from "@/lib/formato";
import { NOMBRE_COLUMNA, describirSegmentos, horariosDeProfe } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

/** Columnas de la grilla en el orden en que se leen: lunes, miércoles y viernes; después martes y jueves. */
const COLUMNAS = Object.keys(NOMBRE_COLUMNA) as ColumnaGrilla[];

export const metadata = metadataDePagina({
  titulo: "Los profes y sus horarios",
  descripcion: `${formatearLista(
    profes.map((profe) => profe.nombre),
  )} son los profes de ${nombreCorto} en ${negocio.direccion.localidad}. Mirá qué días y a qué hora está cada uno.`,
  ruta: "/equipo",
});

/** Lo que se ve al elegir un profe: nombre, frase, cuándo atiende y la pregunta que más le hacen. */
function InfoDeProfe({ profe }: { profe: Profe }) {
  const horarios = horariosDeProfe(profe.id);
  const columnasConHorario = COLUMNAS.filter((columna) => horarios[columna].length > 0);

  return (
    <>
      <h2 className="con-punto mb-4">{profe.nombre}</h2>

      {/*
       * Mismo ritmo que los paneles de /objetivos e /instalaciones: 1rem entre el h2 y lo primero que haya
       * (la frase, o "Cuándo está …" mientras la frase sea null) y 1.5rem entre bloques.
       */}
      <div className="space-y-6">
        {profe.frase !== null && (
          <blockquote className="border-l-4 border-accent pl-4 text-lg italic">
            <p>{profe.frase}</p>
          </blockquote>
        )}

        {columnasConHorario.length > 0 && (
          <div>
            <h3 className="etiqueta">Cuándo está {profe.corto}</h3>
            {/* Los grupos de días van lado a lado cuando hay ancho; entre lg y xl el panel es angosto y se apilan. */}
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1 xl:grid-cols-2">
              {columnasConHorario.map((columna) => (
                <div key={columna}>
                  <dt className="font-bold uppercase tracking-[0.08em] text-accent">{NOMBRE_COLUMNA[columna]}</dt>
                  <dd>{describirSegmentos(horarios[columna])}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {profe.preguntaFrecuente !== null && (
          <div>
            <h3 className="etiqueta">Lo que más le preguntan a {profe.corto}</h3>
            <p className="mt-3 font-semibold text-titulo">{profe.preguntaFrecuente.pregunta}</p>
            <p className="mt-2">{profe.preguntaFrecuente.respuesta}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function Equipo() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Los profes de {nombreCorto}</h1>
        <p className="intro mt-4">{negocio.formacionProfes}</p>
        <p className="intro mt-3">Tocá la foto de cada uno y fijate qué días y a qué hora está.</p>
      </div>

      {/*
       * Fotos cuadradas en una sola fila (también a 375 px) y la info de un profe por vez.
       * Desde lg la fila y el panel van lado a lado, así la página entra casi sin scrollear.
       * La fila arranca a la misma distancia de la intro que las pestañas de /objetivos e /instalaciones (mt-8).
       * El id de cada botón es profe.id: la grilla de /horarios linkea a /equipo#<profe.id> y abre ese profe.
       */}
      <div className="contenedor mt-8 pb-section lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <Selector
          titulo="Profes"
          claseLista="grid grid-cols-4 gap-2 sm:gap-4"
          claseBoton="group flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-card p-1.5 text-center leading-tight transition-colors hover:bg-surface sm:p-2"
          clasePanel="card mt-6 border-t-4 border-t-accent lg:mt-0"
          opciones={profes.map((profe) => ({
            id: profe.id,
            etiqueta: (
              <>
                {/*
                 * Contorno amarillo (no sombra) para el elegido: se sigue viendo en modo de alto contraste.
                 * En mobile el cuadro mide unos 66 px: la etiqueta "Foto: …" (el span de ImagePlaceholder) va más chica,
                 * con menos padding y cortada con "…", como en las miniaturas del inicio, en vez de quedar recortada
                 * por los bordes a mitad de palabra.
                 */}
                <ImagePlaceholder
                  descripcion={`retrato de ${profe.nombre}`}
                  proporcion="1 / 1"
                  decorativa
                  className="w-full [&_img]:filter-none max-sm:p-1.5 max-sm:[&>span]:line-clamp-2 max-sm:[&>span]:text-xs group-aria-selected:outline-3 group-aria-selected:outline-offset-2 group-aria-selected:outline-accent"
                />
                <span className="font-medium wrap-break-word text-muted group-hover:text-titulo group-aria-selected:text-titulo group-aria-selected:underline group-aria-selected:decoration-accent group-aria-selected:decoration-2 group-aria-selected:underline-offset-4">
                  {/*
                   * El elegido no pasa a negrita: el nombre se ensancha y, en algunos anchos, baja a un segundo renglón
                   * y empuja el panel. Lo marcan el contorno de la foto, el color y el subrayado.
                   * En mobile entra sólo el nombre corto; el lector de pantalla lee siempre el nombre completo.
                   * Si el corto no es el comienzo del nombre ("Mati" no lo es de "Matías", por la tilde), se lee
                   * también, así quien maneja la página por voz puede decir lo que ve en el botón.
                   */}
                  <span aria-hidden={profe.nombre.startsWith(profe.corto) || undefined} className="sm:hidden">
                    {profe.corto}
                  </span>{" "}
                  <span className="sr-only sm:not-sr-only">{profe.nombre}</span>
                </span>
              </>
            ),
            contenido: <InfoDeProfe profe={profe} />,
          }))}
        />
      </div>

      <div className="contenedor pb-section">
        <BotonWhatsApp mensaje={negocio.mensajeWhatsappEquipo}>
          <span>
            Quiero empezar<span className="sr-only"> por WhatsApp</span>
          </span>
        </BotonWhatsApp>
      </div>
    </>
  );
}
