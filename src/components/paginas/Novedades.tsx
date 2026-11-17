import type contenido from "@content/paginas/novedades.json";
import Image from "next/image";
import { formatearFecha, novedades } from "@/lib/novedades";

/** /novedades. Los textos fijos salen de content/paginas/novedades.json; las novedades, de content/novedades/ (se editan en /keystatic). */
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
          {lista.map(({ fecha, titulo, texto, foto }) => (
            <article key={`${fecha}-${titulo}`} className="grid gap-4 border-t border-border pt-8">
              <time dateTime={fecha} className="rotulo">{formatearFecha(fecha)}</time>
              <h2>{titulo}</h2>
              {foto !== undefined && (
                // A color y entera, sin recorte: ancho y alto reales del archivo. 620px es lo que mide la columna de
                // 65ch en escritorio (Roboto 17px); los ch en sizes se calculan con 16px y quedarían cortos.
                <Image
                  src={foto.src}
                  alt={titulo}
                  width={foto.ancho}
                  height={foto.alto}
                  sizes="(min-width: 768px) 620px, 100vw"
                  className="h-auto w-full rounded-card"
                />
              )}
              {texto.split(/\n\s*\n/).map((parrafo, i) => (
                <p key={i} className="whitespace-pre-line">
                  {parrafo.trim()}
                </p>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
