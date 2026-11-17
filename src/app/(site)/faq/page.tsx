import contenido from "@content/paginas/faq.json";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/paginas/Faq";
import { claseSuelta, negocio } from "@/data/site";
import { formatearPrecio } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { jsonLdFaq, jsonLdMigas, metadataDePagina } from "@/lib/seo";

const { localidad } = negocio.direccion;
const pase = paseLibre();

export const metadata = metadataDePagina({
  titulo: "Preguntas frecuentes",
  descripcion: `Cómo empezar a entrenar en ${localidad} y qué llevar el primer día. Desde los ${negocio.edadMinima} años. ${pase.nombre} a ${formatearPrecio(pase.precio)} y ${claseSuelta.nombre.toLowerCase()} a ${formatearPrecio(claseSuelta.precio)} para probar.`,
  ruta: "/faq",
});

// Los textos se leen del JSON al compilar.
// El JSON-LD queda acá, fuera de la vista: sale de src/lib/faq.ts.
export default function Pagina() {
  return (
    <>
      <Faq c={contenido} />

      <JsonLd datos={jsonLdFaq()} />
      <JsonLd datos={jsonLdMigas("/faq")} />
    </>
  );
}
