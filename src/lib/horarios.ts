import { columnaPorDia, grilla, negocio, profes, type ColumnaGrilla } from "@/data/site";
import { formatearLista } from "@/lib/formato";

/** Índice de día como en Date#getDay(): 0 = domingo … 6 = sábado. */
export type Dia = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Segmento = { desde: string; hasta: string };

const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"] as const;
const PLURALES_DIA = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"] as const;
const ABREVIATURAS_DIA = ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."] as const;

/** Qué columna de la grilla usa cada día (dato de site.ts). null = cerrado todo el día. */
const COLUMNA_POR_DIA: Readonly<Record<Dia, ColumnaGrilla | null>> = columnaPorDia;

/** Días de lunes a domingo, el orden en que se lee una semana. */
const SEMANA: readonly Dia[] = [1, 2, 3, 4, 5, 6, 0];

/** Días hábiles de la grilla, en orden (columnas de la tabla de horarios). */
export const DIAS_CON_GRILLA: readonly Dia[] = SEMANA.filter((d) => COLUMNA_POR_DIA[d] !== null);

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function nombreDeColumna(columna: ColumnaGrilla): string {
  const dias = SEMANA.filter((d) => COLUMNA_POR_DIA[d] === columna).map((d) => NOMBRES_DIA[d]);
  return capitalizar(formatearLista(dias));
}

/** { lmv: "Lunes, miércoles y viernes", mj: "Martes y jueves" }, derivado de columnaPorDia. */
export const NOMBRE_COLUMNA: Record<ColumnaGrilla, string> = {
  lmv: nombreDeColumna("lmv"),
  mj: nombreDeColumna("mj"),
};

export function nombreDia(dia: Dia): string {
  return NOMBRES_DIA[dia];
}

export function columnaDelDia(dia: Dia): ColumnaGrilla | null {
  return COLUMNA_POR_DIA[dia];
}

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "07:00" → "7", "13:30" → "13:30". */
export function formatearHora(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return m === 0 ? String(h) : `${h}:${String(m).padStart(2, "0")}`;
}

/** La grilla ordenada por hora de inicio. */
export function franjasOrdenadas() {
  return [...grilla].sort((a, b) => aMinutos(a.desde) - aMinutos(b.desde));
}

type FranjaAbierta = { desde: string; hasta: string; profe: string };

/** Franjas abiertas de un día, con el profe que atiende en cada una. Sin profe en la columna del día, está cerrada. */
function franjasAbiertasDelDia(dia: Dia): FranjaAbierta[] {
  const columna = COLUMNA_POR_DIA[dia];
  if (!columna) return [];
  return franjasOrdenadas().flatMap((f) => {
    const profe = f.cerrado ? null : f[columna];
    return profe ? [{ desde: f.desde, hasta: f.hasta, profe }] : [];
  });
}

/** Une franjas consecutivas (el "hasta" de una es el "desde" de la siguiente). */
function unirConsecutivas(franjas: readonly Segmento[]): Segmento[] {
  const unidas: Segmento[] = [];
  for (const f of franjas) {
    const ultima = unidas.at(-1);
    if (ultima && ultima.hasta === f.desde) {
      ultima.hasta = f.hasta;
    } else {
      unidas.push({ desde: f.desde, hasta: f.hasta });
    }
  }
  return unidas;
}

/** Tramos de apertura de un día, con las franjas consecutivas unidas. */
function horarioDelDia(dia: Dia): Segmento[] {
  return unirConsecutivas(franjasAbiertasDelDia(dia));
}

function mismosSegmentos(a: readonly Segmento[], b: readonly Segmento[]): boolean {
  return a.length === b.length && a.every((s, i) => s.desde === b[i].desde && s.hasta === b[i].hasta);
}

/**
 * Agrupa los días de la semana (lunes a domingo) que tienen el mismo horario, aunque no sean seguidos: lunes,
 * miércoles y viernes pueden compartir un horario y martes y jueves otro.
 */
export function gruposDeDias(): { dias: Dia[]; segmentos: Segmento[] }[] {
  const grupos: { dias: Dia[]; segmentos: Segmento[] }[] = [];
  for (const dia of SEMANA) {
    const segmentos = horarioDelDia(dia);
    const mismoHorario = grupos.find((g) => mismosSegmentos(g.segmentos, segmentos));
    if (mismoHorario) {
      mismoHorario.dias.push(dia);
    } else {
      grupos.push({ dias: [dia], segmentos });
    }
  }
  return grupos;
}

/** "lunes a viernes" si son tres o más días seguidos; si no, la lista: "lunes, miércoles y viernes", "sábados y domingos". */
function nombrarDias(dias: readonly Dia[], nombres: readonly string[]): string {
  const seguidos = dias.every((dia, i) => i === 0 || SEMANA.indexOf(dia) === SEMANA.indexOf(dias[i - 1]) + 1);
  if (dias.length > 2 && seguidos) return `${nombres[dias[0]]} a ${nombres[dias[dias.length - 1]]}`;
  return formatearLista(dias.map((dia) => nombres[dia]));
}

