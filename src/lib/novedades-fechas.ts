// Fechas de las novedades. Módulo aparte, sin dependencias de node: lo usan también el panel y su vista previa (navegador).

/** Argentina no tiene horario de verano desde 2009: America/Argentina/Cordoba es siempre UTC-3. */
const HORAS_DE_DIFERENCIA_ARGENTINA = 3;

/** Instante UTC → "2026-11-20T10:00" en hora de Argentina, el formato que guarda el panel. */
export function fechaArgentina(instante: number): string {
  return new Date(instante - HORAS_DE_DIFERENCIA_ARGENTINA * 3_600_000).toISOString().slice(0, 16);
}

/**
 * "2026-11-20T10:00" (hora de Argentina, como la guarda el panel) → instante real en milisegundos UTC.
 * Devuelve NaN si el formato no es ese. El servidor de Vercel corre en UTC, así que no se puede usar new Date(fecha).
 */
export function instanteDePublicacion(fecha: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(fecha);
  if (!m) return Number.NaN;
  const [anio, mes, dia, hora, minuto] = m.slice(1).map(Number);
  const instante = Date.UTC(anio, mes - 1, dia, hora + HORAS_DE_DIFERENCIA_ARGENTINA, minuto);
  // Date.UTC desborda (mes 13, 30 de febrero, 24:00) en vez de fallar: si no vuelve a la misma fecha, no existe.
  return fechaArgentina(instante) === fecha ? instante : Number.NaN;
}

/** Si la hora de publicación ya llegó. Una fecha inválida nunca se publica. */
export function estaPublicada(fecha: string, ahora: number = Date.now()): boolean {
  return instanteDePublicacion(fecha) <= ahora;
}

const fechaLarga = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" });

/**
 * "2026-11-15" o "2026-11-15T10:00" → "15 de noviembre de 2026" (la hora no se muestra).
 * Se arma con Date.UTC y se formatea en UTC: formatear en la zona local del servidor correría el día.
 */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  return fechaLarga.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

/** Lo que avisa el panel de una novedad que todavía no llegó a su hora, o null si ya está publicada (o la fecha no es válida). */
export function avisoEnCola(fecha: string | null, ahora: number): string | null {
  if (fecha === null || Number.isNaN(instanteDePublicacion(fecha)) || estaPublicada(fecha, ahora)) return null;
  return `En cola: se publica el ${formatearFecha(fecha)} a las ${fecha.slice(11, 16)}.`;
}
