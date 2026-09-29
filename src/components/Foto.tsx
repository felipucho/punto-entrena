import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

type Props = {
  /**
   * Qué va a mostrar la foto real. Se usa en la etiqueta visible y en el aria-label del lugar reservado, en el alt
   * de la foto real y, pasada a slug, en el nombre del archivo (salvo que se pase `archivo`).
   */
  descripcion: string;
  /** Ruta de la foto en public/fotos/, sin extensión y con subcarpetas si las tiene ("planta-alta/prensa-45"). */
  archivo?: string;
  /** aspect-ratio CSS, por ejemplo "4 / 3" o "16 / 9". */
  proporcion?: string;
  /**
   * La foto acompaña un texto visible que ya dice qué es (por ejemplo, el nombre de un profe dentro de un botón):
   * no se anuncia aparte. Con la foto real va alt="".
   */
  decorativa?: boolean;
  /** sizes de next/image para la foto real (el ancho que ocupa en pantalla). Ajustarlo en cada lugar cuando lleguen las fotos. */
  sizes?: string;
  className?: string;
};

/** Formatos que se buscan en public/fotos/, en este orden. */
const EXTENSIONES = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** "retrato de Matías" → "retrato-de-matias": sin tildes, en minúscula y con guiones. */
function slug(descripcion: string): string {
  return descripcion
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** /fotos/<nombre>.<extensión> si la foto ya está en public/fotos/; si no, null. Se resuelve en el build. */
function fotoReal(nombre: string): string | null {
  const extension = EXTENSIONES.find((ext) => existsSync(path.join(process.cwd(), "public", "fotos", nombre + ext)));
  return extension ? `/fotos/${nombre}${extension}` : null;
}

/**
 * Foto de un lugar del sitio. Si existe public/fotos/<slug de la descripción> (.jpg, .jpeg, .png, .webp o .avif),
 * muestra la foto real con next/image, recortada a la misma proporción para no mover el layout. Si no, deja el
 * lugar reservado con la descripción.
 * Es un span y no un div para poder ir dentro de un botón, como en /equipo.
 * Lee el disco: es un componente de servidor y no se importa desde un componente de cliente.
 */
export default function Foto({
  descripcion,
  archivo,
  proporcion = "4 / 3",
  decorativa = false,
  sizes = "100vw",
  className = "",
}: Props) {
  const foto = fotoReal(archivo ?? slug(descripcion));

  if (foto !== null) {
    return (
      <span
        aria-hidden={decorativa || undefined}
        style={{ aspectRatio: proporcion }}
        className={`foto relative block overflow-hidden rounded-card bg-placeholder ${className}`.trim()}
      >
        <Image src={foto} alt={decorativa ? "" : descripcion} fill sizes={sizes} className="object-cover" />
      </span>
    );
  }

  return (
    <span
      role={decorativa ? undefined : "img"}
      aria-label={decorativa ? undefined : `Foto: ${descripcion}`}
      aria-hidden={decorativa || undefined}
      style={{ aspectRatio: proporcion }}
      className={`foto-pendiente flex items-end overflow-hidden rounded-card p-3 ${className}`.trim()}
    >
      <span aria-hidden="true" className="text-sm leading-snug text-placeholder-fg italic">
        Foto: {descripcion}
      </span>
    </span>
  );
}
