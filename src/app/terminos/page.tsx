import Link from "next/link";
import { negocio } from "@/data/site";
import { formatearLista, telHref } from "@/lib/formato";
import { capitalizar } from "@/lib/horarios";
import { redesActivas } from "@/lib/redes";
import { metadataDePagina } from "@/lib/seo";
import { urlWhatsApp } from "@/lib/whatsapp";

export const metadata = metadataDePagina({
  titulo: "Términos y condiciones",
  descripcion: `Condiciones de uso del sitio de ${negocio.nombre}: precios y horarios informativos, a confirmar por WhatsApp, y enlaces a otros servicios.`,
  ruta: "/terminos",
});

/** "WhatsApp, Instagram y el mapa de Google": las redes en null no se mencionan. */
const serviciosDeTerceros = formatearLista(["WhatsApp", ...redesActivas().map((red) => red.nombre), "el mapa de Google"]);

function EnlaceWhatsApp() {
  return (
    <a href={urlWhatsApp()} target="_blank" rel="noopener" className="enlace">
      WhatsApp
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
export default function Terminos() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>Términos y condiciones</h1>
      <p className="intro mt-4">
        Estas condiciones valen para el uso de este sitio, que es solo informativo: sirve para conocer{" "}
        {negocio.nombre} y contactarte con el gimnasio. Desde acá no se compra, no se reserva y no hace falta
        registrarse.
      </p>

      <div className="mt-12 max-w-[65ch] space-y-12">
        <section aria-labelledby="terminos-precios">
          <h2 id="terminos-precios" className="mb-4 text-[1.75rem] sm:text-[2rem]">
            Precios y horarios
          </h2>
          <div className="prosa">
            <p>
              Los precios de los{" "}
              <Link href="/planes" className="enlace">
                planes
              </Link>{" "}
              y los{" "}
              <Link href="/horarios" className="enlace">
                horarios
              </Link>{" "}
              que ves en este sitio son informativos. Si querés confirmar alguno antes de pagar, escribinos por{" "}
              <EnlaceWhatsApp />.
            </p>
          </div>
        </section>

        <section aria-labelledby="terminos-entrenamiento">
          <h2 id="terminos-entrenamiento" className="mb-4 text-[1.75rem] sm:text-[2rem]">
            Información sobre entrenamiento
          </h2>
          <div className="prosa">
            <p>
              Lo que contamos en el sitio sobre entrenamiento es información general. No reemplaza la consulta con
              tu médico, sobre todo si venís de una lesión o tenés alguna condición de salud.
            </p>
          </div>
        </section>

        <section aria-labelledby="terminos-terceros">
          <h2 id="terminos-terceros" className="mb-4 text-[1.75rem] sm:text-[2rem]">
            Servicios de terceros
          </h2>
          <div className="prosa">
            <p>
              {capitalizar(serviciosDeTerceros)} son servicios de otras empresas, con sus propias condiciones de
              uso. Cuando los usás desde este sitio, valen sus reglas, no las nuestras.
            </p>
          </div>
        </section>

        <section aria-labelledby="terminos-datos">
          <h2 id="terminos-datos" className="mb-4 text-[1.75rem] sm:text-[2rem]">
            Tus datos y consultas
          </h2>
          <div className="prosa">
            <p>
              Qué pasa con tus datos cuando usás el sitio lo explicamos en la Política de privacidad, que está al pie
              de cada página. Si tenés dudas sobre estas condiciones, escribinos por <EnlaceWhatsApp /> o llamanos al{" "}
              <a href={telHref()} className="enlace whitespace-nowrap">
                {negocio.telefono.visible}
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
