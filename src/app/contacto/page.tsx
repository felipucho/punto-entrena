import Link from "next/link";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { negocio } from "@/data/site";
import { direccionCompleta, direccionCorta, telHref, urlMapa, urlMapaEmbebido } from "@/lib/formato";
import { diasDeApertura, horarioGeneral, horarioGeneralCorto } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";
import { redesActivas } from "@/lib/redes";
import { metadataDePagina } from "@/lib/seo";

const redes = redesActivas();

const { calle, localidad, referencia } = negocio.direccion;

const diasHabiles = diasDeApertura();

const nombrePase = paseLibre().nombre.toLowerCase();

export const metadata = metadataDePagina({
  titulo: "Contacto y cómo llegar",
  descripcion: `${negocio.nombre}: ${direccionCorta()}. Tel. ${negocio.telefono.visible}. ${horarioGeneralCorto()}. WhatsApp y mapa.`,
  ruta: "/contacto",
});

export default function Contacto() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Contacto y cómo llegar</h1>
        <p className="intro mt-4">
          Para consultar por los planes o para arrancar, escribinos por WhatsApp o llamanos. Una vez que tenés tu
          planilla, venís de {diasHabiles} cuando te acomode, sin sacar turno.
        </p>
      </div>

      {/*
       * Datos de contacto y dirección de un lado, mapa del otro. El orden del HTML es el de mobile:
       * primero el WhatsApp y el teléfono, después la dirección y al final el mapa. En desktop el mapa toma el alto
       * de la columna de datos.
       */}
      <div className="seccion">
        <div className="contenedor grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* En tablet las dos secciones van lado a lado, con el mapa abajo; en desktop, apiladas junto al mapa. */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
            <section aria-labelledby="whatsapp-telefono-horario">
              <h2 id="whatsapp-telefono-horario" className="mb-4">
                WhatsApp, teléfono y horario
              </h2>
              <p>
                <BotonWhatsApp mensaje={negocio.mensajeWhatsappGeneral} />
              </p>
              {/*
               * Los links de teléfono y redes miden 44 px de alto para el dedo, con el texto centrado. Por eso las
               * filas van sin espacio entre sí y el horario baja lo mismo que ese texto: quedan todas a igual distancia.
               */}
              <dl className="mt-5">
                <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-baseline gap-x-4">
                  <dt className="font-semibold">Teléfono</dt>
                  <dd>
                    <a href={telHref()} className="enlace inline-flex min-h-11 items-center">
                      {negocio.telefono.visible}
                    </a>
                  </dd>
                </div>
                {redes.length > 0 && (
                  <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-baseline gap-x-4">
                    <dt className="font-semibold">Redes</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-x-5">
                        {redes.map((red) => (
                          <li key={red.url}>
                            <a
                              href={red.url}
                              target="_blank"
                              rel="noopener"
                              className="enlace inline-flex min-h-11 items-center"
                            >
                              {red.nombre}
                              <span className="sr-only"> (se abre en una pestaña nueva)</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
                <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-baseline gap-x-4">
                  <dt className="font-semibold">Horario</dt>
                  <dd className="pt-2.5">{horarioGeneral()}</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="donde-estamos">
              <h2 id="donde-estamos" className="mb-4">
                Dónde estamos
              </h2>
              <address className="not-italic">
                <p className="font-semibold">{negocio.nombre}</p>
                <p>{direccionCompleta()}</p>
                {referencia !== null && <p className="mt-2 text-muted">{referencia}</p>}
              </address>
              <p className="mt-5">
                <a href={urlMapa()} target="_blank" rel="noopener" className="btn btn-secundario">
                  Abrir en Google Maps
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </p>
            </section>
          </div>

          <iframe
            src={urlMapaEmbebido()}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ${negocio.nombre} en ${direccionCorta()}`}
            className="aspect-[4/3] w-full rounded-card border border-border md:aspect-video lg:aspect-auto lg:h-full lg:min-h-96"
          />
        </div>
      </div>

      <section aria-labelledby="otra-localidad" className="pb-section">
        <div className="contenedor">
          <div className="grid gap-4 rounded-card bg-surface p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <div>
              <h2 id="otra-localidad" className="mb-4">
                Si venís de otra localidad
              </h2>
              <div className="prosa">
                <p>
                  {negocio.nombre} queda en el centro de {localidad}, en {calle}. Con el{" "}
                  <Link href="/planes" className="enlace">
                    {nombrePase}
                  </Link>{" "}
                  podés venir todos los días de {diasHabiles}, así entrenás cada vez que estés por acá sin tener que
                  contar las clases.
                </p>
                <p>
                  Antes de venir por primera vez, escribinos por WhatsApp: es el primer paso para que los profes te
                  armen la planilla. De paso te contamos qué plan te conviene según los días que pensás venir.
                </p>
              </div>
            </div>
            <p>
              <BotonWhatsApp mensaje="Hola, vengo de otra localidad y quería consultar por el gimnasio." />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
