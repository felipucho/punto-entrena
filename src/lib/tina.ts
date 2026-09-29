import type { tinaField } from "tinacms/dist/react";

/**
 * Tina solo edita en local (npm run dev → /admin): ahí cada página se envuelve en ConTina, que usa useTina para
 * actualizar los textos en vivo. En producción devuelve null y la página renderiza su vista en el servidor.
 * El import va dinámico y adentro del if a propósito: con un import estático, ConTina (y Tina) entraban al JS de
 * producción aunque nunca se renderizaran.
 */
export async function editorDeTina() {
  if (process.env.NODE_ENV === "development") return (await import("@/components/ConTina")).default;
  return null;
}

/** Da el valor de data-tina-field de un campo: tinaField en edición, undefined (sin atributo) en producción. */
export type Campo = typeof tinaField;

// undefined hace que React no escriba el atributo; tinaField devolvería un identificador que en producción no sirve.
export const sinCampo = (() => undefined) as unknown as Campo;
