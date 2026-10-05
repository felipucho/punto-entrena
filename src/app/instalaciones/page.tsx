import contenido from "@content/paginas/instalaciones.json";
import Foto from "@/components/Foto";
import Instalaciones, { type FotosDePlanta } from "@/components/paginas/Instalaciones";
import { fotosInstalaciones } from "@/data/fotos-instalaciones";
import { negocio, plantas, type Planta } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const cantidadDePlantas = enPalabras(plantas.length);

/**
 * Sale de la grilla de src/components/paginas/Instalaciones.tsx: cuadrados de 5,75 rem como mínimo con gap de 0,75 rem.
 * Desde lg van 5 en fila en la columna de 3fr, hasta 126 px con el contenedor al máximo; desde sm, 5 en fila a lo ancho.
 * En mobile entran de a 5, 4, 3 o 2 por fila según el ancho: 574, 463 y 353 px son donde entra una columna más.
 * Cada vw aproxima el ancho real con menos de un 7 % de error. Si cambiás esa grilla, rehacé la cuenta.
 */
const SIZES_EQUIPAMIENTO =
  "(min-width: 1224px) 126px, (min-width: 64rem) 10vw, (min-width: 40rem) 18vw, (min-width: 574px) 17vw, (min-width: 463px) 22vw, (min-width: 353px) 29vw, 43vw";

/**
 * Sale de .fila-deslizable (src/app/estilos/componentes.css): columnas de min(75 %, 18rem).
 * El 75 % del contenedor es 75vw − 25,5 px, y 68vw le erra por menos de un 2 % entre 320 y 442 px; desde 442 px
 * manda el tope de 18rem = 306 px. Va en px y no en rem porque en `sizes` el rem vale 16 px y el sitio usa 17 px.
 * Va en vw y no en calc() porque así next/image saca del srcset los anchos chicos que nunca se piden.
 * En un celular de 412 px con densidad 1,75 (el de Lighthouse) o de 375 px con densidad 2 el hueco pide ~490–510 px
 * y el navegador baja la de 512w, no la de 640w.
 */
const SIZES_GALERIA = "(min-width: 442px) 306px, 68vw";

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
 * Las fotos de cada planta, por id. Salen de src/data/fotos-instalaciones.ts (archivos en public/fotos/<planta>/).
 * Un destacado sin foto real deja su lugar reservado. Se arman acá porque Foto lee public/fotos/ del disco.
 * Las fotos vienen de celular, en vertical: la galería las muestra 3 / 4 para no recortarlas.
 * Los archivos ya vienen en el gris de Punto (864 × 1152, de --negro-grano a --gris-100): el filtro de .foto img
 * se apaga para no desaturar ni contrastar dos veces.
 */
function fotosDePlanta(planta: Planta): FotosDePlanta {
  const nombreEnMinuscula = minusculaInicial(planta.nombre);
  const reales = fotosInstalaciones[planta.id];
  return {
    equipamiento: Object.fromEntries(
      planta.destacados.map((destacado) => {
        const foto = reales?.equipamiento[destacado];
        return [
          destacado,
          <Foto
            key={destacado}
            archivo={foto && `${planta.id}/${foto.archivo}`}
            descripcion={foto?.descripcion ?? `${minusculaInicial(destacado)} de la ${nombreEnMinuscula}`}
            proporcion="1 / 1"
            sizes={SIZES_EQUIPAMIENTO}
            className="[&_img]:filter-none"
          />,
        ];
      }),
    ),
    galeria: (reales?.galeria ?? []).map((foto) => (
      <Foto
        key={foto.archivo}
        archivo={`${planta.id}/${foto.archivo}`}
        descripcion={foto.descripcion}
        proporcion="3 / 4"
        sizes={SIZES_GALERIA}
        className="[&_img]:filter-none"
      />
    )),
  };
}

const fotos = Object.fromEntries(plantas.map((planta) => [planta.id, fotosDePlanta(planta)]));

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return <Instalaciones c={contenido} fotos={fotos} />;
}
