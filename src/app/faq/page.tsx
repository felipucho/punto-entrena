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
  descripcion: `Cómo arrancar a entrenar en ${localidad}: sin turnos y con planilla individual. ${pase.nombre} a ${formatearPrecio(pase.precio)}, ${claseSuelta.nombre.toLowerCase()} a ${formatearPrecio(claseSuelta.precio)}, desde los ${negocio.edadMinima} años.`,
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
          Acá te contamos cómo arrancás en {negocio.nombre}, qué llevar el primer día y qué es lo que más nos
          preguntan antes de empezar a entrenar en {localidad}.
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
              <h2 id="como-funciona" className="mb-4">
                Cómo funciona
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                {comoFunciona.map((paso) => (
                  <li key={paso}>{paso}</li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="que-llevar">
              <h2 id="que-llevar" className="mb-4">
                Qué llevar el primer día
              </h2>
              {/*
               * Son cosas cortas: van en dos columnas (los marcadores caen en el padding y en el espacio entre
               * columnas). Entre 640 y 768 px la columna queda angosta y vuelve a una sola.
               */}
              <ul className="grid list-disc grid-cols-2 gap-x-8 gap-y-1 pl-5 sm:grid-cols-1 md:grid-cols-2">
                {queLlevar.map((cosa) => (
                  <li key={cosa}>{cosa}</li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="dudas-comunes" className="max-w-[65ch]">
            <h2 id="dudas-comunes" className="mb-4">
              Dudas comunes antes de arrancar
            </h2>
            {/*
             * Acordeón nativo, sin JS: todas las respuestas vienen en el HTML estático (y en el JSON-LD).
             * El name compartido deja una abierta por vez; un navegador que no lo soporta permite abrir varias.
             * Sin h3 dentro del summary: el summary es un botón y un encabezado ahí adentro se anuncia mal.
             */}
            <div className="divide-y divide-border border-y border-border">
              {preguntasResueltas().map(({ pregunta, respuesta }, indice) => (
                <details key={pregunta} name={GRUPO_DUDAS} open={indice === 0} className="group">
                  <summary className="group/pregunta flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 font-semibold [&::-webkit-details-marker]:hidden">
                    <span className="group-hover/pregunta:underline">{pregunta}</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                    >
                      <path d="m5 7.5 5 5 5-5" />
                    </svg>
                  </summary>
                  <p className="pb-4">{respuesta}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <JsonLd datos={jsonLdFaq()} />
    </>
  );
}
