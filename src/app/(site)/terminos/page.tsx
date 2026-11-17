import contenido from "@content/paginas/terminos.json";
import JsonLd from "@/components/JsonLd";
import Terminos from "@/components/paginas/Terminos";
import { negocio } from "@/data/site";
import { jsonLdMigas, metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Términos y condiciones",
  descripcion: `Condiciones de uso del sitio de ${negocio.nombre}: precios y horarios informativos, a confirmar por WhatsApp, y enlaces a otros servicios.`,
  ruta: "/terminos",
});

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return (
    <>
      <Terminos c={contenido} />

      <JsonLd datos={jsonLdMigas("/terminos")} />
    </>
  );
}
