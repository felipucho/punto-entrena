import Link from "next/link";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import EstadoEnVivo from "@/components/EstadoEnVivo";
import HeroVideo from "@/components/HeroVideo";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { negocio, plantas, profes } from "@/data/site";
import {
  direccionCorta,
  formatearLista,
  formatearPrecio,
  minusculaInicial,
  nombreCorto,
  numeroEnPalabras as enLetras,
  precioPorClase,
} from "@/lib/formato";
import { diasDeApertura, horarioGeneral, horarioGeneralCorto } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";
import type { Ruta } from "@/lib/rutas";
import { metadataDePagina, tituloInicio } from "@/lib/seo";

const { localidad, provincia } = negocio.direccion;

const plan = paseLibre();
const nombrePaseLibre = minusculaInicial(plan.nombre);

export const metadata = metadataDePagina({
  titulo: tituloInicio,
  descripcion: `Gimnasio de musculación y funcional en ${localidad}, ${provincia}: ${enLetras(plantas.length)} plantas, planilla armada por los profes y sin turnos. ${horarioGeneralCorto()}.`,
  ruta: "/",
  absoluto: true,
});

const datosRapidos = [
  `${plantas.length} plantas`,
  `${profes.length} profes`,
  horarioGeneralCorto(),
  `Desde ${negocio.edadMinima} años`,
];

const comoEsEntrenar: { id: string; titulo: string; texto: string; href: Ruta; enlace: string }[] = [
  {
    id: "planilla",
    titulo: "Tu propia planilla",
    texto:
      "Los profes te arman la planilla según tu nivel y tu objetivo, y la van ajustando a medida que avanzás. No hace falta que sepas entrenar.",
    href: "/faq",
    enlace: "Leé las preguntas frecuentes",
  },
  {
    id: "sin-turnos",
    titulo: "Venís cuando querés",
    texto: `No sacás turno ni tenés un horario fijo. Venís de ${diasDeApertura()}, en el momento del día que te quede cómodo.`,
    href: "/horarios",
    enlace: "Mirá los horarios",
  },
  {
    id: "profes",
    titulo: "Profes que te acompañan",
    texto: `Son ${enLetras(profes.length)} y la atención es personalizada: te conocen por tu nombre y te guían mientras hacés tu planilla.`,
    href: "/equipo",
    enlace: "Conocé al equipo de profes",
  },
];

const tarjetas: { id: string; href: Ruta; titulo: string; frase: string; foto: string }[] = [
  {
    id: "planes",
    href: "/planes",
    titulo: "Planes y precios",
    frase: `Elegí cuántas veces por semana venís, o sacá el ${nombrePaseLibre}.`,
    foto: "una persona entrenando con su planilla",
  },
  {
    id: "horarios",
    href: "/horarios",
    titulo: "Horarios",
    frase: "Fijate qué profe te atiende según el horario en que venís.",
    foto: "el frente del gimnasio",
  },
  {
    id: "instalaciones",
    href: "/instalaciones",
    titulo: "Instalaciones",
    frase: `Recorré las ${enLetras(plantas.length)} plantas y mirá qué hay en cada una.`,
    foto: `la ${minusculaInicial(plantas[0].nombre)} del gimnasio`,
  },
  {
    id: "equipo",
    href: "/equipo",
    titulo: "Equipo",
    frase: `Conocé a los ${enLetras(profes.length)} profes que te van a acompañar.`,
    foto: "los profes del gimnasio",
  },
  {
    id: "objetivos",
    href: "/objetivos",
    titulo: "Entrenamiento según tu objetivo",
    frase: "Mirá cómo arranca la planilla en cada caso, de principiantes a deportistas.",
    foto: "un profe acompañando a un alumno durante un ejercicio",
  },
];

