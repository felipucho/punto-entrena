import BotonWhatsApp from "@/components/BotonWhatsApp";
import JsonLd from "@/components/JsonLd";
import { claseSuelta, comoFunciona, negocio, queLlevar } from "@/data/site";
import { preguntasResueltas } from "@/lib/faq";
import { formatearPrecio } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { jsonLdFaq, metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;
const pase = paseLibre();

export const metadata = metadataDePagina({
  titulo: "Preguntas frecuentes",
  descripcion: `Cómo empezar a entrenar en ${localidad} y qué llevar el primer día. Desde los ${negocio.edadMinima} años. ${pase.nombre} a ${formatearPrecio(pase.precio)} y ${claseSuelta.nombre.toLowerCase()} a ${formatearPrecio(claseSuelta.precio)} para probar.`,
  ruta: "/faq",
});

/** Nombre compartido de los <details>: el navegador deja una sola duda abierta por vez. */
const GRUPO_DUDAS = "dudas";

export default function Faq() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Preguntas frecuentes</h1>
        <p className="intro mt-4">
          Si estás pensando en venir, te contamos cómo empezar y qué llevar.
        </p>
      </div>

      {/*
       * Todo en una sola sección para que entre con poco scroll: desde 1024 px, "Cómo funciona" y "Qué llevar"
       * van en la columna de la izquierda y las dudas a la derecha; en pantallas más chicas, las dudas quedan abajo.
       */}
      <div className="seccion">
        <div className="contenedor grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,65ch)] lg:gap-16">
          <div className="grid content-start gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <section aria-labelledby="como-funciona">
              <h2 id="como-funciona" className="revelar mb-4">
                ¿Cómo empiezo?
              </h2>
              <ol className="lista-pasos">
                {comoFunciona.map((paso) => (
                  <li key={paso}>{paso}</li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="que-llevar">
              <h2 id="que-llevar" className="revelar mb-4">
                ¿Qué llevo el primer día?
              </h2>
              {/*
               * Son cosas cortas: van en dos columnas, cada una con su casillero tildado adelante, como una lista
               * para chequear antes de salir. Entre 640 y 768 px la columna queda angosta y vuelve a una sola.
               */}
              <ul className="lista-check grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1 md:grid-cols-2">
                {queLlevar.map((cosa) => (
                  <li key={cosa}>{cosa}</li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="dudas-comunes" className="max-w-[65ch]">
            <h2 id="dudas-comunes" className="revelar mb-4">
              Lo que más nos preguntan
            </h2>
            {/*
             * Acordeón nativo, sin JS: todas las respuestas vienen en el HTML estático (y en el JSON-LD).
             * El name compartido deja una abierta por vez; un navegador que no lo soporta permite abrir varias.
             * Sin h3 dentro del summary: el summary es un botón y un encabezado ahí adentro se anuncia mal.
             */}
            <div className="divide-y divide-border border-y border-border">
              {preguntasResueltas().map(({ pregunta, respuesta }, indice) => (
                <details key={pregunta} name={GRUPO_DUDAS} open={indice === 0} className="acordeon group">
                  <summary className="group/pregunta flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{pregunta}</span>
                    <span aria-hidden="true" className="acordeon-icono" />
                  </summary>
                  <p className="pb-5 pr-6">{respuesta}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="contenedor pb-section">
        <BotonWhatsApp mensaje={negocio.mensajeWhatsappFaq}>
          <span>
            Sacate la duda<span className="sr-only"> por WhatsApp</span>
          </span>
        </BotonWhatsApp>
      </div>

      <JsonLd datos={jsonLdFaq()} />
    </>
  );
}
