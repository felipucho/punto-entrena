import { negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";

/** https://wa.me/{whatsapp}?text={mensaje} */
export function urlWhatsApp(mensaje: string = negocio.mensajeWhatsappGeneral): string {
  return `https://wa.me/${negocio.telefono.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensaje de las cards de /planes: "Hola, quiero arrancar con el plan de 1 vez por semana. ¿Cómo hago?" */
export function mensajePlan(nombrePlan: string): string {
  return `Hola, quiero arrancar con el plan de ${minusculaInicial(nombrePlan)}. ¿Cómo hago?`;
}
