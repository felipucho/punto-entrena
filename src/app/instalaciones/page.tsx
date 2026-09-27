import contenido from "../../../content/paginas/instalaciones.json";
import { InstalacionesDocument } from "../../../tina/__generated__/types";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Instalaciones, { type FotosDePlanta } from "@/components/paginas/Instalaciones";
import { negocio, plantas, type Planta } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";
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
    descripcion = `Gimnasio de musculación y funcional en ${negocio.direccion.localidad}. ${porPlanta.join(" ")} Con cualquier plan usás las ${cantidadDePlantas}.`;
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

/** Las fotos de cada planta, por id. Se arman acá porque ImagePlaceholder lee public/fotos/ del disco. */
function fotosDePlanta(planta: Planta): FotosDePlanta {
  const nombreEnMinuscula = minusculaInicial(planta.nombre);
  return {
    equipamiento: Object.fromEntries(
      planta.destacados.map((destacado) => [
        destacado,
        <ImagePlaceholder
          key={destacado}
          descripcion={`${minusculaInicial(destacado)} de la ${nombreEnMinuscula}`}
          proporcion="1 / 1"
          className="[&>span]:text-xs"
        />,
      ]),
    ),
    galeria: fotosDeGaleria(planta).map((foto) => (
      <ImagePlaceholder key={foto} descripcion={foto} proporcion="4 / 3" />
    )),
  };
}

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Instalaciones
      query={InstalacionesDocument}
      variables={{ relativePath: "instalaciones.json" }}
      data={{ instalaciones: contenido }}
      fotos={Object.fromEntries(plantas.map((planta) => [planta.id, fotosDePlanta(planta)]))}
    />
  );
}
