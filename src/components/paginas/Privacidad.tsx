import type contenido from "@content/paginas/privacidad.json";
import { negocio } from "@/data/site";
import { formatearLista, telHref } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";
import { urlWhatsApp } from "@/lib/whatsapp";
import type { Campo } from "@/lib/tina";

/** "WhatsApp e Instagram": las redes en null no se mencionan. */
const serviciosEnlazados = formatearLista(["WhatsApp", ...redesActivas().map((red) => red.nombre)]);

/**
 * /privacidad. Los textos fijos salen de content/paginas/privacidad.json y se editan con Tina (npm run dev → /admin).
 * El nombre del gimnasio, las redes y el teléfono siguen en src/data/site.ts: los textos que los rodean se parten
 * en "antes" y "después". Los párrafos con más de un campo marcan la sección entera.
 */
export default function Privacidad({ c, campo }: { c: typeof contenido; campo: Campo }) {
  return (
    <div className="contenedor pt-section pb-section">
      <h1 data-tina-field={campo(c, "titulo")}>{c.titulo}</h1>
      <p className="intro mt-4" data-tina-field={campo(c, "introAntes")}>
        {c.introAntes + " "}
        {negocio.nombre}
        {c.introDespues}
      </p>

      <div className="mt-12 max-w-[65ch] space-y-12">
        <section aria-labelledby="privacidad-formularios">
          <h2
            id="privacidad-formularios"
            className="mb-4 text-[1.75rem] sm:text-[2rem]"
            data-tina-field={campo(c.formularios, "titulo")}
          >
            {c.formularios.titulo}
          </h2>
          <div className="prosa">
            <p data-tina-field={campo(c.formularios, "texto")}>{c.formularios.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-cookies">
          <h2
            id="privacidad-cookies"
            className="mb-4 text-[1.75rem] sm:text-[2rem]"
            data-tina-field={campo(c.cookies, "titulo")}
          >
            {c.cookies.titulo}
          </h2>
          <div className="prosa">
            <p data-tina-field={campo(c.cookies, "texto")}>{c.cookies.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-mapa">
          <h2
            id="privacidad-mapa"
            className="mb-4 text-[1.75rem] sm:text-[2rem]"
            data-tina-field={campo(c.mapa, "titulo")}
          >
            {c.mapa.titulo}
          </h2>
          <div className="prosa">
            <p data-tina-field={campo(c.mapa, "texto")}>{c.mapa.texto}</p>
          </div>
        </section>

        <section aria-labelledby="privacidad-enlaces">
          <h2
            id="privacidad-enlaces"
            className="mb-4 text-[1.75rem] sm:text-[2rem]"
            data-tina-field={campo(c.enlaces, "tituloAntes")}
          >
            {c.enlaces.tituloAntes + " "}
            {serviciosEnlazados}
          </h2>
          <div className="prosa">
            <p data-tina-field={campo(c.enlaces)}>
              {c.enlaces.textoAntes + " "}
              {serviciosEnlazados}
              {" " + c.enlaces.textoDespues}
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-derechos">
          <h2
            id="privacidad-derechos"
            className="mb-4 text-[1.75rem] sm:text-[2rem]"
            data-tina-field={campo(c.derechos, "titulo")}
          >
            {c.derechos.titulo}
          </h2>
          <div className="prosa">
            <p data-tina-field={campo(c.derechos)}>
              {c.derechos.texto}{" "}
              <a href={urlWhatsApp()} target="_blank" rel="noopener" className="enlace">
                WhatsApp
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>{" "}
              {c.derechos.textoTelefono}{" "}
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
