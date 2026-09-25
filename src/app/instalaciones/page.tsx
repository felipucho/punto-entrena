import ImagePlaceholder from "@/components/ImagePlaceholder";
import Selector from "@/components/Selector";
import { negocio, plantas, type Planta } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";
import { capitalizar } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;
const FOTOS_POR_GALERIA = 6;

const cantidadDePlantas = enPalabras(plantas.length);

/**
 * Descripción SEO con los destacados reales: arranca con todos y va sacando el último de cada planta
 * hasta que entra en 155 caracteres.
 */
function descripcionSeo(): string {
  const maximo = Math.max(...plantas.map((planta) => planta.destacados.length));
  let descripcion = "";
  for (let cantidad = maximo; cantidad >= 1; cantidad--) {
    const porPlanta = plantas.map(
      (planta) =>
        `${planta.nombre}: ${planta.destacados.slice(0, cantidad).map(minusculaInicial).join(", ")}.`,
    );
    descripcion = `Gimnasio de ${cantidadDePlantas} plantas en ${negocio.direccion.localidad}. ${porPlanta.join(" ")}`;
    if (descripcion.length <= LARGO_MAXIMO_DESCRIPCION) break;
  }
  return descripcion;
}

export const metadata = metadataDePagina({
  titulo: "Instalaciones",
  descripcion: descripcionSeo(),
  ruta: "/instalaciones",
});

/**
 * Texto de "Qué entrenás acá" por planta, según el brief de src/data/site.ts.
 * El foco se toma del dato para que el texto no se desfase si cambia.
 * Si se agrega una planta nueva, hay que sumar su texto acá; mientras falte, esa subsección no se muestra.
 */
const QUE_ENTRENAS: Record<string, (planta: Planta) => string> = {
  "planta-baja": (planta) =>
    `En la ${minusculaInicial(planta.nombre)} entrenás fuerza, ${minusculaInicial(planta.foco)}. Qué ejercicios hacés y con cuánto peso lo define tu planilla, que los profes arman según tu nivel. Si nunca entrenaste con pesas, empezás con poco peso y lo vas subiendo a medida que agarrás la técnica.`,
  "planta-alta": (planta) =>
    `En la ${minusculaInicial(planta.nombre)} entrenás ${minusculaInicial(planta.foco)} por grupo muscular. Tu planilla te dice qué máquinas usar para cada grupo, y los profes te ajustan las cargas a medida que avanzás.`,
};

/**
 * Seis fotos por planta: tres escenas generales y los primeros destacados en uso.
 * Todo sale del nombre, el foco y los destacados de la planta.
 */
function fotosDeGaleria(planta: Planta): string[] {
  const nombre = minusculaInicial(planta.nombre);
  const escenas = [
    `vista general de la ${nombre}`,
    `alumnos entrenando ${minusculaInicial(planta.foco)}`,
    `un profe acompañando a un alumno en la ${nombre}`,
  ];
  const enUso = planta.destacados
    .slice(0, FOTOS_POR_GALERIA - escenas.length)
    .map((destacado) => `${minusculaInicial(destacado)} en uso`);
  return [...escenas, ...enUso];
}

const focosPorPlanta = plantas
  .map((planta) => `en la ${minusculaInicial(planta.nombre)}, ${minusculaInicial(planta.foco)}`)
  .join("; ");

/**
 * Contenido de la pestaña de una planta. En desktop, "Qué entrenás acá" y "Lo que vas a encontrar" van lado a lado;
 * las fotos de la planta, en una fila que se desliza de costado.
 */
function PanelPlanta({ planta }: { planta: Planta }) {
  const idTitulo = `${planta.id}-titulo`;
  const queEntrenas = QUE_ENTRENAS[planta.id];
  const nombreEnMinuscula = minusculaInicial(planta.nombre);
  const tituloFotos = `Fotos de la ${nombreEnMinuscula}`;
  // Sin texto de "Qué entrenás acá", los destacados usan todo el ancho.
  const columnas = queEntrenas !== undefined ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10" : "";

  return (
    <>
      <h2 id={idTitulo} className="mb-4">
        {planta.nombre}: {minusculaInicial(planta.foco)}
      </h2>

      <div className={`grid gap-6 ${columnas}`}>
        {queEntrenas !== undefined && (
          <div>
            <h3>Qué entrenás acá</h3>
            <p className="mt-3 max-w-[65ch]">{queEntrenas(planta)}</p>
          </div>
        )}

        <div>
          <h3>Lo que vas a encontrar</h3>
          {/*
           * Cuadrados chicos: de a 3 en mobile (de a 2 por debajo de unos 350 px, donde "multiarticular" ya no entra)
           * y todos en una fila desde sm, sean cuantos sean. La etiqueta "Foto: …" (el span de ImagePlaceholder)
           * va más chica para que entre en el cuadrado.
           */}
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-3 sm:grid-flow-col sm:grid-cols-none sm:auto-cols-fr">
            {planta.destacados.map((destacado) => (
              <li key={destacado}>
                <ImagePlaceholder
                  descripcion={`${minusculaInicial(destacado)} de la ${nombreEnMinuscula}`}
                  proporcion="1 / 1"
                  className="[&>span]:text-xs"
                />
                {/* Columnas angostas: si una palabra larga ("multiarticular") no entra, se corta en vez de desbordar. */}
                <p className="mt-2 text-sm leading-snug font-semibold wrap-break-word">{destacado}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mt-6">{tituloFotos}</h3>
      <div role="region" aria-label={tituloFotos} tabIndex={0} className="fila-deslizable mt-3">
        {fotosDeGaleria(planta).map((foto) => (
          <ImagePlaceholder key={foto} descripcion={foto} proporcion="4 / 3" />
        ))}
      </div>
    </>
  );
}

export default function Instalaciones() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>Instalaciones</h1>
      <p className="intro mt-4">
        {negocio.nombre} está en una zona céntrica de {negocio.direccion.localidad} y ocupa {cantidadDePlantas}{" "}
        plantas, cada una con su foco. {capitalizar(focosPorPlanta)}. Con cualquier plan usás las{" "}
        {cantidadDePlantas}.
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
        clasePanel="mt-6 border-t border-border pt-6"
        opciones={plantas.map((planta) => ({
          id: planta.id,
          etiqueta: (
            <span className="flex flex-col">
              <span>{planta.nombre}</span>{" "}
              <span className="text-sm font-normal text-balance">{planta.foco}</span>
            </span>
          ),
          contenido: <PanelPlanta planta={planta} />,
        }))}
      />
    </div>
  );
}
