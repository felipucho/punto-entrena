import contenido from "../../../content/paginas/terminos.json";
import { TerminosDocument } from "../../../tina/__generated__/types";
import Terminos from "@/components/paginas/Terminos";
import { negocio } from "@/data/site";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Términos y condiciones",
  descripcion: `Condiciones de uso del sitio de ${negocio.nombre}: precios y horarios informativos, a confirmar por WhatsApp, y enlaces a otros servicios.`,
  ruta: "/terminos",
});

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Terminos
      query={TerminosDocument}
      variables={{ relativePath: "terminos.json" }}
      data={{ terminos: contenido }}
    />
  );
}
