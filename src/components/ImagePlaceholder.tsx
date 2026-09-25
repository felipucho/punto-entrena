type Props = {
  /** Qué va a mostrar la foto real. Se usa en la etiqueta visible y en el aria-label. */
  descripcion: string;
  /** aspect-ratio CSS, por ejemplo "4 / 3" o "16 / 9". */
  proporcion?: string;
  /**
   * La foto acompaña un texto visible que ya dice qué es (por ejemplo, el nombre de un profe dentro de un botón):
   * no se anuncia aparte. Con la foto real va alt="".
   */
  decorativa?: boolean;
  className?: string;
};

/**
 * Lugar reservado para una foto. Se reemplaza por la imagen real en la etapa de diseño
 * (next/image con alt descriptivo y las mismas proporciones, para no mover el layout).
 * Es un span (con display flex) y no un div para poder ir dentro de un botón, como en /equipo.
 */
export default function ImagePlaceholder({
  descripcion,
  proporcion = "4 / 3",
  decorativa = false,
  className = "",
}: Props) {
  return (
    <span
      role={decorativa ? undefined : "img"}
      aria-label={decorativa ? undefined : `Foto: ${descripcion}`}
      aria-hidden={decorativa || undefined}
      style={{ aspectRatio: proporcion }}
      className={`flex items-end overflow-hidden rounded-card bg-placeholder p-3 ${className}`.trim()}
    >
      <span aria-hidden="true" className="text-sm leading-snug text-placeholder-fg">
        Foto: {descripcion}
      </span>
    </span>
  );
}
