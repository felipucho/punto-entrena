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
  descripcion: `Entrenamiento para ${listaObjetivos} en ${localidad}. Los profes te arman la planilla según tu caso.`,
  ruta: "/objetivos",
});

// TODO: validar estos textos con un profe antes de publicar (los mitos de site.ts también están en BORRADOR).
/** Texto de "Tu primer mes" de cada objetivo, por id. Si falta uno, esa subsección no se renderiza. */
const primerMes: Partial<Record<string, string>> = {
  adultos:
    "Antes de empezar, los profes te preguntan qué querés lograr, si entrenaste antes y cuántas veces por semana pensás venir. Con eso te arman la planilla.",
  "adultos-mayores":
    "Los profes primero te preguntan si tenés alguna molestia y qué te gustaría mejorar, como la fuerza o el equilibrio. Arrancás con un peso que puedas manejar bien, respetando las indicaciones de tu médico. Cuando ya te queda cómodo, te lo van subiendo.",
  rehabilitacion:
    "Lo primero es contarles a los profes qué lesión tuviste y qué movimientos te molestan hoy. Si tu médico te dio indicaciones, traelas y la planilla se arma respetándolas. La carga va subiendo según cómo responde tu cuerpo. El entrenamiento acompaña tu recuperación, pero no reemplaza la atención médica.",
  principiantes:
    "Primero contás si hiciste algún deporte y qué te gustaría lograr. Empezás con ejercicios básicos y los profes te muestran cómo se hace cada uno. Cuando ya te salen bien, se suman ejercicios nuevos o más carga.",
  deportistas:
    "Arrancás contando qué deporte hacés, cuántas veces por semana entrenás con tu club y en qué momento de la temporada estás. Según eso, los profes arman tu planilla y la ajustan cuando cambia tu calendario. Ya entrenan con nosotros deportistas de clubes de la zona.",
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
        <h2 id={idTitulo} className="con-punto mb-4">
          {objetivo.nombre}
        </h2>
        {/* En lg, "Tu primer mes" y el mito van lado a lado para acortar el panel. */}
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-12">
          {textoPrimerMes !== undefined && (
            <div className="max-w-[65ch]">
              <h3 className="etiqueta">Tu primer mes</h3>
              <p className="mt-4 text-lg">{textoPrimerMes}</p>
            </div>
          )}
          {/* El mito va en placa amarilla y se tacha con una línea al mostrarse el panel. */}
          {objetivo.mito !== null && (
            <div className="superficie-amarilla bloque-dato max-w-[65ch]">
              <h3 className="etiqueta">Mito</h3>
              <p className="tachado numeral mt-4 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-[1.1] uppercase">
                “{objetivo.mito.mito}”
              </p>
              <p className="mt-4">{objetivo.mito.respuesta}</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <BotonWhatsApp mensaje={objetivo.whatsapp}>
            <span>
              Contanos tu caso<span className="sr-only"> por WhatsApp: {objetivo.nombre.toLowerCase()}</span>
            </span>
          </BotonWhatsApp>
        </div>
      </>
    ),
  };
});

export default function Objetivos() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1 className="text-[clamp(2.125rem,1.35rem+3.2vw,4rem)]">
        Cómo arrancás según lo que buscás
      </h1>
      <p className="intro mt-4">
        ¿No sabés si el gimnasio es para vos? Elegí tu caso y fijate cómo es el primer mes.
        {hayMitos ? " También desarmamos un mito que se escucha mucho." : ""}
      </p>
      <Selector
        titulo="Según tu objetivo"
        opciones={opciones}
        claseLista="mt-8 flex flex-wrap gap-2"
        claseBoton="pestana"
        clasePanel="mt-8 border-t border-border pt-8"
      />
    </div>
  );
}
