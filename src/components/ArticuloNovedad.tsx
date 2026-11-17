import Image from "next/image";
import type { FotoNovedad, TamanoFoto } from "@/lib/novedades";
import { formatearFecha } from "@/lib/novedades-fechas";

/*
 * Una novedad tal como se ve en /novedades. La usan la página y la vista previa del panel (/keystatic), así que lo que
 * se ve en el panel sale del mismo marcado y las mismas clases que en el sitio.
 *
 * Ancho de la foto, como parte de la columna de texto (~620 px en escritorio). La columna es un @container: "escritorio"
 * quiere decir que la columna mide 32rem o más, no que la ventana sea ancha (la vista previa vive en un iframe).
 * Cada foto se estira a ese ancho aunque el archivo sea más chico (se puede ver algo blanda), y conserva su proporción.
 */
const ANCHO: Record<TamanoFoto, string> = {
  chica: "w-1/2 @lg:w-1/3",
  mediana: "w-full @lg:w-2/3",
  grande: "w-full",
};

/**
 * `sizes` de next/image, para que el navegador pida el archivo justo. 600px de ventana es donde la columna llega a 32rem
 * (el CSS de arriba lo decide por la columna, esto por la ventana: en el borde puede pedir un archivo de más o de menos).
 * Los anchos son columna × fracción + el marco; en celular chica es la mitad de la ventana, las otras dos, toda.
 */
const SIZES: Record<TamanoFoto, string> = {
  chica: "(min-width: 600px) 210px, 50vw",
  mediana: "(min-width: 600px) 420px, 100vw",
  grande: "(min-width: 600px) 620px, 100vw",
};

type Props = {
  /** "YYYY-MM-DDTHH:mm" (o solo la fecha). Sin esto no se dibuja el rótulo de fecha. */
  fecha?: string;
  titulo: string;
  texto: string;
  /** `ancho` y `alto` son los de la foto real. */
  foto?: FotoNovedad;
  /** Si falta, mediana (así quedan las novedades cargadas antes de que existiera el campo). */
  tamano?: TamanoFoto;
  /** La foto es una URL cualquiera (la del panel, un blob:): se dibuja con <img> en vez de next/image. */
  sinOptimizar?: boolean;
};

/** La foto a color y entera, sin recorte. El marco se ajusta a la foto en vez de ocupar toda la columna. */
function MarcoFoto({ foto, alt, tamano, sinOptimizar }: { foto: FotoNovedad; alt: string; tamano: TamanoFoto; sinOptimizar: boolean }) {
  const clases = "h-auto w-full rounded-[calc(var(--radius)-1px)]";
  return (
    <figure className={`${ANCHO[tamano]} relative max-w-[calc(100%-1.25rem)] rounded-card border border-border-fuerte bg-surface p-[8px]`}>
      {/* El punto de la marca, afuera abajo a la derecha como punto final; el max-w de arriba le guarda lugar. */}
      <span aria-hidden="true" className="absolute -right-5 bottom-0 size-3 rounded-full bg-punto" />
      {sinOptimizar ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: del panel; next/image no lo optimiza
        <img src={foto.src} alt={alt} width={foto.ancho || undefined} height={foto.alto || undefined} className={clases} />
      ) : (
        <Image src={foto.src} alt={alt} width={foto.ancho} height={foto.alto} sizes={SIZES[tamano]} className={clases} />
      )}
    </figure>
  );
}

export default function ArticuloNovedad({ fecha, titulo, texto, foto, tamano = "mediana", sinOptimizar = false }: Props) {
  return (
    <article className="@container grid min-w-0 gap-4 border-t border-border pt-8 wrap-anywhere">
      {fecha && <time dateTime={fecha.slice(0, 10)} className="rotulo">{formatearFecha(fecha)}</time>}
      {titulo.trim() !== "" && <h2>{titulo}</h2>}
      {foto !== undefined && <MarcoFoto foto={foto} alt={titulo} tamano={tamano} sinOptimizar={sinOptimizar} />}
      {texto.split(/\n\s*\n/).map((parrafo, i) => (
        <p key={i} className="whitespace-pre-line">
          {parrafo.trim()}
        </p>
      ))}
    </article>
  );
}
