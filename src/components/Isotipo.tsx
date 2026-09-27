/**
 * Isotipo de Punto: la P geométrica con el corte diagonal en la barra, la panza separada del asta, la pata cortada
 * con su cuña amarilla y el punto arriba a la derecha. Redibujado a mano sobre el logo horizontal (medido en el
 * archivo de marca) mientras llega el vector original. Es decorativo: el nombre siempre va al lado como texto.
 * Los colores salen de los tokens (.isotipo-p toma el color del texto; la cuña y el punto, --color-punto).
 */
export default function Isotipo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 467 505" aria-hidden="true" focusable="false" className={`isotipo ${className}`.trim()}>
      <path className="isotipo-p" d="M0 62H254A126 126 0 0 1 254 314H169V240H218A52 52 0 0 0 218 136H93Z" />
      <path className="isotipo-p" d="M59 151H154V324L59 505Z" />
      <path className="isotipo-corte" d="M154 324V383L59 505Z" />
      <circle className="isotipo-punto" cx="431" cy="36" r="36" />
    </svg>
  );
}
