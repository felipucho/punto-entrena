import contenido from "@content/paginas/privacidad.json";
import Privacidad from "@/components/paginas/Privacidad";
import { negocio } from "@/data/site";
import { metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

export const metadata = metadataDePagina({
  titulo: "Política de privacidad",
  descripcion: `El sitio de ${negocio.nombre} no tiene formularios ni cookies propias. Qué pasa con el mapa de Google, WhatsApp y tus derechos por la Ley 25.326.`,
  ruta: "/privacidad",
});

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  if (ConTina) return <ConTina pagina="privacidad" c={contenido} />;
  return <Privacidad c={contenido} campo={sinCampo} />;
}
