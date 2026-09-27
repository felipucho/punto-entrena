import contenido from "../../../content/paginas/faq.json";
import { FaqDocument } from "../../../tina/__generated__/types";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/paginas/Faq";
import { claseSuelta, negocio } from "@/data/site";
import { formatearPrecio } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { jsonLdFaq, metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;
const pase = paseLibre();

export const metadata = metadataDePagina({
  titulo: "Preguntas frecuentes",
  descripcion: `Cómo empezar a entrenar en ${localidad} y qué llevar el primer día. Desde los ${negocio.edadMinima} años. ${pase.nombre} a ${formatearPrecio(pase.precio)} y ${claseSuelta.nombre.toLowerCase()} a ${formatearPrecio(claseSuelta.precio)} para probar.`,
  ruta: "/faq",
});

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
// El JSON-LD queda acá, fuera del componente cliente: sale de src/lib/faq.ts y no se edita con Tina.
export default function Pagina() {
  return (
    <>
      <Faq query={FaqDocument} variables={{ relativePath: "faq.json" }} data={{ faq: contenido }} />

      <JsonLd datos={jsonLdFaq()} />
    </>
  );
}
