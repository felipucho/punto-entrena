import contenido from "../../../content/paginas/equipo.json";
import { EquipoDocument } from "../../../tina/__generated__/types";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Equipo from "@/components/paginas/Equipo";
import { negocio, profes } from "@/data/site";
import { formatearLista, nombreCorto } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Los profes y sus horarios",
  descripcion: `${formatearLista(
    profes.map((profe) => profe.nombre),
  )} son los profes de ${nombreCorto} en ${negocio.direccion.localidad}. Mirá qué días y a qué hora está cada uno.`,
  ruta: "/equipo",
});

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Equipo
      query={EquipoDocument}
      variables={{ relativePath: "equipo.json" }}
      data={{ equipo: contenido }}
      fotos={Object.fromEntries(
        profes.map((profe) => [
          profe.id,
          /*
           * Contorno amarillo (no sombra) para el elegido: se sigue viendo en modo de alto contraste.
           * En mobile el cuadro mide unos 66 px: la etiqueta "Foto: …" (el span de ImagePlaceholder) va más chica,
           * con menos padding y cortada con "…", como en las miniaturas del inicio, en vez de quedar recortada
           * por los bordes a mitad de palabra.
           */
          <ImagePlaceholder
            key={profe.id}
            descripcion={`retrato de ${profe.nombre}`}
            proporcion="1 / 1"
            decorativa
            className="w-full [&_img]:filter-none max-sm:p-1.5 max-sm:[&>span]:line-clamp-2 max-sm:[&>span]:text-xs group-aria-selected:outline-3 group-aria-selected:outline-offset-2 group-aria-selected:outline-accent"
          />,
        ]),
      )}
    />
  );
}
