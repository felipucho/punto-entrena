import type contenido from "@content/paginas/objetivos.json";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import Selector from "@/components/Selector";
import { objetivos } from "@/data/site";
import type { Campo } from "@/lib/tina";

type Contenido = typeof contenido;

const hayMitos = objetivos.some((o) => o.mito !== null);

/** Campo del JSON con el texto de "Tu primer mes" de cada objetivo, por id. Si falta uno, esa subsección no se renderiza. */
const campoPrimerMes: Partial<Record<string, keyof Contenido["primerMes"]>> = {
  adultos: "adultos",
  "adultos-mayores": "adultosMayores",
  rehabilitacion: "rehabilitacion",
  principiantes: "principiantes",
  deportistas: "deportistas",
};

/**
 * /objetivos. Los textos fijos salen de content/paginas/objetivos.json y se editan con Tina (npm run dev → /admin).
 * El nombre, el mito y el mensaje de WhatsApp de cada objetivo siguen en src/data/site.ts.
 */
export default function Objetivos({ c, campo }: { c: Contenido; campo: Campo }) {
  /**
   * Un objetivo por vez, con pestañas, para no apilarlos todos en la página.
   * El id de cada pestaña es el del objetivo, así los links del Footer (/objetivos#adultos) abren el que corresponde.
   * Todos los paneles quedan en el HTML estático; los que no están elegidos van con hidden.
   */
  const opciones = objetivos.map((objetivo) => {
    const idTitulo = `${objetivo.id}-titulo`;
    const clavePrimerMes = campoPrimerMes[objetivo.id];
    const textoPrimerMes = clavePrimerMes === undefined ? undefined : c.primerMes[clavePrimerMes];
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
                <h3 className="etiqueta" data-tina-field={campo(c, "primerMesEtiqueta")}>
                  {c.primerMesEtiqueta}
                </h3>
                <p className="mt-4 text-lg" data-tina-field={campo(c.primerMes, clavePrimerMes)}>
                  {textoPrimerMes}
                </p>
              </div>
            )}
            {/* El mito va en placa amarilla y se tacha con una línea al mostrarse el panel. */}
            {objetivo.mito !== null && (
              <div className="superficie-amarilla bloque-dato max-w-[65ch]">
                <h3 className="etiqueta" data-tina-field={campo(c, "mitoEtiqueta")}>
                  {c.mitoEtiqueta}
                </h3>
                <p className="tachado numeral mt-4 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-[1.1] uppercase">
                  “{objetivo.mito.mito}”
                </p>
                <p className="mt-4">{objetivo.mito.respuesta}</p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <BotonWhatsApp mensaje={objetivo.whatsapp}>
              <span data-tina-field={campo(c, "boton")}>
                {c.boton}
                <span className="sr-only"> por WhatsApp: {objetivo.nombre.toLowerCase()}</span>
              </span>
            </BotonWhatsApp>
          </div>
        </>
      ),
    };
  });

  return (
    <div className="contenedor pt-section pb-section">
      <h1 className="text-[clamp(2.125rem,1.35rem+3.2vw,4rem)]" data-tina-field={campo(c, "titulo")}>
        {c.titulo}
      </h1>
      <p className="intro mt-4" data-tina-field={campo(c, "intro")}>
        {c.intro}
        {hayMitos ? ` ${c.introMito}` : ""}
      </p>
      <Selector
        titulo={c.selectorTitulo}
        opciones={opciones}
        claseLista="mt-8 flex flex-wrap gap-2"
        claseBoton="pestana"
        clasePanel="mt-8 border-t border-border pt-8"
      />
    </div>
  );
}
