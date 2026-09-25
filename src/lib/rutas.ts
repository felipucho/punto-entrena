export type Enlace = { href: string; label: string };

/** Links de la nav principal, en orden. "Contacto" va aparte como botón destacado. */
export const navegacion: readonly Enlace[] = [
  { href: "/planes", label: "Planes" },
  { href: "/horarios", label: "Horarios" },
  { href: "/instalaciones", label: "Instalaciones" },
  { href: "/equipo", label: "Equipo" },
  { href: "/objetivos", label: "Objetivos" },
  { href: "/faq", label: "FAQ" },
];

export const enlaceContacto: Enlace = { href: "/contacto", label: "Contacto" };

/** Las 10 rutas del sitio, para el sitemap. */
export const rutas = [
  "/",
  "/planes",
  "/horarios",
  "/instalaciones",
  "/equipo",
  "/objetivos",
  "/faq",
  "/contacto",
  "/privacidad",
  "/terminos",
] as const;

export type Ruta = (typeof rutas)[number];
