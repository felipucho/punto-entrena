import contenido from "@content/paginas/contacto.json";
import Contacto from "@/components/paginas/Contacto";
import { negocio } from "@/data/site";
import { direccionCorta } from "@/lib/formato";
import { horarioGeneralCorto } from "@/lib/horarios";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

export const metadata = metadataDePagina({
  titulo: "Contacto y cómo llegar",
  descripcion: `Escribinos por WhatsApp o llamanos al ${negocio.telefono.visible}. Estamos en ${direccionCorta()}. ${horarioGeneralCorto()}.`,
  ruta: "/contacto",
});

// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="contacto" c={contenido} />;
  return <Contacto c={contenido} campo={sinCampo} />;
}
