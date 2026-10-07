import Link from "next/link";
import type { ReactNode } from "react";
import type contenido from "@content/paginas/inicio.json";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import EstadoEnVivo from "@/components/EstadoEnVivo";
import HeroVideo from "@/components/HeroVideo";
import Isotipo from "@/components/Isotipo";
import ScrollerFoco from "@/components/ScrollerFoco";
import { negocio, plantas, profes } from "@/data/site";
import {
  direccionCorta,
  formatearLista,
  formatearPrecio,
  minusculaInicial,
  nombreCorto,
  precioPorClase,
} from "@/lib/formato";
import { horarioGeneral, horariosCortos } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";
import type { Ruta } from "@/lib/rutas";

const { localidad } = negocio.direccion;

const plan = paseLibre();
const nombrePaseLibre = minusculaInicial(plan.nombre);

/**
 * Los datos del bloque amarillo. El horario, lo que más se consulta, va primero y grande, un renglón por grupo de
 * días con el mismo horario; el resto en una fila.
 */
const datosRapidos = [
  ...horariosCortos().map((texto) => ({ texto, grande: true })),
  { texto: `${plantas.length} plantas`, grande: false },
  { texto: `${profes.length} profes`, grande: false },
  { texto: `Desde ${negocio.edadMinima} años`, grande: false },
];

/**
 * La home. Los textos fijos salen de content/paginas/inicio.json.
 * Lo que sale de src/data/site.ts o se calcula (plantas, profes, precios, horarios) sigue en el código.
 */
