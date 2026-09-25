import BotonWhatsApp from "@/components/BotonWhatsApp";
import Selector from "@/components/Selector";
import { negocio, objetivos } from "@/data/site";
import { formatearLista } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;

/** "adultos, adultos mayores, rehabilitación, principiantes y deportistas" */
const listaObjetivos = formatearLista(objetivos.map((o) => o.nombre.toLowerCase()));

const hayMitos = objetivos.some((o) => o.mito !== null);

export const metadata = metadataDePagina({
  titulo: "Entrenamiento según tu objetivo",
  descripcion: `Planilla individual para ${listaObjetivos} en ${localidad}: cómo arranca y cómo avanza tu primer mes.`,
  ruta: "/objetivos",
});

// TODO: validar estos textos con un profe antes de publicar (los mitos de site.ts también están en BORRADOR).
/** Texto de "Tu primer mes" de cada objetivo, por id. Si falta uno, esa subsección no se renderiza. */
const primerMes: Partial<Record<string, string>> = {
  adultos:
    "El primer día te preguntan qué querés lograr, si entrenaste antes y cuántas veces por semana pensás venir. Con eso los profes arman tu planilla y te acompañan mientras entrenás. Como no hay turnos, venís el día y a la hora que puedas, y cuando agarrás ritmo los profes van ajustando la planilla para que sigas avanzando.",
  "adultos-mayores":
    "Antes de arrancar, los profes te preguntan si tenés alguna molestia o indicación médica y qué te gustaría mejorar. La planilla empieza con cargas acordes a tu nivel y apunta a lo que te interesa, ya sea más fuerza, más equilibrio o más confianza al moverte. Los profes siguen cómo respondés y suben la exigencia a medida que la vas manejando.",
  rehabilitacion:
    "El primer día les contás a los profes qué lesión tuviste, cómo estás hoy y qué movimientos te molestan. Si tu médico te dio indicaciones, traelas: la planilla se arma respetándolas. Arrancás con ejercicios adaptados y la carga sube de a poco, según cómo responde tu cuerpo. Es entrenamiento para tu readaptación física y no reemplaza la atención médica.",
  principiantes:
    "Que nunca hayas entrenado no es un problema: el primer día contás si hiciste algún deporte o actividad y qué te gustaría lograr. La planilla arranca con ejercicios básicos y los profes te muestran cómo se hace cada uno. Si al principio no sabés en qué planta está cada máquina, les preguntás a los profes. Cuando ya los hacés con soltura, la planilla suma ejercicios nuevos o más carga, siempre desde tu nivel.",
  deportistas: `Arrancás contando qué deporte hacés, en qué parte de la temporada estás y cuántas veces por semana entrenás con tu club. A partir de eso, los profes arman una planilla que se acomoda a esa carga y la ajustan cuando cambia tu calendario. En ${negocio.nombre} ya entrenan alumnos de clubes de la zona que combinan el gimnasio con su deporte.`,
};

/**
 * Un objetivo por vez, con pestañas, para no apilarlos todos en la página.
 * El id de cada pestaña es el del objetivo, así los links del Footer (/objetivos#adultos) abren el que corresponde.
 * Todos los paneles quedan en el HTML estático; los que no están elegidos van con hidden.
 */
const opciones = objetivos.map((objetivo) => {
  const idTitulo = `${objetivo.id}-titulo`;
  const textoPrimerMes = primerMes[objetivo.id];
  return {
    id: objetivo.id,
    etiqueta: objetivo.nombre,
    contenido: (
      <>
        <h2 id={idTitulo} className="mb-4">
          {objetivo.nombre}
        </h2>
        {/* En lg, "Tu primer mes" y el mito van lado a lado para acortar el panel. */}
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12">
          {textoPrimerMes !== undefined && (
            <div className="max-w-[65ch]">
              <h3>Tu primer mes</h3>
              <p className="mt-3">{textoPrimerMes}</p>
            </div>
          )}
          {objetivo.mito !== null && (
            <div className="card max-w-[65ch]">
              <h3>Mito</h3>
              <p className="mt-3 font-semibold">“{objetivo.mito.mito}”</p>
              <p className="mt-2">{objetivo.mito.respuesta}</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <BotonWhatsApp mensaje={objetivo.whatsapp}>
            Escribinos por WhatsApp
            <span className="sr-only">: {objetivo.nombre.toLowerCase()}</span>
          </BotonWhatsApp>
        </div>
      </>
    ),
  };
});

export default function Objetivos() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>
        Entrenamiento para {listaObjetivos} en {localidad}
      </h1>
      <p className="intro mt-4">
        En {negocio.nombre} no hay una rutina igual para todos: los profes arman tu planilla según lo que venís a
        buscar.{" "}
        {hayMitos
          ? "Elegí tu objetivo y te contamos cómo arranca el primer mes y un mito que conviene sacarse de encima."
          : "Elegí tu objetivo y te contamos cómo arranca el primer mes."}
      </p>
      <Selector
        titulo="Objetivos"
        opciones={opciones}
        claseLista="mt-8 flex flex-wrap gap-2"
        claseBoton="pestana"
        clasePanel="mt-6 border-t border-border pt-6"
      />
    </div>
  );
}
