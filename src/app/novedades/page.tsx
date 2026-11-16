import contenido from "@content/paginas/novedades.json";
import JsonLd from "@/components/JsonLd";
import Novedades from "@/components/paginas/Novedades";
import { negocio } from "@/data/site";
import { jsonLdMigas, metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Novedades",
  descripcion: `Feriados, cambios de horario y avisos de ${negocio.nombre}, en ${negocio.direccion.localidad}.`,
  ruta: "/novedades",
});

export default function Pagina() {
  return (
    <>
      <Novedades c={contenido} />

      <JsonLd datos={jsonLdMigas("/novedades")} />
    </>
  );
}
