import contenido from "@content/paginas/horarios.json";
import JsonLd from "@/components/JsonLd";
import Horarios from "@/components/paginas/Horarios";
import { negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";
import { horarioGeneralCorto } from "@/lib/horarios";
import { jsonLdMigas, metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Gimnasio en ${negocio.direccion.localidad}: ${minusculaInicial(horarioGeneralCorto())}.`;
const descripcionCompleta = `${baseDescripcion} Mirá qué profe está en cada horario.`;

export const metadata = metadataDePagina({
  titulo: "Horarios",
  // Si el horario cambia y la frase final ya no entra en 155 caracteres, queda solo el horario.
  descripcion: descripcionCompleta.length <= LARGO_MAXIMO_DESCRIPCION ? descripcionCompleta : baseDescripcion,
  ruta: "/horarios",
});

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return (
    <>
      <Horarios c={contenido} />

      <JsonLd datos={jsonLdMigas("/horarios")} />
    </>
  );
}
