import Link from "next/link";
import {
  DIAS_CON_GRILLA,
  capitalizar,
  columnaDelDia,
  franjasOrdenadas,
  formatearHora,
  nombreCortoDeProfe,
  nombreDia,
} from "@/lib/horarios";

/**
 * Tabla semanal: franjas en las filas, lunes a viernes en las columnas.
 * Cada celda muestra el profe de esa franja con link a su ficha en /equipo.
 * En mobile scrollea horizontalmente dentro de su contenedor, con la primera columna (el horario) fija a la izquierda
 * y la cabecera amarilla de las placas (.tabla-grilla, .columna-fija).
 * Filas compactas (py-2) para que entre con poco scroll: el link del profe ocupa toda la celda, así el
 * objetivo táctil tiene al menos 44 px de alto aunque la fila sea baja.
 */
export default function GrillaHorarios() {
  return (
    <div
      role="region"
      aria-labelledby="grilla-titulo"
      tabIndex={0}
      className="tabla-grilla desliza overflow-x-auto rounded-card border border-border"
    >
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption id="grilla-titulo" className="px-4 pt-4 pb-3 text-left">
          {/* El caption mide lo que la tabla y se desliza: en el celular topamos la etiqueta a lo visible para que corte línea. */}
          <span className="etiqueta max-w-[calc(100vw-4.5rem)] sm:max-w-none">Profes por horario</span>
        </caption>
        <thead>
          <tr>
            <th scope="col" className="columna-fija px-4 py-2">
              Horario
            </th>
            {DIAS_CON_GRILLA.map((dia) => (
              <th key={dia} scope="col" className="px-4 py-2">
                {capitalizar(nombreDia(dia))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {franjasOrdenadas().map((franja) => (
            <tr
              key={franja.desde}
              className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-alt"
            >
              <th scope="row" className="columna-fija px-4 py-2 font-semibold whitespace-nowrap">
                {formatearHora(franja.desde)} a {formatearHora(franja.hasta)}
              </th>
              {franja.cerrado ? (
                <td colSpan={DIAS_CON_GRILLA.length} className="franja-cerrada px-4 py-2 text-muted italic">
                  Cerrado
                </td>
              ) : (
                DIAS_CON_GRILLA.map((dia) => {
                  const columna = columnaDelDia(dia);
                  const profe = columna ? franja[columna] : null;
                  return profe ? (
                    <td key={dia} className="p-0">
                      {/* El anillo de foco va hacia adentro: afuera lo cortaría el borde del contenedor que scrollea. */}
                      <Link
                        href={`/equipo#${profe}`}
                        className="enlace flex min-h-11 items-center px-4 focus-visible:-outline-offset-3"
                      >
                        {nombreCortoDeProfe(profe)}
                      </Link>
                    </td>
                  ) : (
                    <td key={dia} className="px-4 py-2 text-muted">
                      Sin profe
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
