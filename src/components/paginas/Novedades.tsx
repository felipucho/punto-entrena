import type contenido from "@content/paginas/novedades.json";
import ArticuloNovedad from "@/components/ArticuloNovedad";
import { novedades } from "@/lib/novedades";

/** /novedades. Los textos fijos salen de content/paginas/novedades.json; las novedades ya publicadas, de content/novedades/ (se editan en /panel). */
export default async function Novedades({ c }: { c: typeof contenido }) {
  const lista = await novedades();

  return (
    <div className="contenedor pt-section pb-section">
      <h1>{c.titulo}</h1>
      <p className="intro mt-4">{c.intro}</p>

      {lista.length === 0 ? (
        <p className="mt-section">{c.vacio}</p>
      ) : (
        <div className="mt-section grid max-w-[65ch] gap-10">
          {lista.map((n) => (
            <ArticuloNovedad key={`${n.fecha}-${n.titulo}`} {...n} />
          ))}
        </div>
      )}
    </div>
  );
}
