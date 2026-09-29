import contenido from "@content/paginas/faq.json";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/paginas/Faq";
import { claseSuelta, negocio } from "@/data/site";
import { formatearPrecio } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { jsonLdFaq, metadataDePagina } from "@/lib/seo";
import { editorDeTina, sinCampo } from "@/lib/tina";

const { localidad } = negocio.direccion;
const pase = paseLibre();

export const metadata = metadataDePagina({
  titulo: "Preguntas frecuentes",
  descripcion: `Cómo empezar a entrenar en ${localidad} y qué llevar el primer día. Desde los ${negocio.edadMinima} años. ${pase.nombre} a ${formatearPrecio(pase.precio)} y ${claseSuelta.nombre.toLowerCase()} a ${formatearPrecio(claseSuelta.precio)} para probar.`,
  ruta: "/faq",
});

// Los textos se leen del JSON al compilar. En /admin (solo en local), ConTina los edita en vivo.
// El JSON-LD queda acá, fuera de la vista: sale de src/lib/faq.ts y no se edita con Tina.
export default async function Pagina() {
  const ConTina = await editorDeTina();
  return (
    <>
      {ConTina ? <ConTina pagina="faq" c={contenido} /> : <Faq c={contenido} campo={sinCampo} />}

      <JsonLd datos={jsonLdFaq()} />
    </>
  );
}
