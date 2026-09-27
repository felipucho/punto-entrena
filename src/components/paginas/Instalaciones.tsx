"use client";

import type { ReactNode } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import type contenido from "../../../content/paginas/instalaciones.json";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import Selector from "@/components/Selector";
import { negocio, plantas, type Planta } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";

const cantidadDePlantas = enPalabras(plantas.length);

type Textos = typeof contenido;

/** Las fotos de una planta. Se arman en el servidor porque ImagePlaceholder lee public/fotos/ del disco. */
export type FotosDePlanta = {
  /** La foto de cada destacado, por destacado. */
  equipamiento: Record<string, ReactNode>;
  /** Las fotos de la fila deslizable. */
  galeria: ReactNode;
};

/**
 * Texto de "Cómo se entrena" por planta, según el brief "Qué entrenás acá" de src/data/site.ts.
 * El copy sale de content/paginas/instalaciones.json; el foco se toma del dato para que el texto no se desfase si cambia.
 * Si se agrega una planta nueva, hay que sumar su texto acá (y en el JSON); mientras falte, esa subsección no se muestra.
 */
const QUE_ENTRENAS: Record<string, (planta: Planta, textos: Textos["queEntrenas"]) => { texto: string; campo: string }> =
  {
    "planta-baja": (_planta, textos) => ({ texto: textos.plantaBaja, campo: tinaField(textos, "plantaBaja") }),
    "planta-alta": (planta, textos) => ({
      texto: `${textos.plantaAlta.antesDelFoco} ${minusculaInicial(planta.foco)}${textos.plantaAlta.despuesDelFoco}`,
      campo: tinaField(textos.plantaAlta),
    }),
  };

/**
 * Contenido de la pestaña de una planta. En desktop, "Cómo se entrena" y "Equipamiento" van lado a lado;
 * las fotos de la planta, en una fila que se desliza de costado.
 */
function PanelPlanta({ planta, textos, fotos }: { planta: Planta; textos: Textos; fotos: FotosDePlanta }) {
  const idTitulo = `${planta.id}-titulo`;
  const queEntrenas = QUE_ENTRENAS[planta.id]?.(planta, textos.queEntrenas);
  const nombreEnMinuscula = minusculaInicial(planta.nombre);
  const tituloFotos = `Fotos de la ${nombreEnMinuscula}`;
  // Sin texto de "Cómo se entrena", los destacados usan todo el ancho.
  const columnas = queEntrenas !== undefined ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10" : "";

  return (
    <>
      <h2 id={idTitulo} className="mb-4">
        {planta.nombre}
      </h2>

      <div className={`grid gap-6 ${columnas}`}>
        {queEntrenas !== undefined && (
          <div>
            <h3 className="etiqueta" data-tina-field={tinaField(textos, "comoSeEntrenaTitulo")}>
              {textos.comoSeEntrenaTitulo}
            </h3>
            <p className="mt-3 max-w-[65ch] text-lg" data-tina-field={queEntrenas.campo}>
              {queEntrenas.texto}
            </p>
          </div>
        )}

        <div>
          <h3 className="etiqueta" data-tina-field={tinaField(textos, "equipamientoTitulo")}>
            {textos.equipamientoTitulo}
          </h3>
          {/*
           * Cuadrados chicos: de a 3 en mobile (de a 2 por debajo de unos 350 px, donde "multiarticular" ya no entra)
           * y todos en una fila desde sm, sean cuantos sean. La etiqueta "Foto: …" (el span de ImagePlaceholder)
           * va más chica para que entre en el cuadrado.
           */}
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-3 sm:grid-flow-col sm:grid-cols-none sm:auto-cols-fr">
            {planta.destacados.map((destacado) => (
              <li key={destacado} className="group">
                {fotos.equipamiento[destacado]}
                {/* Columnas angostas: si una palabra larga ("multiarticular") no entra, se corta en vez de desbordar. */}
                <p className="mt-2 text-sm leading-snug font-semibold wrap-break-word">{destacado}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="etiqueta mt-6">{tituloFotos}</h3>
      <div role="region" aria-label={tituloFotos} tabIndex={0} className="fila-deslizable mt-3">
        {fotos.galeria}
      </div>
    </>
  );
}

/**
 * /instalaciones. Los textos fijos salen de content/paginas/instalaciones.json y se editan con Tina (npm run dev → /admin).
 * Lo que sale de src/data/site.ts o se calcula (plantas, foco, destacados, cantidad de plantas) sigue en el código.
 */
export default function Instalaciones({
  fotos,
  ...props
}: {
  query: string;
  variables: { relativePath: string };
  data: { instalaciones: Textos };
  /** Las fotos de cada planta, por id de planta. */
  fotos: Record<string, FotosDePlanta>;
}) {
  const { data } = useTina(props);
  const c = data.instalaciones;

  return (
    <div className="contenedor pt-section pb-section">
      <h1 data-tina-field={tinaField(c, "titulo")}>{c.titulo}</h1>
      <p className="intro mt-4">
        Tenemos {cantidadDePlantas} plantas y con cualquier plan usás las {cantidadDePlantas}.
      </p>

      {/*
       * Una planta por vez. El id de cada pestaña es el de la planta: /instalaciones#planta-alta abre esa.
       * Los botones reparten el ancho en una sola fila, con el nombre arriba y el foco abajo.
       * Una línea separa las pestañas del panel, igual que en /objetivos.
       */}
      <Selector
        titulo="Plantas"
        claseLista="mt-8 grid grid-flow-col auto-cols-fr gap-2 sm:max-w-lg"
        claseBoton="pestana"
        clasePanel="mt-8 border-t border-border pt-8"
        opciones={plantas.map((planta) => ({
          id: planta.id,
          etiqueta: (
            <span className="flex flex-col">
              <span>{planta.nombre}</span>{" "}
              <span className="text-sm font-normal text-balance">{planta.foco}</span>
            </span>
          ),
          contenido: <PanelPlanta planta={planta} textos={c} fotos={fotos[planta.id]} />,
        }))}
      />

      <div className="mt-section">
        <BotonWhatsApp mensaje={negocio.mensajeWhatsappInstalaciones}>
          <span data-tina-field={tinaField(c, "boton")}>
            {c.boton}
            <span className="sr-only"> por WhatsApp</span>
          </span>
        </BotonWhatsApp>
      </div>
    </div>
  );
}
