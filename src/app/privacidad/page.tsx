import contenido from "../../../content/paginas/privacidad.json";
import { PrivacidadDocument } from "../../../tina/__generated__/types";
import Privacidad from "@/components/paginas/Privacidad";
import { negocio } from "@/data/site";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Política de privacidad",
  descripcion: `El sitio de ${negocio.nombre} no tiene formularios ni cookies propias. Qué pasa con el mapa de Google, WhatsApp y tus derechos por la Ley 25.326.`,
  ruta: "/privacidad",
});

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Privacidad
      query={PrivacidadDocument}
      variables={{ relativePath: "privacidad.json" }}
      data={{ privacidad: contenido }}
    />
  );
}
