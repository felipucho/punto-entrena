import Link from "next/link";
import type contenido from "@content/paginas/terminos.json";
import { negocio } from "@/data/site";
import { formatearLista, telHref } from "@/lib/formato";
import { capitalizar } from "@/lib/horarios";
import { redesActivas } from "@/lib/redes";
import { urlWhatsApp } from "@/lib/whatsapp";

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

/**
 * /terminos. Los textos fijos salen de content/paginas/terminos.json.
 * El nombre del gimnasio, las redes y el teléfono siguen en src/data/site.ts: los textos que los rodean se parten
 * en "antes" y "después".
 */
export default function Terminos({ c }: { c: typeof contenido }) {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>{c.titulo}</h1>
      <p className="intro mt-4">
        {c.introAntes}{" "}
        {negocio.nombre}
        {" " + c.introDespues}
      </p>

      <div className="mt-12 max-w-[65ch] space-y-12">
        <section aria-labelledby="terminos-precios">
          <h2 id="terminos-precios" className="mb-4 text-[1.75rem] sm:text-[2rem]">{c.precios.titulo}</h2>
          <div className="prosa">
            <p>
              {c.precios.textoAntes}{" "}
              <Link href="/planes" className="enlace">{c.precios.enlacePlanes}</Link>{" "}
              {c.precios.textoMedio}{" "}
              <Link href="/horarios" className="enlace">{c.precios.enlaceHorarios}</Link>{" "}
              {c.precios.textoDespues}{" "}
              <EnlaceWhatsApp />.
            </p>
          </div>
        </section>

        <section aria-labelledby="terminos-entrenamiento">
          <h2 id="terminos-entrenamiento" className="mb-4 text-[1.75rem] sm:text-[2rem]">{c.entrenamiento.titulo}</h2>
          <div className="prosa">
            <p>{c.entrenamiento.texto}</p>
          </div>
        </section>

        <section aria-labelledby="terminos-terceros">
          <h2 id="terminos-terceros" className="mb-4 text-[1.75rem] sm:text-[2rem]">{c.terceros.titulo}</h2>
          <div className="prosa">
            <p>
              {capitalizar(serviciosDeTerceros)}
              {" " + c.terceros.texto}
            </p>
          </div>
        </section>

        <section aria-labelledby="terminos-datos">
          <h2 id="terminos-datos" className="mb-4 text-[1.75rem] sm:text-[2rem]">{c.datos.titulo}</h2>
          <div className="prosa">
            <p>
              {c.datos.texto + " "}
              <EnlaceWhatsApp />
              {" " + c.datos.textoTelefono}{" "}
              <a href={telHref()} className="enlace whitespace-nowrap">{negocio.telefono.visible}</a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
