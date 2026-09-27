import Link from "next/link";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { negocio } from "@/data/site";
import { direccionCompleta, direccionCorta, telHref, urlMapa, urlMapaEmbebido } from "@/lib/formato";
import { diasDeApertura, horarioGeneral, horarioGeneralCorto } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";
import { redesActivas } from "@/lib/redes";
import { metadataDePagina } from "@/lib/seo";

const redes = redesActivas();

const { localidad, referencia } = negocio.direccion;

const diasHabiles = diasDeApertura();

const nombrePase = paseLibre().nombre.toLowerCase();

export const metadata = metadataDePagina({
  titulo: "Contacto y cómo llegar",
  descripcion: `Escribinos por WhatsApp o llamanos al ${negocio.telefono.visible}. Estamos en ${direccionCorta()}. ${horarioGeneralCorto()}.`,
  ruta: "/contacto",
});

export default function Contacto() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Contacto y cómo llegar</h1>
        <p className="intro mt-4">
          Escribinos, llamanos o pasá por el gimnasio.
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
              <h2 id="whatsapp-telefono-horario" className="revelar mb-4">
                WhatsApp y teléfono
              </h2>
              <p>
                <BotonWhatsApp mensaje={negocio.mensajeWhatsappGeneral}>
                  <span>
                    Escribinos<span className="sr-only"> por WhatsApp</span>
                  </span>
                </BotonWhatsApp>
              </p>
              {/*
               * Los links de teléfono y redes miden 44 px de alto para el dedo, con el texto centrado. Por eso las
               * filas van sin espacio entre sí y el horario baja lo mismo que ese texto: quedan todas a igual distancia.
               */}
              <dl className="mt-5">
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-4">
                  <dt className="font-bold uppercase tracking-[0.08em] text-muted">Teléfono</dt>
                  <dd>
                    <a href={telHref()} className="enlace inline-flex min-h-11 items-center">
                      {negocio.telefono.visible}
                    </a>
                  </dd>
                </div>
                {redes.length > 0 && (
                  <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-4">
                    <dt className="font-bold uppercase tracking-[0.08em] text-muted">Redes</dt>
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
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-x-4">
                  <dt className="font-bold uppercase tracking-[0.08em] text-muted">Horario</dt>
                  <dd className="pt-2.5">{horarioGeneral()}</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="donde-estamos">
              <h2 id="donde-estamos" className="revelar mb-4">
                Estamos en el centro de {localidad}
              </h2>
              <address className="not-italic">
                <p className="font-semibold text-titulo">{negocio.nombre}</p>
                <p>{direccionCompleta()}</p>
                {referencia !== null && <p className="mt-2 text-muted">{referencia}</p>}
              </address>
              <p className="mt-5">
                <a href={urlMapa()} target="_blank" rel="noopener" className="btn btn-secundario">
                  Ver cómo llegar
                  <span className="sr-only"> en Google Maps (se abre en una pestaña nueva)</span>
                </a>
              </p>
            </section>
          </div>

          <iframe
            src={urlMapaEmbebido()}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ${negocio.nombre} en ${direccionCorta()}`}
            className="aspect-[4/3] w-full rounded-card border border-border grayscale-[0.4] transition-[filter] duration-500 hover:grayscale-0 focus:grayscale-0 md:aspect-video lg:aspect-auto lg:h-full lg:min-h-96"
          />
        </div>
      </div>

      <section aria-labelledby="otra-localidad" className="pb-section">
        <div className="contenedor">
          <div className="superficie-amarilla bloque-dato grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <div>
              <h2 id="otra-localidad" className="con-punto mb-4">
                ¿Venís de otra localidad?
              </h2>
              <div className="prosa">
                <p>
                  Si no sabés qué días vas a andar por {localidad}, te conviene el{" "}
                  <Link href="/planes" className="enlace">
                    {nombrePase}
                  </Link>
                  . Con ese plan podés venir todos los días, de {diasHabiles}.
                </p>
                <p>
                  Avisanos qué día venís la primera vez y te decimos qué profe va a estar.
                </p>
              </div>
            </div>
            <p>
              <BotonWhatsApp mensaje={`Hola, no vivo en ${localidad} y me interesa el ${nombrePase}. ¿Cómo hago para ir la primera vez?`}>
                <span>
                  Arreglá tu primer día<span className="sr-only"> por WhatsApp</span>
                </span>
              </BotonWhatsApp>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
