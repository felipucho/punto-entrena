"use client";

import { useMemo, type ComponentProps, type ComponentType } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import {
  ContactoDocument,
  EquipoDocument,
  FaqDocument,
  HorariosDocument,
  InicioDocument,
  InstalacionesDocument,
  ObjetivosDocument,
  PlanesDocument,
  PrivacidadDocument,
  TerminosDocument,
} from "@tina/__generated__/types";
import Contacto from "@/components/paginas/Contacto";
import Equipo from "@/components/paginas/Equipo";
import Faq from "@/components/paginas/Faq";
import Horarios from "@/components/paginas/Horarios";
import Inicio from "@/components/paginas/Inicio";
import Instalaciones from "@/components/paginas/Instalaciones";
import Objetivos from "@/components/paginas/Objetivos";
import Planes from "@/components/paginas/Planes";
import Privacidad from "@/components/paginas/Privacidad";
import Terminos from "@/components/paginas/Terminos";

/** Cada página editable: su vista y la query de Tina de su JSON (content/paginas/<nombre>.json). */
const PAGINAS = {
  contacto: { Vista: Contacto, query: ContactoDocument },
  equipo: { Vista: Equipo, query: EquipoDocument },
  faq: { Vista: Faq, query: FaqDocument },
  horarios: { Vista: Horarios, query: HorariosDocument },
  inicio: { Vista: Inicio, query: InicioDocument },
  instalaciones: { Vista: Instalaciones, query: InstalacionesDocument },
  objetivos: { Vista: Objetivos, query: ObjetivosDocument },
  planes: { Vista: Planes, query: PlanesDocument },
  privacidad: { Vista: Privacidad, query: PrivacidadDocument },
  terminos: { Vista: Terminos, query: TerminosDocument },
};

type Paginas = typeof PAGINAS;
export type NombrePagina = keyof Paginas;
type PropsDeVista<N extends NombrePagina> = ComponentProps<Paginas[N]["Vista"]>;

type Props<N extends NombrePagina> = {
  pagina: N;
  /** El contenido tal cual lo leyó el servidor del JSON. */
  c: PropsDeVista<N>["c"];
} & Omit<PropsDeVista<N>, "c" | "campo">;

/**
 * Solo en edición (npm run dev → /admin): useTina recibe los cambios del editor y los muestra en vivo, y tinaField
 * marca cada texto para editarlo con un clic. En producción la página renderiza la vista directo en el servidor.
 */
export default function ConTina<N extends NombrePagina>({ pagina, c, ...extra }: Props<N>) {
  const { Vista, query } = PAGINAS[pagina];
  // useTina copia `data` al estado en un efecto que depende de ella: con un objeto nuevo en cada render entra en un
  // bucle infinito y pisa lo que manda el editor. Por eso se memoiza.
  const inicial = useMemo(() => ({ [pagina]: c }), [pagina, c]);
  const { data } = useTina({ query, variables: { relativePath: `${pagina}.json` }, data: inicial });
  const VistaDePagina = Vista as ComponentType<Record<string, unknown>>;
  return <VistaDePagina {...extra} c={data[pagina]} campo={tinaField} />;
}
