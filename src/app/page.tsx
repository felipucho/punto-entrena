import { existsSync } from "node:fs";
import path from "node:path";
import contenido from "@content/paginas/inicio.json";
import Foto from "@/components/Foto";
import Inicio from "@/components/paginas/Inicio";
import { negocio, plantas, profes } from "@/data/site";
import { formatearPrecio, minusculaInicial, precioPorClase } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { metadataDePagina, tituloInicio } from "@/lib/seo";

const { localidad, provincia } = negocio.direccion;

const plan = paseLibre();
const nombrePaseLibre = minusculaInicial(plan.nombre);

export const metadata = metadataDePagina({
  titulo: tituloInicio,
  descripcion: `Gimnasio de musculación y funcional en ${localidad}, ${provincia}. Los profes te arman tu planilla. Con el ${nombrePaseLibre}, cada día sale ${formatearPrecio(precioPorClase(plan))}.`,
  ruta: "/",
  absoluto: true,
});

/** El video del hero se muestra solo cuando están subidos los cuatro archivos a public/video/ (specs en HeroVideo.tsx). */
const hayVideo = ["1080", "720"].every((calidad) =>
  ["webm", "mp4"].every((formato) =>
    existsSync(path.join(process.cwd(), "public", "video", `hero-${calidad}.${formato}`)),
  ),
);

/**
 * Foto de cada tarjeta de la home: qué muestra y, si ya existe, el archivo en public/fotos/.
 * Planes, horarios y objetivos todavía no tienen foto real: queda el lugar reservado.
 */
const fotosDeTarjetas: Record<string, { descripcion: string; archivo?: string }> = {
  planes: { descripcion: "una persona entrenando con su planilla" },
  horarios: { descripcion: "el frente del gimnasio" },
  instalaciones: {
    descripcion: `la ${minusculaInicial(plantas[0].nombre)} del gimnasio`,
    archivo: "planta-baja/vista-general-mancuernas-y-cintas",
  },
  objetivos: { descripcion: "un profe acompañando a un alumno durante un ejercicio" },
};

/*
 * Miniatura al costado del texto hasta xl (6rem; 8rem entre sm y lg) y ancho de columna desde xl (cinco columnas
 * en el contenedor de 72rem: unos 11rem). Las fotos reales ya vienen en el gris de Punto: sin filtro.
 */
const CLASE_MINIATURA = "w-24 shrink-0 sm:w-32 lg:w-24 xl:w-full";
const SIZES_MINIATURA = "(min-width: 80rem) 11rem, (min-width: 64rem) 6rem, (min-width: 40rem) 8rem, 6rem";

function fotoDeTarjeta(id: string) {
  const { descripcion, archivo } = fotosDeTarjetas[id];
  return (
    <Foto
      key={id}
      descripcion={descripcion}
      archivo={archivo}
      proporcion="3 / 2"
      sizes={SIZES_MINIATURA}
      className={`${CLASE_MINIATURA} [&_img]:filter-none [&>span]:line-clamp-2 [&>span]:text-xs xl:[&>span]:line-clamp-none xl:[&>span]:text-sm`}
    />
  );
}

/** Equipo: los cuatro retratos en un mosaico de 2 × 2, así la tarjeta no pone a un solo profe por todos. */
const mosaicoDeProfes = (
  <span key="equipo" aria-hidden="true" className={`grid grid-cols-2 gap-0.5 overflow-hidden rounded-card ${CLASE_MINIATURA}`}>
    {profes.map((profe) => (
      <Foto
        key={profe.id}
        descripcion={`retrato de ${profe.nombre}`}
        proporcion="3 / 2"
        sizes="(min-width: 80rem) 5.5rem, (min-width: 64rem) 3rem, (min-width: 40rem) 4rem, 3rem"
        decorativa
        className="rounded-none! [&_img]:object-top [&_img]:filter-none"
      />
    ))}
  </span>
);

const fotos = {
  ...Object.fromEntries(Object.keys(fotosDeTarjetas).map((id) => [id, fotoDeTarjeta(id)])),
  equipo: mosaicoDeProfes,
};

// Los textos se leen del JSON al compilar.
export default function Pagina() {
  return <Inicio c={contenido} fotos={fotos} hayVideo={hayVideo} />;
}
