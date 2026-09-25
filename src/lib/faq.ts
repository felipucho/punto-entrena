import { claseSuelta, negocio, preguntas, type ClaveInterpolada, type Pregunta } from "@/data/site";
import { formatearLista, formatearPrecio } from "@/lib/formato";
import { diasDeApertura } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";

/** Línea del descuento familiar, usada en /faq y en /planes. */
export function textoDescuentoFamiliar(): string {
  const { porcentaje, familiares } = negocio.descuentoFamiliar;
  return `Si entrenás con tu familia, hay un ${porcentaje} % de descuento para ${formatearLista(familiares)}.`;
}

const respuestasInterpoladas: Record<ClaveInterpolada, () => string> = {
  paseLibre: () => {
    const plan = paseLibre();
    return `Podés venir todos los días, de ${diasDeApertura()}: son ${plan.clasesPorMes} clases por mes y cuesta ${formatearPrecio(plan.precio)}.`;
  },
  descuentoFamiliar: () => {
    const { porcentaje, familiares } = negocio.descuentoFamiliar;
    return `Sí. Hay un ${porcentaje} % de descuento para ${formatearLista(familiares)}.`;
  },
  edadMinima: () => `Se puede entrenar desde los ${negocio.edadMinima} años.`,
  claseSuelta: () =>
    `Sí. La ${claseSuelta.nombre.toLowerCase()} cuesta ${formatearPrecio(claseSuelta.precio)} y te sirve para conocer el gimnasio antes de elegir un plan.`,
  mediosDePago: () => negocio.mediosDePago,
};

export function respuestaDe(pregunta: Pregunta): string {
  return typeof pregunta.respuesta === "string"
    ? pregunta.respuesta
    : respuestasInterpoladas[pregunta.respuesta.interpolar]();
}

/** Preguntas del FAQ con todas las respuestas ya armadas desde los datos. */
export function preguntasResueltas(): { pregunta: string; respuesta: string }[] {
  return preguntas.map((p) => ({ pregunta: p.pregunta, respuesta: respuestaDe(p) }));
}