export default function Inicio() {
  return (
    <>
      <HeroVideo>
        {/* En mobile el hero es más bajo para que asome la sección siguiente. El padding de arriba no baja:
            deja libre el botón de pausa del video, que va arriba a la derecha. */}
        <div className="contenedor flex min-h-[60svh] flex-col justify-end pt-16 pb-12 sm:min-h-[70svh] sm:py-20">
          <h1 className="max-w-[18ch] text-[clamp(2.25rem,1.5rem+3.5vw,4rem)]">Gimnasio en {localidad}</h1>
          <p className="mt-4 text-xl font-bold sm:text-2xl">{negocio.nombre}</p>
          <p className="mt-2 max-w-[40ch] text-lg">{negocio.slogan}</p>
          <BotonWhatsApp variante="claro" mensaje={negocio.mensajeWhatsappGeneral} className="mt-8 self-start" />
        </div>
      </HeroVideo>

      <div className="border-b border-border">
        {/* En mobile el texto deja libre el lugar del botón flotante de WhatsApp, que en la primera vista cae acá. */}
        <div className="contenedor py-3 pr-36 sm:pr-6">
          <EstadoEnVivo />
        </div>
      </div>

      <section aria-labelledby="que-es" className="seccion">
        <div className="contenedor">
          <h2 id="que-es" className="mb-4">
            Qué es {nombreCorto}
          </h2>
          {/* Desde lg el texto y los datos rápidos van lado a lado (datos en 2 × 2) en vez de uno debajo del otro. */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12">
            <div className="prosa">
              <p>
                {negocio.nombre} es un gimnasio de musculación y funcional en el centro de {localidad}, {provincia}.
                Tiene {enLetras(plantas.length)} plantas y con cualquier plan entrenás en las {enLetras(plantas.length)}.
              </p>
              <p>
                No hay clases grupales ni turnos: cada alumno entrena con una planilla individual que arman los profes.
                Si nunca entrenaste o hace mucho que no lo hacés, la planilla arranca desde tu nivel de hoy.
              </p>
            </div>

            <ul
              aria-label={`${nombreCorto} en datos`}
              className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border"
            >
              {datosRapidos.map((dato) => (
                <li key={dato} className="bg-bg p-4 text-lg leading-snug font-bold sm:p-5 sm:text-xl">
                  {dato}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="como-es" className="seccion">
        <div className="contenedor">
          <h2 id="como-es" className="mb-4">
            Cómo es entrenar acá
          </h2>
          {/*
           * En mobile los tres bloques forman una fila que se desliza de costado, como .fila-deslizable, pero el
           * scroll va en este div y no en la lista, para que la lista no pierda su rol. El borde marca dónde
           * termina cada bloque y deja ver que sigue otro. Desde md, tres columnas sin borde.
           */}
          <div
            role="region"
            aria-label={formatearLista(comoEsEntrenar.map((bloque) => bloque.titulo))}
            tabIndex={0}
            className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-3 md:overflow-visible md:pb-0"
          >
            <ul className="grid auto-cols-[min(75%,18rem)] grid-flow-col gap-4 md:grid-flow-row md:grid-cols-3 md:gap-8">
              {comoEsEntrenar.map((bloque) => (
                <li
                  key={bloque.id}
                  className="flex snap-start flex-col rounded-card border border-border p-4 md:border-0 md:p-0"
                >
                  <h3>{bloque.titulo}</h3>
                  <p className="mt-2 max-w-[65ch] grow">{bloque.texto}</p>
                  {/* El link queda abajo de todo, alineado entre bloques, con 44 px de alto para tocarlo cómodo. */}
                  <Link href={bloque.href} className="enlace mt-2 inline-flex min-h-11 items-center self-start">
                    {bloque.enlace}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-card bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-lg font-semibold">
              Con {nombrePaseLibre}, cada clase te sale {formatearPrecio(precioPorClase(plan))}.
            </p>
            <Link href="/planes" className="btn btn-secundario self-start sm:self-auto">
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="conoce-mas" className="seccion">
        <div className="contenedor">
          <h2 id="conoce-mas" className="mb-4">
            Conocé más
          </h2>
          {/*
           * Tarjetas bajas: hasta xl la foto es una miniatura al costado del texto (una columna en mobile, dos
           * desde md, tres desde lg); desde xl las cinco van en una sola fila, con la foto arriba. En lg no
           * entran cinco: palabras como "Entrenamiento" no caben en el ancho de la columna.
           * La miniatura no se estira (items-start) para que conserve la proporción de la foto. En la miniatura,
           * la etiqueta "Foto: …" (el span de ImagePlaceholder) va más chica y cortada en dos líneas con "…", en vez
           * de quedar recortada por arriba a mitad de frase.
           * wrap-break-word es el resguardo para pantallas de 320 px, donde el texto queda muy angosto.
           */}
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
            {tarjetas.map((tarjeta) => (
              <li key={tarjeta.id}>
                <Link
                  href={tarjeta.href}
                  aria-labelledby={`tarjeta-${tarjeta.id}`}
                  aria-describedby={`tarjeta-${tarjeta.id}-frase`}
                  className="card group flex h-full items-start gap-4 p-3 hover:border-fg xl:flex-col xl:p-4"
                >
                  <ImagePlaceholder
                    descripcion={tarjeta.foto}
                    proporcion="3 / 2"
                    className="w-24 shrink-0 sm:w-32 lg:w-24 xl:w-full [&>span]:line-clamp-2 [&>span]:text-xs xl:[&>span]:line-clamp-none xl:[&>span]:text-sm"
                  />
                  <div className="min-w-0 wrap-break-word">
                    <h3 id={`tarjeta-${tarjeta.id}`} className="text-lg group-hover:underline">
                      {tarjeta.titulo}
                    </h3>
                    <p id={`tarjeta-${tarjeta.id}-frase`} className="mt-1 text-muted">
                      {tarjeta.frase}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="cierre" className="seccion">
        <div className="contenedor grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 id="cierre" className="mb-4">
              Vení a conocer {nombreCorto}
            </h2>
            <p className="max-w-[65ch]">
              Escribinos por WhatsApp y te contamos cómo arrancar. Te decimos también qué profe está en el horario en
              que pensás venir.
            </p>
            <BotonWhatsApp mensaje={negocio.mensajeWhatsappGeneral} className="mt-6" />
          </div>
          {/* Entre sm y md, dirección y horario van lado a lado; desde md esta columna ya es la mitad del ancho. */}
          <dl className="grid gap-5 sm:grid-cols-2 md:grid-cols-1 md:pt-2">
            <div>
              <dt className="font-bold">Dirección</dt>
              <dd className="mt-1">
                <address className="not-italic">{direccionCorta()}</address>
              </dd>
            </div>
            <div>
              <dt className="font-bold">Horario</dt>
              <dd className="mt-1">{horarioGeneral()}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
