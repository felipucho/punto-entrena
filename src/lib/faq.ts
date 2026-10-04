import { claseSuelta, negocio, preguntas, type ClaveInterpolada, type Pregunta } from "@/data/site";
import { formatearLista, formatearPrecio, precioPorClase } from "@/lib/formato";
import { diasDeApertura } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";

/** Línea del descuento familiar, usada en /faq y en /planes. */
export function textoDescuentoFamiliar(): string {
  const { porcentaje, familiares } = negocio.descuentoFamiliar;
  return `Si entrenás con un familiar, hay un ${porcentaje} % de descuento. Vale para ${formatearLista(familiares)}.`;
}

const respuestasInterpoladas: Record<ClaveInterpolada, () => string> = {
  paseLibre: () => {
    const plan = paseLibre();
    return `Es el plan para venir todos los días, de ${diasDeApertura()}. Son ${plan.clasesPorMes} días por mes a ${formatearPrecio(plan.precio)}, o sea ${formatearPrecio(precioPorClase(plan))} cada una. Te conviene si tenés horarios rotativos o venís de otra localidad.`;
  },
  descuentoFamiliar: () => {
    const { porcentaje, familiares } = negocio.descuentoFamiliar;
    return `Sí, hay un ${porcentaje} % de descuento. Vale para ${formatearLista(familiares)}.`;
  },
  edadMinima: () =>
    `Desde los ${negocio.edadMinima} años.`,
  claseSuelta: () =>
    `Sí, con un ${claseSuelta.nombre.toLowerCase()}, que sale ${formatearPrecio(claseSuelta.precio)}. Si te gusta, después elegís el plan.`,
  mediosDePago: () => negocio.mediosDePago,
};

function respuestaDe(pregunta: Pregunta): string {
  return typeof pregunta.respuesta === "string"
    ? pregunta.respuesta
    : respuestasInterpoladas[pregunta.respuesta.interpolar]();
}

/** Preguntas del FAQ con todas las respuestas ya armadas desde los datos. */
export function preguntasResueltas(): { pregunta: string; respuesta: string }[] {
  return preguntas.map((p) => ({ pregunta: p.pregunta, respuesta: respuestaDe(p) }));
}
