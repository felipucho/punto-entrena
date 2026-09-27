import contenido from "../../../content/paginas/horarios.json";
import { HorariosDocument } from "../../../tina/__generated__/types";
import Horarios from "@/components/paginas/Horarios";
import { negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Gimnasio en ${negocio.direccion.localidad}, abierto de ${minusculaInicial(horarioGeneral())}`;
const descripcionCompleta = `${baseDescripcion} Mirá qué profe está en cada horario.`;

export const metadata = metadataDePagina({
  titulo: "Horarios",
  // Si el horario cambia y la frase final ya no entra en 155 caracteres, queda solo el horario.
  descripcion: descripcionCompleta.length <= LARGO_MAXIMO_DESCRIPCION ? descripcionCompleta : baseDescripcion,
  ruta: "/horarios",
});

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Horarios query={HorariosDocument} variables={{ relativePath: "horarios.json" }} data={{ horarios: contenido }} />
  );
}
