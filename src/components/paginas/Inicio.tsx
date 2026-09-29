"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import type { InicioQuery, InicioQueryVariables } from "@tina/__generated__/types";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import EstadoEnVivo from "@/components/EstadoEnVivo";
import HeroVideo from "@/components/HeroVideo";
import Isotipo from "@/components/Isotipo";
import { negocio, plantas, profes } from "@/data/site";
import {
  direccionCorta,
  formatearLista,
  formatearPrecio,
  minusculaInicial,
  nombreCorto,
  precioPorClase,
} from "@/lib/formato";
import { horarioGeneral, horarioGeneralCorto } from "@/lib/horarios";
import { paseLibre } from "@/lib/planes";
import type { Ruta } from "@/lib/rutas";

const { localidad } = negocio.direccion;

const plan = paseLibre();
const nombrePaseLibre = minusculaInicial(plan.nombre);

/** Los datos del bloque amarillo. Los que empiezan con un número van grandes, como el numeral de las placas. */
const datosRapidos = [
  { texto: `${plantas.length} plantas`, grande: true },
  { texto: `${profes.length} profes`, grande: true },
  { texto: horarioGeneralCorto(), grande: false },
  { texto: `Desde ${negocio.edadMinima} años`, grande: false },
];

/**
 * La home. Los textos fijos salen de content/paginas/inicio.json y se editan con Tina (npm run dev → /admin):
 * useTina los actualiza en vivo mientras se editan y tinaField marca cada uno para editarlo con un clic.
 * Lo que sale de src/data/site.ts o se calcula (plantas, profes, precios, horarios) sigue en el código.
 */
