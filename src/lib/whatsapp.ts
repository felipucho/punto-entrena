import { negocio } from "@/data/site";
import { minusculaInicial } from "@/lib/formato";

/** https://wa.me/{whatsapp}?text={mensaje} */
export function urlWhatsApp(mensaje: string = negocio.mensajeWhatsappGeneral): string {
  return `https://wa.me/${negocio.telefono.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Mensaje de las cards de /planes: "Hola, me interesa el plan pase libre." */
export function mensajePlan(nombrePlan: string): string {
  return `Hola, me interesa el plan ${minusculaInicial(nombrePlan)}.`;
}
