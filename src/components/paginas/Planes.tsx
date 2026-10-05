import type contenido from "@content/paginas/planes.json";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { claseSuelta, incluyenTodosLosPlanes, negocio, planes } from "@/data/site";
import { textoDescuentoFamiliar } from "@/lib/faq";
import { formatearPrecio, minusculaInicial, numeroEnPalabras, precioPorClase } from "@/lib/formato";
import { diasDeApertura } from "@/lib/horarios";
import { paseLibre, planPorId } from "@/lib/planes";
import { mensajePlan } from "@/lib/whatsapp";

function textoClases(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? "día" : "días"} por mes`;
}

const diasHabiles = diasDeApertura();

const pase = paseLibre();
const nombrePase = pase.nombre.toLowerCase();
const dosVeces = planPorId("2-veces");
const nombreSuelta = claseSuelta.nombre.toLowerCase();

// Comparaciones de la tabla: cada afirmación se muestra solo si el cálculo la confirma.
const precioClasePase = precioPorClase(pase);
/** Cuántas clases del pase libre entran en el precio de una clase suelta. */
const clasesPasePorSuelta = Math.floor(claseSuelta.precio / precioClasePase);

const lecturaTabla: string[] = [];
if (clasesPasePorSuelta >= 2) {
  lecturaTabla.push(
    `Con el ${nombrePase}, cada día te sale ${formatearPrecio(precioClasePase)}. Por lo que pagás un ${nombreSuelta}, venís ${numeroEnPalabras(clasesPasePorSuelta)} veces.`,
  );
}

/**
 * /planes. Los textos fijos salen de content/paginas/planes.json.
 * Precios, nombres de planes, la tabla y los consejos que nombran planes salen de src/data/site.ts y src/lib.
 */
export default function Planes({ c }: { c: typeof contenido }) {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>{c.titulo}</h1>
        <p className="intro mt-4">{c.intro}</p>
      </div>

      <section aria-labelledby="planes-y-clase-suelta" className="seccion">
        <div className="contenedor">
          <h2 id="planes-y-clase-suelta" className="revelar mb-4">
            {c.planesTitulo}
          </h2>
          {/*
           * Tarjetas compactas: dos columnas en mobile y los cuatro planes en una sola fila desde lg.
           * El precio va en Anton (.numeral), en amarillo, con un tamaño fluido que arranca más chico en la
           * columna angosta de 375 px. Por debajo de 24 rem baja a 1,65 rem: a 320 px "$ 40.000" no entra en la
           * tarjeta con el tamaño mínimo del clamp.
           * El nombre ocupa siempre dos líneas en mobile y baja a text-lg entre lg y xl para entrar en una:
           * así los precios de una misma fila quedan alineados.
           * En mobile el botón va sin ícono ni flecha para que el texto entre en dos renglones.
           */}
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {planes.map((plan) => (
              <li key={plan.id} className="card card-barra revelar flex flex-col p-4 sm:p-5">
                <h3 className="min-h-[2lh] text-lg leading-tight sm:min-h-0 sm:text-xl lg:text-lg xl:text-xl">
                  {plan.nombre}
                </h3>
                <p className="numeral mt-3 text-[clamp(2.25rem,1.8rem+1.6vw,3rem)] leading-none text-accent max-[24rem]:text-[1.65rem]">
                  {formatearPrecio(plan.precio)}
                </p>
                <p className="mt-1.5 text-muted">{textoClases(plan.clasesPorMes)}</p>
                <div className="mt-auto pt-4">
                  <BotonWhatsApp
                    mensaje={mensajePlan(plan.nombre)}
                    className="w-full px-3 leading-tight max-sm:text-sm sm:text-base max-sm:gap-1.5 max-sm:pl-4 max-sm:pr-3 max-sm:[&_.btn-icono]:hidden max-sm:[&_.btn-flecha-afuera]:hidden"
                  >
                    {/* Un solo span: dentro del .btn (flex con gap) el texto queda en un único ítem. */}
                    <span>
                      {c.planBoton}
                      <span className="sr-only"> de {minusculaInicial(plan.nombre)}, por WhatsApp</span>
                    </span>
                  </BotonWhatsApp>
                </div>
              </li>
            ))}
          </ul>

          {/* Clase suelta como franja: nombre y precio en una línea, el botón al costado desde sm. */}
          <div className="card mt-3 flex flex-col gap-3 bg-surface-alt p-4 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg leading-tight sm:text-xl">{claseSuelta.nombre}</h3>
                <p className="numeral text-[2rem] leading-none text-accent">{formatearPrecio(claseSuelta.precio)}</p>
              </div>
              {c.sueltaTexto.trim() !== "" && <p className="mt-1.5 text-muted">{c.sueltaTexto}</p>}
            </div>
            <BotonWhatsApp
              mensaje={`Hola, me gustaría probar con un ${nombreSuelta}. ¿Cómo hago?`}
              variante="secundario"
              className="w-full sm:w-auto sm:shrink-0"
            >
              <span>
                {c.sueltaBoton}
                <span className="sr-only"> con un {nombreSuelta}, por WhatsApp</span>
              </span>
            </BotonWhatsApp>
          </div>

          <p className="mt-4 max-w-[65ch]">{incluyenTodosLosPlanes}</p>
        </div>
      </section>

      {/*
       * "Cuánto te sale cada clase" y "¿Qué plan me conviene?" en una misma fila desde md (tablet): la tabla y el
       * consejo se leen juntos, sin scroll entre uno y otro. En mobile se apilan, separados por una línea.
       */}
      <div className="seccion">
        <div className="contenedor grid gap-8 md:grid-cols-2 lg:gap-12">
          <section aria-labelledby="precio-por-clase">
            <h2 id="precio-por-clase" className="revelar mb-4">{c.precioTitulo}</h2>
            <div className="superficie-amarilla bloque-dato max-w-xl">
              {/*
               * La tabla va en placa amarilla, en Anton, como el cuadro de precios de las placas: .tabla-placa ya pone
               * el tamaño del texto, el padding y las líneas entre filas.
               */}
              <table className="tabla-placa w-full border-collapse text-left">
                <caption className="mb-4 text-left">
                  <span className="etiqueta">
                    Precio por día de cada plan y del {nombreSuelta}
                  </span>
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{c.tablaColumnaPlan}</th>
                    <th scope="col" className="text-right">{c.tablaColumnaPrecio}</th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map((plan) => (
                    <tr key={plan.id}>
                      <th scope="row">{plan.nombre}</th>
                      <td className="text-right">{formatearPrecio(precioPorClase(plan))}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">{claseSuelta.nombre}</th>
                    <td className="text-right">{formatearPrecio(claseSuelta.precio)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {lecturaTabla.length > 0 && <p className="mt-4 max-w-[65ch]">{lecturaTabla.join(" ")}</p>}
          </section>

          <section aria-labelledby="cual-me-conviene" className="border-t border-border pt-8 md:border-t-0 md:pt-0">
            <h2 id="cual-me-conviene" className="revelar mb-4">{c.convieneTitulo}</h2>
            <div className="prosa">
              <p>
                Si arrancás de cero, te recomendamos el plan de {dosVeces.nombre}. En general, con eso ya empezás a
                notar cambios.
              </p>
              <p>
                Si tenés horarios rotativos, te conviene el {nombrePase}. Podés venir todos los días, de {diasHabiles}.
              </p>
            </div>
            <div className="mt-6 max-w-[65ch] space-y-2 border-l-4 border-accent bg-surface p-4">
              <p>{textoDescuentoFamiliar()}</p>
              <p>{negocio.mediosDePago}</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