export default function Inicio({
  fotos,
  hayVideo,
  ...props
}: {
  query: string;
  variables: InicioQueryVariables;
  data: InicioQuery;
  /** La foto de cada tarjeta, por id. Se arma en el servidor porque Foto lee public/fotos/ del disco. */
  fotos: Record<string, ReactNode>;
  /** Si public/video/ ya tiene el video del hero. Se resuelve en el servidor. */
  hayVideo: boolean;
}) {
  const { data } = useTina(props);
  const c = data.inicio;
  // Tina tipa los grupos como opcionales, pero el JSON los trae todos.
  const t = c.tarjetas as Record<
    "planes" | "horarios" | "instalaciones" | "equipo" | "objetivos",
    { titulo: string; frase: string }
  >;

  const comoEsEntrenar: {
    id: string;
    titulo: string;
    texto: string;
    href: Ruta;
    enlace: string;
    campos: { titulo: string; texto: string; enlace: string };
  }[] = [
    {
      id: "planilla",
      titulo: c.planillaTitulo,
      texto: c.planillaTexto,
      href: "/faq",
      enlace: c.planillaEnlace,
      campos: {
        titulo: tinaField(c, "planillaTitulo"),
        texto: tinaField(c, "planillaTexto"),
        enlace: tinaField(c, "planillaEnlace"),
      },
    },
    {
      id: "plantas",
      titulo: c.plantasTitulo,
      texto: c.plantasTexto,
      href: "/instalaciones",
      enlace: c.plantasEnlace,
      campos: {
        titulo: tinaField(c, "plantasTitulo"),
        texto: tinaField(c, "plantasTexto"),
        enlace: tinaField(c, "plantasEnlace"),
      },
    },
    {
      id: "profes",
      titulo: c.profesTitulo,
      texto: c.profesTexto,
      href: "/equipo",
      enlace: c.profesEnlace,
      campos: {
        titulo: tinaField(c, "profesTitulo"),
        texto: tinaField(c, "profesTexto"),
        enlace: tinaField(c, "profesEnlace"),
      },
    },
  ];

  const tarjetas: { id: string; href: Ruta; titulo: string; frase: string; campos: { titulo: string; frase: string } }[] = [
    {
      id: "planes",
      href: "/planes",
      titulo: t.planes.titulo,
      frase: t.planes.frase,
      campos: { titulo: tinaField(t.planes, "titulo"), frase: tinaField(t.planes, "frase") },
    },
    {
      id: "horarios",
      href: "/horarios",
      titulo: t.horarios.titulo,
      frase: t.horarios.frase,
      campos: { titulo: tinaField(t.horarios, "titulo"), frase: tinaField(t.horarios, "frase") },
    },
    {
      id: "instalaciones",
      href: "/instalaciones",
      titulo: t.instalaciones.titulo,
      frase: t.instalaciones.frase,
      campos: { titulo: tinaField(t.instalaciones, "titulo"), frase: tinaField(t.instalaciones, "frase") },
    },
    {
      id: "equipo",
      href: "/equipo",
      titulo: t.equipo.titulo,
      frase: t.equipo.frase,
      campos: { titulo: tinaField(t.equipo, "titulo"), frase: tinaField(t.equipo, "frase") },
    },
    {
      id: "objetivos",
      href: "/objetivos",
      titulo: t.objetivos.titulo,
      frase: t.objetivos.frase,
      campos: { titulo: tinaField(t.objetivos, "titulo"), frase: tinaField(t.objetivos, "frase") },
    },
  ];

  return (
    <>
      <HeroVideo hayVideo={hayVideo}>
        {/*
         * Decoración de marca: el isotipo en contorno a la derecha del titular, solo desde md. Va encima de las capas
         * de foto, video y velo, pero detrás del texto (el contenedor es relative y viene después).
         */}
        <Isotipo className="isotipo-contorno pointer-events-none absolute top-1/2 right-[-6rem] hidden h-[115%] w-auto -translate-y-1/2 text-sobre-oscuro/25 [--color-punto:color-mix(in_srgb,var(--color-accent)_25%,transparent)] md:block lg:right-[-2rem]" />
        {/*
         * Primera vista como una historia de Punto: titular mixto (blanco / amarillo en itálica), la cinta con el
         * nombre y la localidad, la bajada chica en itálica y el CTA. Entra escalonado (.entra + .retraso-N, solo CSS).
         * En mobile el hero es más bajo para que asome el estado en vivo. El padding de arriba no baja: deja libre
         * el botón de pausa del video, que va arriba a la derecha. El de abajo deja lugar al corte diagonal.
         */}
        <div className="contenedor relative flex min-h-[64svh] flex-col justify-end pt-20 pb-14 sm:min-h-[72svh] sm:pt-24 sm:pb-24">
          <h1 className="titular-mixto max-w-[14ch] text-[clamp(3.25rem,1.2rem+9vw,7.5rem)] leading-[0.88]">
            <span className="linea entra" data-tina-field={tinaField(c, "heroLinea1")}>
              {c.heroLinea1}
            </span>{" "}
            <span className="linea acento entra retraso-1" data-tina-field={tinaField(c, "heroLinea2")}>
              {c.heroLinea2}
            </span>
          </h1>
          <p className="entra-barre retraso-2 mt-5 text-lg sm:text-2xl">
            <span className="cinta">
              {negocio.nombre} · <span className="whitespace-nowrap">{localidad}</span>
            </span>
          </p>
          <p
            className="bajada entra retraso-3 mt-4 max-w-[34ch] text-lg text-sobre-oscuro sm:text-xl"
            data-tina-field={tinaField(c, "heroBajada")}
          >
            {c.heroBajada}
          </p>
          <BotonWhatsApp
            variante="claro"
            mensaje={negocio.mensajeWhatsappGeneral}
            className="entra retraso-4 mt-8 self-start"
          >
            <span data-tina-field={tinaField(c, "heroBoton")}>
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
          <h2 id="que-es" className="revelar mb-5" data-tina-field={tinaField(c, "queEsTitulo")}>
            {c.queEsTitulo}
          </h2>
          {/* Desde lg el texto y el bloque de datos van lado a lado en vez de uno debajo del otro. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12">
            <div className="prosa text-lg">
              <p data-tina-field={tinaField(c, "queEsIntro")}>{c.queEsIntro}</p>
              <p data-tina-field={tinaField(c, "queEsTexto")}>{c.queEsTexto}</p>
            </div>

            {/* El bloque de dato de las placas: amarillo, en Anton, con las cifras grandes arriba. */}
            <ul
              aria-label={`${nombreCorto} en datos`}
              className="superficie-amarilla bloque-dato revelar grid grid-cols-2 gap-x-5"
            >
              {datosRapidos.map((dato) => (
                <li
                  key={dato.texto}
                  className={`numeral border-b border-border py-3 uppercase last:border-b-0 ${
                    dato.grande
                      ? "text-[clamp(1.75rem,1.2rem+2.4vw,3.25rem)] leading-[0.95]"
                      : "col-span-2 text-[1.375rem] leading-[1.15] tracking-[0.02em]"
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
          <div
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
                  <h3 data-tina-field={bloque.campos.titulo}>{bloque.titulo}</h3>
                  {/* whitespace-pre-line: un salto de renglón en Tina (una planta por renglón) se ve en la página. */}
                  <p className="mt-2 max-w-[65ch] grow whitespace-pre-line text-muted" data-tina-field={bloque.campos.texto}>
                    {bloque.texto}
                  </p>
                  {/* El link queda abajo de todo, alineado entre bloques, con 44 px de alto para tocarlo cómodo. */}
                  <Link
                    href={bloque.href}
                    className="enlace enlace-flecha mt-3 min-h-11 self-start py-2"
                    data-tina-field={bloque.campos.enlace}
                  >
                    {bloque.enlace}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/*
           * Placa invertida: el costo por clase en Anton sobre amarillo, con el precio en la etiqueta negra. Es el
           * quiebre de ritmo de la página, como la placa amarilla dentro de un carrusel.
           */}
          <div className="superficie-amarilla bloque-dato revelar mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="numeral max-w-[24ch] text-[clamp(1.625rem,1.2rem+1.8vw,2.5rem)] leading-[1.15] uppercase">
              Con el {nombrePaseLibre}, si venís todos los días, cada clase te sale{" "}
              <span className="inline-block bg-fg px-2 py-0.5 leading-[1.1] whitespace-nowrap text-placa">{formatearPrecio(precioPorClase(plan))}</span>.
            </p>
            <Link
              href="/planes"
              className="btn btn-secundario self-start sm:shrink-0 sm:self-auto"
              data-tina-field={tinaField(c, "precioBoton")}
            >
              {c.precioBoton}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="conoce-mas" className="seccion">
        <div className="contenedor">
          <h2 id="conoce-mas" className="revelar mb-6" data-tina-field={tinaField(c, "conoceMasTitulo")}>
            {c.conoceMasTitulo}
          </h2>
          {/*
           * Tarjetas bajas: hasta xl la foto es una miniatura al costado del texto (una columna en mobile, dos
           * desde md, tres desde lg); desde xl las cinco van en una sola fila, con la foto arriba. En lg no
           * entran cinco: palabras como "Instalaciones" no caben en el ancho de la columna.
           * La miniatura no se estira (items-start) para que conserve la proporción de la foto. En la miniatura,
           * la etiqueta "Foto: …" (el span de Foto) va más chica y cortada en dos líneas con "…", en vez
           * de quedar recortada por arriba a mitad de frase.
           * Al pasar, la barra de la P recorre el borde de arriba, aparece el punto y la foto se acerca.
           * wrap-break-word es el resguardo para pantallas de 320 px, donde el texto queda muy angosto.
           */}
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-4">
            {tarjetas.map((tarjeta) => (
              <li key={tarjeta.id} className="revelar">
                <Link
                  href={tarjeta.href}
                  aria-labelledby={`tarjeta-${tarjeta.id}`}
                  aria-describedby={`tarjeta-${tarjeta.id}-frase`}
                  className="card tarjeta group flex h-full items-start gap-4 p-3 xl:flex-col xl:p-4"
                >
                  {fotos[tarjeta.id]}
                  <div className="min-w-0 wrap-break-word">
                    <h3
                      id={`tarjeta-${tarjeta.id}`}
                      className="text-lg transition-colors duration-200 group-hover:text-accent"
                      data-tina-field={tarjeta.campos.titulo}
                    >
                      {tarjeta.titulo}
                    </h3>
                    <p id={`tarjeta-${tarjeta.id}-frase`} className="mt-1 text-muted" data-tina-field={tarjeta.campos.frase}>
                      {tarjeta.frase}
                    </p>
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
        <Isotipo className="pointer-events-none absolute -right-12 -bottom-20 -z-10 h-80 w-auto text-surface [--color-punto:var(--color-border)] sm:right-4 md:-bottom-24 md:h-[28rem]" />
        <div className="contenedor grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2
              id="cierre"
              className="con-punto revelar mb-4 text-[clamp(2.25rem,1.6rem+3vw,4rem)]"
              data-tina-field={tinaField(c, "cierreTitulo")}
            >
              {c.cierreTitulo}
            </h2>
            <p className="max-w-[65ch] text-lg" data-tina-field={tinaField(c, "cierreTexto")}>
              {c.cierreTexto}
            </p>
            <BotonWhatsApp mensaje={negocio.mensajeWhatsappGeneral} className="mt-7">
              <span data-tina-field={tinaField(c, "cierreBoton")}>
                {c.cierreBoton}
                <span className="sr-only"> por WhatsApp</span>
              </span>
            </BotonWhatsApp>
          </div>
          {/* Entre sm y md, dirección y horario van lado a lado; desde md esta columna ya es la mitad del ancho. */}
          <dl className="grid content-start gap-6 sm:grid-cols-2 md:grid-cols-1 md:pt-3">
            <div>
              <dt className="etiqueta">Dirección</dt>
              <dd className="mt-2 text-lg font-semibold">
                <address className="not-italic">{direccionCorta()}</address>
              </dd>
            </div>
            <div>
              <dt className="etiqueta">Horario</dt>
              <dd className="mt-2 text-lg font-semibold">{horarioGeneral()}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