export default function Inicio({
  c,
  fotos,
  hayVideo,
}: {
  c: typeof contenido;
  /** La foto de cada tarjeta, por id. Se arma en el servidor porque Foto lee public/fotos/ del disco. */
  fotos: Record<string, ReactNode>;
  /** Si public/video/ ya tiene el video del hero. Se resuelve en el servidor. */
  hayVideo: boolean;
}) {
  const t = c.tarjetas;

  const comoEsEntrenar: {
    id: string;
    titulo: string;
    texto: string;
    href: Ruta;
    enlace: string;
  }[] = [
    {
      id: "planilla",
      titulo: c.planillaTitulo,
      texto: c.planillaTexto,
      href: "/faq",
      enlace: c.planillaEnlace,
    },
    {
      id: "plantas",
      titulo: c.plantasTitulo,
      texto: c.plantasTexto,
      href: "/instalaciones",
      enlace: c.plantasEnlace,
    },
    {
      id: "profes",
      titulo: c.profesTitulo,
      texto: c.profesTexto,
      href: "/equipo",
      enlace: c.profesEnlace,
    },
  ];

  const tarjetas: { id: string; href: Ruta; titulo: string; frase: string }[] = [
    {
      id: "planes",
      href: "/planes",
      titulo: t.planes.titulo,
      frase: t.planes.frase,
    },
    {
      id: "horarios",
      href: "/horarios",
      titulo: t.horarios.titulo,
      frase: t.horarios.frase,
    },
    {
      id: "instalaciones",
      href: "/instalaciones",
      titulo: t.instalaciones.titulo,
      frase: t.instalaciones.frase,
    },
    {
      id: "equipo",
      href: "/equipo",
      titulo: t.equipo.titulo,
      frase: t.equipo.frase,
    },
    {
      id: "objetivos",
      href: "/objetivos",
      titulo: t.objetivos.titulo,
      frase: t.objetivos.frase,
    },
  ];

  return (
    <>
      <HeroVideo hayVideo={hayVideo}>
        {/*
         * Decoración de marca: el isotipo en contorno a la derecha del titular, solo desde md. Va encima de las capas
         * de foto, video y velo, pero detrás del texto (el contenedor es relative y viene después).
         */}
        <Isotipo className="marca-agua isotipo-contorno z-auto top-1/2 right-[-6rem] hidden h-[115%] -translate-y-1/2 text-sobre-oscuro/25 [--color-punto:color-mix(in_srgb,var(--color-accent)_25%,transparent)] md:block lg:right-[-2rem]" />
        {/*
         * Primera vista como una historia de Punto: titular mixto (blanco / amarillo en itálica), la cinta con el
         * nombre y la localidad, la bajada chica en itálica y el CTA. Entra escalonado (.entra + .retraso-N, solo CSS).
         * En mobile el hero es más bajo para que asome el estado en vivo. El padding de arriba no baja: deja libre
         * el botón de pausa del video, que va arriba a la derecha. El de abajo deja lugar al corte diagonal.
         */}
        <div className="contenedor relative flex min-h-[64svh] flex-col justify-end pt-20 pb-14 sm:min-h-[72svh] sm:pt-24 sm:pb-24">
          <h1 className="titular-mixto max-w-[14ch] text-display leading-[0.88]">
            <span className="linea entra">{c.heroLinea1}</span>{" "}
            <span className="linea acento entra retraso-1">{c.heroLinea2}</span>
          </h1>
          <p className="entra-barre retraso-2 mt-5 text-lg sm:text-2xl">
            <span className="cinta">
              {negocio.nombre} · <span className="whitespace-nowrap">{localidad}</span>
            </span>
          </p>
          <p className="bajada entra retraso-3 mt-4 max-w-[34ch] text-lg text-sobre-oscuro sm:text-xl">
            {c.heroBajada}
          </p>
          <BotonWhatsApp
            mensaje={negocio.mensajeWhatsappGeneral}
            className="entra retraso-4 mt-8 self-start"
          >
            <span>
              {c.heroBoton}
              <span className="sr-only"> por WhatsApp</span>
            </span>
          </BotonWhatsApp>
        </div>
      </HeroVideo>

      <div className="border-b border-border">
        {/* En mobile el texto deja libre el lugar del botón flotante de WhatsApp, que en la primera vista cae acá. */}
        <div className="contenedor py-4 pr-36 sm:pr-6">
          <EstadoEnVivo />
        </div>
      </div>

      <section aria-labelledby="que-es" className="seccion">
        <div className="contenedor">
          <h2 id="que-es" className="revelar mb-6">{c.queEsTitulo}</h2>
          {/* Desde lg el texto y el bloque de datos van lado a lado en vez de uno debajo del otro. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12">
            <div className="prosa text-lg">
              <p>{c.queEsIntro}</p>
              <p>{c.queEsTexto}</p>
            </div>

            {/* El bloque de dato de las placas: amarillo, en Anton, con el horario grande arriba. */}
            <ul
              aria-label={`${nombreCorto} en datos`}
              className="superficie-amarilla bloque-dato revelar grid grid-cols-3 gap-x-4"
            >
              {datosRapidos.map((dato) => (
                <li
                  key={dato.texto}
                  className={`numeral py-3 uppercase ${
                    dato.grande
                      ? "col-span-3 border-b border-border text-dato leading-[1.05]"
                      : "text-lg leading-[1.15] tracking-[0.02em]"
                  }`}
                >
                  {dato.texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="como-es" className="seccion">
        <div className="contenedor">
          <h2 id="como-es" className="revelar mb-6">
            Cómo entrenás en {nombreCorto}
          </h2>
          {/*
           * En mobile los tres bloques forman una fila que se desliza de costado, como .fila-deslizable, pero el
           * scroll va en este div y no en la lista, para que la lista no pierda su rol. Cada bloque lleva el numeral
           * de las placas ("01.", erosionado) y el borde marca dónde termina, dejando ver que sigue otro.
           * Desde md, tres columnas sin borde.
           */}
          <ScrollerFoco
            role="region"
            aria-label={formatearLista(comoEsEntrenar.map((bloque) => bloque.titulo))}
            tabIndex={0}
            className="desliza snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-3 md:overflow-visible md:pb-0"
          >
            <ul className="numerado grid auto-cols-[min(78%,18rem)] grid-flow-col gap-4 md:grid-flow-row md:grid-cols-3 md:gap-10">
              {comoEsEntrenar.map((bloque) => (
                <li
                  key={bloque.id}
                  className="revelar flex snap-start flex-col rounded-card border border-border bg-surface p-5 md:border-0 md:bg-transparent md:p-0"
                >
                  <h3>{bloque.titulo}</h3>
                  {/* whitespace-pre-line: un salto de renglón en el JSON (una planta por renglón) se ve en la página. */}
                  <p className="mt-2 max-w-[65ch] grow whitespace-pre-line text-muted">{bloque.texto}</p>
                  {/* El link queda abajo de todo, alineado entre bloques, con 44 px de alto para tocarlo cómodo. */}
                  <Link href={bloque.href} className="enlace enlace-flecha mt-3 min-h-11 self-start py-2">
                    {bloque.enlace}
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollerFoco>

          {/*
           * Placa invertida: el costo por clase en Anton sobre amarillo, con el precio en la etiqueta negra. Es el
           * quiebre de ritmo de la página, como la placa amarilla dentro de un carrusel.
           */}
          <div className="superficie-amarilla bloque-dato revelar mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="numeral max-w-[24ch] text-dato leading-[1.15] uppercase">
              Con el {nombrePaseLibre}, si venís todos los días, cada día te sale{" "}
              <span className="inline-block bg-fg px-2 py-0.5 leading-[1.1] whitespace-nowrap text-placa">{formatearPrecio(precioPorClase(plan))}</span>.
            </p>
            <Link href="/planes" className="btn btn-secundario self-start sm:shrink-0 sm:self-auto">
              {c.precioBoton}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="conoce-mas" className="seccion">
        <div className="contenedor">
          <h2 id="conoce-mas" className="revelar mb-6">{c.conoceMasTitulo}</h2>
          {/*
           * Tarjetas bajas: hasta xl la foto es una miniatura al costado del texto (una columna en mobile, dos
           * desde md, tres desde lg); desde xl las cinco van en una sola fila, con la foto arriba. En lg no
           * entran cinco: palabras como "Instalaciones" no caben en el ancho de la columna.
           * La miniatura no se estira (items-start) para que conserve la proporción de la foto.
           * Al pasar, la barra de la P recorre el borde de arriba, aparece el punto y la foto se acerca.
           * wrap-break-word es el resguardo para pantallas de 320 px, donde el texto queda muy angosto.
           */}
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
            {tarjetas.map((tarjeta) => (
              <li key={tarjeta.id} className="revelar">
                {/*
                 * El nombre accesible es el título más la frase, todo el texto visible de la tarjeta, sin el alt
                 * de la foto (WCAG 2.5.3: el nombre contiene la etiqueta visible).
                 */}
                <Link
                  href={tarjeta.href}
                  aria-labelledby={`tarjeta-${tarjeta.id} tarjeta-${tarjeta.id}-frase`}
                  className="card tarjeta group flex h-full items-start gap-4 p-3 xl:flex-col xl:p-4"
                >
                  {fotos[tarjeta.id]}
                  <div className="min-w-0 wrap-break-word">
                    <h3
                      id={`tarjeta-${tarjeta.id}`}
                      className="text-lg transition-colors duration-200 group-hover:text-accent"
                    >
                      {tarjeta.titulo}
                    </h3>
                    <p id={`tarjeta-${tarjeta.id}-frase`} className="mt-1 text-muted">{tarjeta.frase}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/*
       * Cierre en placa amarilla, como el final de un carrusel: todo carrusel termina con CTA. Adentro el botón pasa
       * a negro con letra amarilla y el isotipo queda de marca de agua, tono sobre tono.
       */}
      <section aria-labelledby="cierre" className="seccion superficie-amarilla relative isolate overflow-hidden">
        <Isotipo className="marca-agua -right-12 -bottom-20 h-80 text-surface [--color-punto:var(--color-border)] sm:right-4 md:-bottom-24 md:h-[28rem]" />
        <div className="contenedor grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 id="cierre" className="con-punto revelar mb-4 text-titulo-largo">
              {c.cierreTitulo}
            </h2>
            <p className="max-w-[65ch] text-lg">{c.cierreTexto}</p>
            <BotonWhatsApp mensaje={negocio.mensajeWhatsappGeneral} className="mt-7">
              <span>
                {c.cierreBoton}
                <span className="sr-only"> por WhatsApp</span>
              </span>
            </BotonWhatsApp>
          </div>
          {/* Entre sm y md, dirección y horario van lado a lado; desde md esta columna ya es la mitad del ancho. */}
          <dl className="grid content-start gap-6 sm:grid-cols-2 md:grid-cols-1 md:pt-3">
            <div>
              <dt className="rotulo">Dirección</dt>
              <dd className="mt-2 text-lg font-semibold">
                <address className="not-italic">{direccionCorta()}</address>
              </dd>
            </div>
            <div>
              <dt className="rotulo">Horario</dt>
              <dd className="mt-2 text-lg font-semibold">{horarioGeneral()}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
