import contenido from "../../../content/paginas/objetivos.json";
import { ObjetivosDocument } from "../../../tina/__generated__/types";
import Objetivos from "@/components/paginas/Objetivos";
import { negocio, objetivos } from "@/data/site";
import { formatearLista } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;

/** "adultos, adultos mayores, rehabilitación, principiantes y deportistas" */
const listaObjetivos = formatearLista(objetivos.map((o) => o.nombre.toLowerCase()));

export const metadata = metadataDePagina({
  titulo: "Entrenamiento según tu objetivo",
  descripcion: `Entrenamiento para ${listaObjetivos} en ${localidad}. Los profes te arman la planilla según tu caso.`,
  ruta: "/objetivos",
});

// TODO: validar los textos de "Tu primer mes" (content/paginas/objetivos.json) con un profe antes de publicar
// (los mitos de site.ts también están en BORRADOR).
// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Objetivos
      query={ObjetivosDocument}
      variables={{ relativePath: "objetivos.json" }}
      data={{ objetivos: contenido }}
    />
  );
}
