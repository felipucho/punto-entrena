import contenido from "@content/paginas/instalaciones.json";
import Foto from "@/components/Foto";
import Instalaciones, { type FotosDePlanta } from "@/components/paginas/Instalaciones";
import { fotosInstalaciones } from "@/data/fotos-instalaciones";
import { negocio, plantas, type Planta } from "@/data/site";
import { minusculaInicial, numeroEnPalabras as enPalabras } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

const LARGO_MAXIMO_DESCRIPCION = 155;

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
            sizes="(min-width: 64rem) 8rem, (min-width: 40rem) calc((100vw - 6rem) / 5), 30vw"
            className="[&_img]:filter-none [&>span]:text-xs"
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
        sizes="(min-width: 26rem) 18rem, 75vw"
        className="[&_img]:filter-none"
      />
    )),
  };
}

const fotos = Object.fromEntries(plantas.map((planta) => [planta.id, fotosDePlanta(planta)]));

// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="instalaciones" c={contenido} fotos={fotos} />;
  return <Instalaciones c={contenido} campo={sinCampo} fotos={fotos} />;
}
