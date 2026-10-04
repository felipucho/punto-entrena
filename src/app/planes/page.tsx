import contenido from "@content/paginas/planes.json";
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
  descripcion: `Planes de gimnasio en ${localidad} desde ${formatearPrecio(masBarato.precio)} por mes. Con el ${nombrePase}, cada día te sale ${formatearPrecio(precioClasePase)}. Para probar, un ${nombreSuelta} sale ${formatearPrecio(claseSuelta.precio)}.`,
  ruta: "/planes",
});

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return <Planes c={contenido} />;
}