/** "lunes a viernes": los días que abre el gimnasio, tomados de la grilla. */
export function diasDeApertura(): string {
  return nombrarDias(
    SEMANA.filter((dia) => horarioDelDia(dia).length > 0),
    NOMBRES_DIA,
  );
}

/** "de 7 a 12 y de 13 a 21". Los espacios dentro de cada rango son no separables (U+00A0) para que no se corte. */
export function describirSegmentos(segmentos: readonly Segmento[]): string {
  return formatearLista(segmentos.map((s) => `de ${formatearHora(s.desde)} a ${formatearHora(s.hasta)}`));
}

/** "7–9 y 13–16" */
export function formatearSegmentos(segmentos: readonly Segmento[]): string {
  return segmentos.map((s) => `${formatearHora(s.desde)}–${formatearHora(s.hasta)}`).join(" y ");
}

/**
 * "Lunes, miércoles y viernes de 7 a 12, de 13 a 16 y de 17 a 21. Martes y jueves de 7 a 12 y de 13 a 21. Sábados
 * y domingos cerrado."
 */
export function horarioGeneral(): string {
  return gruposDeDias()
    .map(({ dias, segmentos }) => {
      const quien = capitalizar(nombrarDias(dias, PLURALES_DIA));
      return segmentos.length ? `${quien} ${describirSegmentos(segmentos)}.` : `${quien} cerrado.`;
    })
    .join(" ");
}

/** Versión corta, una por grupo de días abiertos: ["Lun., mié. y vie., 7 a 12, 13 a 16 y 17 a 21 h", …]. */
export function horariosCortos(): string[] {
  return gruposDeDias()
    .filter((g) => g.segmentos.length > 0)
    .map(({ dias, segmentos }) => {
      const quien = capitalizar(nombrarDias(dias, ABREVIATURAS_DIA));
      const tramos = formatearLista(segmentos.map((s) => `${formatearHora(s.desde)} a ${formatearHora(s.hasta)}`));
      return `${quien}, ${tramos} h`;
    });
}

/** Versión corta en una línea, para la descripción de las páginas: los grupos separados por punto. */
export function horarioGeneralCorto(): string {
  return horariosCortos().join(". ");
}

/** Horarios de atención de un profe por columna de la grilla, con franjas consecutivas unidas. */
export function horariosDeProfe(id: string): Record<ColumnaGrilla, Segmento[]> {
  const deColumna = (columna: ColumnaGrilla) =>
    unirConsecutivas(
      franjasOrdenadas().flatMap((f) => (!f.cerrado && f[columna] === id ? [{ desde: f.desde, hasta: f.hasta }] : [])),
    );
  return { lmv: deColumna("lmv"), mj: deColumna("mj") };
}

export function nombreCortoDeProfe(id: string): string {
  const profe = profes.find((p) => p.id === id);
  if (!profe) throw new Error(`Profe desconocido en la grilla: ${id}`);
  return profe.corto;
}

const DIA_POR_ABREVIATURA_EN: Record<string, Dia> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const relojLocal = new Intl.DateTimeFormat("en-US", {
  timeZone: negocio.zonaHoraria,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Día y minuto del día en la zona horaria del gimnasio, sin importar la del dispositivo. */
function momentoEnElGimnasio(fecha: Date): { dia: Dia; minutos: number } {
  const partes = Object.fromEntries(relojLocal.formatToParts(fecha).map((p) => [p.type, p.value]));
  return {
    dia: DIA_POR_ABREVIATURA_EN[partes.weekday],
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

/** Estado en vivo del gimnasio para la fecha dada, calculado en la hora de Córdoba. */
export function getEstado(fecha: Date): string {
  const { dia, minutos } = momentoEnElGimnasio(fecha);
  const hoy = franjasAbiertasDelDia(dia);

  const actual = hoy.find((f) => aMinutos(f.desde) <= minutos && minutos < aMinutos(f.hasta));
  if (actual) {
    return `Abierto ahora · te atiende ${nombreCortoDeProfe(actual.profe)}`;
  }

  const proximaHoy = hoy.find((f) => aMinutos(f.desde) > minutos);
  if (proximaHoy) return `Cerrado · abrimos hoy a las ${formatearHora(proximaHoy.desde)}`;

  for (let salto = 1; salto <= 7; salto++) {
    const otroDia = ((dia + salto) % 7) as Dia;
    const primera = franjasAbiertasDelDia(otroDia)[0];
    if (!primera) continue;
    const cuando = salto === 1 ? "mañana" : `el ${NOMBRES_DIA[otroDia]}`;
    return `Cerrado · abrimos ${cuando} a las ${formatearHora(primera.desde)}`;
  }
  return "Cerrado";
}
