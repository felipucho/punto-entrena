import contenido from "@content/paginas/planes.json";
import { PlanesDocument } from "@tina/__generated__/types";
import Planes from "@/components/paginas/Planes";
import { claseSuelta, negocio, planes } from "@/data/site";
import { formatearPrecio, precioPorClase } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;

const pase = paseLibre();
const nombrePase = pase.nombre.toLowerCase();
const masBarato = planes.reduce((a, b) => (b.precio < a.precio ? b : a));
const nombreSuelta = claseSuelta.nombre.toLowerCase();
const precioClasePase = precioPorClase(pase);

export const metadata = metadataDePagina({
  titulo: "Planes y precios",
  descripcion: `Planes de gimnasio en ${localidad} desde ${formatearPrecio(masBarato.precio)} por mes. Con el ${nombrePase}, cada clase te sale ${formatearPrecio(precioClasePase)}. Para probar, una ${nombreSuelta} sale ${formatearPrecio(claseSuelta.precio)}.`,
  ruta: "/planes",
});

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return <Planes query={PlanesDocument} variables={{ relativePath: "planes.json" }} data={{ planes: contenido }} />;
}
