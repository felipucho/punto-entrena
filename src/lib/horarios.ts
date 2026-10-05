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

type FranjaAbierta = { desde: string; hasta: string; profe: string | null };

/** Franjas abiertas de un día, con el profe que atiende en cada una. */
function franjasAbiertasDelDia(dia: Dia): FranjaAbierta[] {
  const columna = COLUMNA_POR_DIA[dia];
  if (!columna) return [];
  return franjasOrdenadas().flatMap((f) =>
    f.cerrado ? [] : [{ desde: f.desde, hasta: f.hasta, profe: f[columna] }],
  );
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

/** Agrupa días consecutivos de la semana (lunes a domingo) que tienen el mismo horario. */
export function gruposDeDias(): { dias: Dia[]; segmentos: Segmento[] }[] {
  const grupos: { dias: Dia[]; segmentos: Segmento[] }[] = [];
  for (const dia of SEMANA) {
    const segmentos = horarioDelDia(dia);
    const ultimo = grupos.at(-1);
    if (ultimo && mismosSegmentos(ultimo.segmentos, segmentos)) {
      ultimo.dias.push(dia);
    } else {
      grupos.push({ dias: [dia], segmentos });
    }
  }
  return grupos;
}

function rangoDeDias(dias: readonly Dia[], nombres: readonly string[]): string {
  const primero = nombres[dias[0]];
  const ultimo = nombres[dias[dias.length - 1]];
  if (dias.length === 1) return primero;
  if (dias.length === 2) return `${primero} y ${ultimo}`;
  return `${primero} a ${ultimo}`;
}

/** "lunes a viernes": los días que abre el gimnasio, tomados de la grilla. */
export function diasDeApertura(): string {
  const dias = SEMANA.filter((dia) => horarioDelDia(dia).length > 0);
  const seguidos = dias.every((dia, i) => i === 0 || SEMANA.indexOf(dia) === SEMANA.indexOf(dias[i - 1]) + 1);
  if (dias.length > 2 && seguidos) return `${NOMBRES_DIA[dias[0]]} a ${NOMBRES_DIA[dias[dias.length - 1]]}`;
  return formatearLista(dias.map((dia) => NOMBRES_DIA[dia]));
}

/** "de 7 a 12 y de 13 a 21". Los espacios antes de cada hora son no separables (U+00A0) para que no se corte el rango. */
export function describirSegmentos(segmentos: readonly Segmento[]): string {
  return segmentos.map((s) => `de ${formatearHora(s.desde)} a ${formatearHora(s.hasta)}`).join(" y ");
}

/** "7–9 y 13–16" */
export function formatearSegmentos(segmentos: readonly Segmento[]): string {
  return segmentos.map((s) => `${formatearHora(s.desde)}–${formatearHora(s.hasta)}`).join(" y ");
}

/** "Lunes a viernes de 7 a 12 y de 13 a 21. Sábados y domingos cerrado." */
export function horarioGeneral(): string {
  return gruposDeDias()
    .map(({ dias, segmentos }) => {
      const quien = capitalizar(rangoDeDias(dias, PLURALES_DIA));
      return segmentos.length ? `${quien} ${describirSegmentos(segmentos)}.` : `${quien} cerrado.`;
    })
    .join(" ");
}

/** Versión corta para espacios chicos: "Lun. a vie., 7 a 12 y 13 a 21 h". Solo los días abiertos. */
export function horarioGeneralCorto(): string {
  return gruposDeDias()
    .filter((g) => g.segmentos.length > 0)
    .map(({ dias, segmentos }) => {
      const quien = capitalizar(rangoDeDias(dias, ABREVIATURAS_DIA));
      const tramos = segmentos
        .map((s) => `${formatearHora(s.desde)} a ${formatearHora(s.hasta)}`)
        .join(" y ");
      return `${quien}, ${tramos} h`;
    })
    .join(". ");
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
    return actual.profe ? `Abierto ahora · te atiende ${nombreCortoDeProfe(actual.profe)}` : "Abierto ahora";
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
