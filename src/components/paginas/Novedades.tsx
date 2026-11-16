import type contenido from "@content/paginas/novedades.json";
import Foto from "@/components/Foto";
import { formatearFecha, novedades } from "@/lib/novedades";

/** /novedades. Los textos fijos salen de content/paginas/novedades.json; las novedades, de content/novedades.json. */
export default function Novedades({ c }: { c: typeof contenido }) {
  const lista = novedades();

  return (
    <div className="contenedor pt-section pb-section">
      <h1>{c.titulo}</h1>
      <p className="intro mt-4">{c.intro}</p>

      {lista.length === 0 ? (
        <p className="mt-section">{c.vacio}</p>
      ) : (
        <div className="mt-section grid max-w-[65ch] gap-10">
          {lista.map(({ fecha, titulo, texto, foto }) => (
            <article key={`${fecha}-${titulo}`} className="grid gap-4 border-t border-border pt-8">
              <time dateTime={fecha} className="rotulo">{formatearFecha(fecha)}</time>
              <h2>{titulo}</h2>
              {foto !== undefined && <Foto archivo={foto} descripcion={titulo} sizes="(min-width: 768px) 65ch, 100vw" />}
              {texto.split("\n\n").map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
