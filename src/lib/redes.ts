import { negocio } from "@/data/site";

type ClaveRed = keyof typeof negocio.redes;

const NOMBRES_REDES: Record<ClaveRed, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
};

/** Redes con URL cargada en site.ts, en orden. Las que están en null no aparecen. */
export function redesActivas(): { nombre: string; url: string }[] {
  return (Object.keys(negocio.redes) as ClaveRed[]).flatMap((clave) => {
    const url = negocio.redes[clave];
    return url !== null ? [{ nombre: NOMBRES_REDES[clave], url }] : [];
  });
}
