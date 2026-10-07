import type contenido from "@content/paginas/privacidad.json";
import { negocio } from "@/data/site";
import { formatearLista, telHref } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";
import { urlWhatsApp } from "@/lib/whatsapp";

/** "WhatsApp e Instagram": las redes en null no se mencionan. */
const serviciosEnlazados = formatearLista(["WhatsApp", ...redesActivas().map((red) => red.nombre)]);

/**
 * /privacidad. Los textos fijos salen de content/paginas/privacidad.json.
 * El nombre del gimnasio, las redes y el teléfono siguen en src/data/site.ts: los textos que los rodean se parten
 * en "antes" y "después".
 */
export default function Privacidad({ c }: { c: typeof contenido }) {
  return (
    <div className="legal contenedor pt-section pb-section">
      <h1>{c.titulo}</h1>
      <p className="intro mt-4">
        {c.introAntes + " "}
        {negocio.nombre}
        {c.introDespues}
      </p>

      <div className="mt-section max-w-[65ch] space-y-12">
        <section aria-labelledby="privacidad-formularios">
          <h2 id="privacidad-formularios">{c.formularios.titulo}</h2>
          <div className="prosa">
            <p>{c.formularios.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-cookies">
          <h2 id="privacidad-cookies">{c.cookies.titulo}</h2>
          <div className="prosa">
            <p>{c.cookies.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-mapa">
          <h2 id="privacidad-mapa">{c.mapa.titulo}</h2>
          <div className="prosa">
            <p>{c.mapa.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-enlaces">
          <h2 id="privacidad-enlaces">
            {c.enlaces.tituloAntes + " "}
            {serviciosEnlazados}
          </h2>
          <div className="prosa">
            <p>
              {c.enlaces.textoAntes + " "}
              {serviciosEnlazados}
              {" " + c.enlaces.textoDespues}
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-derechos">
          <h2 id="privacidad-derechos">{c.derechos.titulo}</h2>
          <div className="prosa">
            <p>
              {c.derechos.texto}{" "}
              <a href={urlWhatsApp()} target="_blank" rel="noopener" className="enlace">
                WhatsApp
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>{" "}
              {c.derechos.textoTelefono}{" "}
              <a href={telHref()} className="enlace whitespace-nowrap">{negocio.telefono.visible}</a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
