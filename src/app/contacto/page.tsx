import contenido from "@content/paginas/contacto.json";
import Contacto from "@/components/paginas/Contacto";
import { negocio } from "@/data/site";
import { direccionCorta } from "@/lib/formato";
import { horarioGeneralCorto } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

const LARGO_MAXIMO_DESCRIPCION = 155;

const baseDescripcion = `Escribinos por WhatsApp o llamanos al ${negocio.telefono.visible}. Estamos en ${direccionCorta()}.`;
const descripcionCompleta = `${baseDescripcion} ${horarioGeneralCorto()}.`;

export const metadata = metadataDePagina({
  titulo: "Contacto y cómo llegar",
  // Si con el horario no entra en 155 caracteres, queda sin horario: el detalle está en la página.
  descripcion: descripcionCompleta.length <= LARGO_MAXIMO_DESCRIPCION ? descripcionCompleta : baseDescripcion,
  ruta: "/contacto",
});

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return <Contacto c={contenido} />;
}
