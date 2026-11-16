import datos from "@content/novedades.json";

export type Novedad = {
  /** YYYY-MM-DD */
  fecha: string;
  titulo: string;
  /** Texto plano; los párrafos se separan con una línea en blanco. */
  texto: string;
  /** Ruta en public/fotos/ sin extensión ("novedades/feriado-diciembre"). */
  foto?: string;
};

const fechaLarga = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "UTC" });

/**
 * "2026-11-15" → "15 de noviembre de 2026".
 * Se arma con Date.UTC y se formatea en UTC: new Date("2026-11-15") también es UTC pero formatearlo en la zona local
 * (Argentina, UTC-3) mostraría el 14.
 */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return fechaLarga.format(new Date(Date.UTC(anio, mes - 1, dia)));
}

/** Más nuevas primero. YYYY-MM-DD ordena bien como texto. */
export function ordenarNovedades(lista: readonly Novedad[]): Novedad[] {
  return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Las novedades de content/novedades.json, la más reciente primero. */
export function novedades(): Novedad[] {
  return ordenarNovedades(datos as Novedad[]);
}
