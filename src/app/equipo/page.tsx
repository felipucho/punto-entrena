import contenido from "@content/paginas/equipo.json";
import Foto from "@/components/Foto";
import Equipo from "@/components/paginas/Equipo";
import { negocio, profes } from "@/data/site";
import { formatearLista, nombreCorto } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

export const metadata = metadataDePagina({
  titulo: "Los profes y sus horarios",
  descripcion: `${formatearLista(
    profes.map((profe) => profe.nombre),
  )} son los profes de ${nombreCorto} en ${negocio.direccion.localidad}. Mirá qué días y a qué hora está cada uno.`,
  ruta: "/equipo",
});

/** El retrato de cada profe, por id. */
const retratos = Object.fromEntries(
    profes.map((profe) => [
      profe.id,
      /*
       * Contorno amarillo (no sombra) para el elegido: se sigue viendo en modo de alto contraste.
       * En mobile el cuadro mide unos 66 px: la etiqueta "Foto: …" (el span de Foto) va más chica,
       * con menos padding y cortada con "…", como en las miniaturas del inicio, en vez de quedar recortada
       * por los bordes a mitad de palabra.
       * Cuatro por fila: ~22vw hasta lg (68 px en 375, 220 px en 1023) y ~7rem desde lg, en la columna de 34rem.
       * Los archivos son JPG de 640 × 640, que alcanza para pantallas 3x.
       */
      <Foto
        key={profe.id}
        descripcion={`retrato de ${profe.nombre}`}
        proporcion="1 / 1"
        sizes="(min-width: 64rem) 7rem, 22vw"
        decorativa
        className="w-full [&_img]:filter-none max-sm:p-1.5 max-sm:[&>span]:line-clamp-2 max-sm:[&>span]:text-xs group-aria-selected:outline-3 group-aria-selected:outline-offset-2 group-aria-selected:outline-accent"
      />,
    ]),
  );

// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="equipo" c={contenido} fotos={retratos} />;
  return <Equipo c={contenido} campo={sinCampo} fotos={retratos} />;
}
