import contenido from "@content/paginas/contacto.json";
import Contacto from "@/components/paginas/Contacto";
import { negocio } from "@/data/site";
import { direccionCorta } from "@/lib/formato";
import { horarioGeneralCorto } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Contacto y cómo llegar",
  descripcion: `Escribinos por WhatsApp o llamanos al ${negocio.telefono.visible}. Estamos en ${direccionCorta()}. ${horarioGeneralCorto()}.`,
  ruta: "/contacto",
});

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return <Contacto c={contenido} />;
}
