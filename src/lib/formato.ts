import { negocio, type Plan } from "@/data/site";

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numeros = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

const listas = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

/** 12500 → "$ 12.500" */
export function formatearPrecio(monto: number): string {
  return pesos.format(monto);
}

/** 4583 → "4.583" */
export function formatearNumero(valor: number): string {
  return numeros.format(valor);
}

/** ["mamá", "papá", "hijos"] → "mamá, papá e hijos" */
export function formatearLista(items: readonly string[]): string {
  return listas.format(items);
}

/** "Punto": el nombre corto del gimnasio, primera palabra del nombre completo. */
export const nombreCorto = negocio.nombre.split(" ")[0];

const EN_PALABRAS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

/** 2 → "dos". Para cantidades chicas dentro de un texto corrido; de 11 en adelante, en cifras. */
export function numeroEnPalabras(cantidad: number): string {
  return EN_PALABRAS[cantidad] ?? formatearNumero(cantidad);
}

/** "Planta baja" → "planta baja". Deja las siglas como "TRX" sin tocar. */
export function minusculaInicial(texto: string): string {
  const segunda = texto.charAt(1);
  const esSigla =
    segunda !== "" && segunda === segunda.toLocaleUpperCase("es") && segunda !== segunda.toLocaleLowerCase("es");
  return esSigla ? texto : texto.charAt(0).toLocaleLowerCase("es") + texto.slice(1);
}

/** Precio de cada clase de un plan, redondeado al peso. */
export function precioPorClase(plan: Pick<Plan, "precio" | "clasesPorMes">): number {
  return Math.round(plan.precio / plan.clasesPorMes);
}

/** "AR" → "Argentina" */
function nombrePais(codigo: string = negocio.direccion.pais): string {
  return new Intl.DisplayNames(["es"], { type: "region" }).of(codigo) ?? codigo;
}

const { calle, localidad, provincia, codigoPostal } = negocio.direccion;

/** "Roque … 28, Las Varillas, Córdoba": para textos corridos. */
export function direccionCorta(): string {
  return `${calle}, ${localidad}, ${provincia}`;
}

/**
 * Dirección del NAP, con los mismos campos que el PostalAddress del JSON-LD:
 * "Roque … 28, 5940 Las Varillas, Córdoba, Argentina".
 */
export function direccionCompleta(): string {
  return `${calle}, ${codigoPostal} ${localidad}, ${provincia}, ${nombrePais()}`;
}

/** Href para llamar por teléfono. */
export function telHref(): string {
  return `tel:${negocio.telefono.tel}`;
}

/**
 * Teléfono del NAP con código de país, igual en el footer y en el JSON-LD:
 * el prefijo de país sale de telefono.tel y el resto, del formato visible ("+54 " + visible).
 */
export function telefonoInternacional(): string {
  const { tel, visible } = negocio.telefono;
  const digitosLocales = visible.replace(/\D/g, "").length;
  return `${tel.slice(0, tel.length - digitosLocales)} ${visible}`;
}

const consultaMapa = encodeURIComponent(`${calle}, ${localidad}, ${provincia}, ${nombrePais()}`);

/** URL del mapa embebido de Google Maps, armada desde la dirección. */
export function urlMapaEmbebido(): string {
  return `https://www.google.com/maps?q=${consultaMapa}&output=embed`;
}

/** URL para abrir la dirección en Google Maps. */
export function urlMapa(): string {
  return `https://www.google.com/maps?q=${consultaMapa}`;
}
