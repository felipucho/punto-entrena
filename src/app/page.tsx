import { existsSync } from "node:fs";
import path from "node:path";
import contenido from "../../content/paginas/inicio.json";
import { InicioDocument, type InicioQuery } from "../../tina/__generated__/types";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Inicio from "@/components/Inicio";
import { negocio, plantas } from "@/data/site";
import { formatearPrecio, minusculaInicial, precioPorClase } from "@/lib/formato";
import { paseLibre } from "@/lib/planes";
import { metadataDePagina, tituloInicio } from "@/lib/seo";

const { localidad, provincia } = negocio.direccion;

const plan = paseLibre();
const nombrePaseLibre = minusculaInicial(plan.nombre);

export const metadata = metadataDePagina({
  titulo: tituloInicio,
  descripcion: `Gimnasio de musculación y funcional en ${localidad}, ${provincia}. Los profes te arman tu planilla. Con el ${nombrePaseLibre}, cada clase sale ${formatearPrecio(precioPorClase(plan))}.`,
  ruta: "/",
  absoluto: true,
});

/** El video del hero se muestra solo cuando está subido a public/video/ (specs en HeroVideo.tsx). */
const hayVideo = existsSync(path.join(process.cwd(), "public", "video", "hero-720.mp4"));

/** Qué muestra la foto de cada tarjeta de la home. */
const fotosDeTarjetas: Record<string, string> = {
  planes: "una persona entrenando con su planilla",
  horarios: "el frente del gimnasio",
  instalaciones: `la ${minusculaInicial(plantas[0].nombre)} del gimnasio`,
  equipo: "los profes del gimnasio",
  objetivos: "un profe acompañando a un alumno durante un ejercicio",
};

// Los textos se leen del JSON al compilar, sin servidor de Tina. En /admin, Tina toma el control y los edita en vivo.
export default function Pagina() {
  return (
    <Inicio
      query={InicioDocument}
      variables={{ relativePath: "inicio.json" }}
      data={{ inicio: contenido } as InicioQuery}
      hayVideo={hayVideo}
      fotos={Object.fromEntries(
        Object.entries(fotosDeTarjetas).map(([id, descripcion]) => [
          id,
          <ImagePlaceholder
            key={id}
            descripcion={descripcion}
            proporcion="3 / 2"
            className="w-24 shrink-0 sm:w-32 lg:w-24 xl:w-full [&>span]:line-clamp-2 [&>span]:text-xs xl:[&>span]:line-clamp-none xl:[&>span]:text-sm"
          />,
        ]),
      )}
    />
  );
}
