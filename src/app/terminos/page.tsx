import contenido from "@content/paginas/terminos.json";
import Terminos from "@/components/paginas/Terminos";
import { negocio } from "@/data/site";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

export const metadata = metadataDePagina({
  titulo: "Términos y condiciones",
  descripcion: `Condiciones de uso del sitio de ${negocio.nombre}: precios y horarios informativos, a confirmar por WhatsApp, y enlaces a otros servicios.`,
  ruta: "/terminos",
});

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="terminos" c={contenido} />;
  return <Terminos c={contenido} campo={sinCampo} />;
}
