import contenido from "@content/paginas/equipo.json";
import Foto, { rutaDeFoto } from "@/components/Foto";
import JsonLd from "@/components/JsonLd";
import Equipo from "@/components/paginas/Equipo";
import { negocio, type Profe, profes } from "@/data/site";
import { formatearLista, nombreCorto } from "@/lib/formato";
import { jsonLdMigas, jsonLdProfes, metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Los profes y sus horarios",
  descripcion: `${formatearLista(
    profes.map((profe) => profe.nombre),
  )} son los profes de ${nombreCorto} en ${negocio.direccion.localidad}. Mirá qué días y a qué hora está cada uno.`,
  ruta: "/equipo",
});

/** Qué muestra el retrato de un profe: el alt de la foto y, pasado a slug, el nombre del archivo en public/fotos/. */
const retratoDe = (profe: Profe) => `retrato de ${profe.nombre}`;

/** El retrato de cada profe, por id. */
const retratos = Object.fromEntries(
    profes.map((profe) => [
      profe.id,
      /*
       * Contorno amarillo (no sombra) para el elegido: se sigue viendo en modo de alto contraste.
       * Cuatro por fila: ~22vw hasta lg (68 px en 375, 220 px en 1023) y ~7rem desde lg, en la columna de 34rem.
       * Los archivos son JPG de 640 × 640, que alcanza para pantallas 3x.
       */
      <Foto
        key={profe.id}
        descripcion={retratoDe(profe)}
        proporcion="1 / 1"
        sizes="(min-width: 64rem) 7rem, 22vw"
        decorativa
        className="w-full [&_img]:filter-none group-aria-selected:outline-3 group-aria-selected:outline-offset-2 group-aria-selected:outline-accent"
      />,
    ]),
  );

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return (
    <>
      <Equipo c={contenido} fotos={retratos} />

      <JsonLd datos={jsonLdProfes((profe) => rutaDeFoto(retratoDe(profe)))} />
      <JsonLd datos={jsonLdMigas("/equipo")} />
    </>
  );
}
