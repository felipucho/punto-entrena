import contenido from "@content/paginas/horarios.json";
import Horarios from "@/components/paginas/Horarios";
import { negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Gimnasio en ${negocio.direccion.localidad}, abierto de ${minusculaInicial(horarioGeneral())}`;
const descripcionCompleta = `${baseDescripcion} Mirá qué profe está en cada horario.`;

export const metadata = metadataDePagina({
  titulo: "Horarios",
  // Si el horario cambia y la frase final ya no entra en 155 caracteres, queda solo el horario.
  descripcion: descripcionCompleta.length <= LARGO_MAXIMO_DESCRIPCION ? descripcionCompleta : baseDescripcion,
  ruta: "/horarios",
});

// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="horarios" c={contenido} />;
  return <Horarios c={contenido} campo={sinCampo} />;
}
