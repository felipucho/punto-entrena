import contenido from "@content/paginas/contacto.json";
import { ContactoDocument } from "@tina/__generated__/types";
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

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Contacto
      query={ContactoDocument}
      variables={{ relativePath: "contacto.json" }}
      data={{ contacto: contenido }}
    />
  );
}
