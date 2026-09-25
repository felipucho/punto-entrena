import BotonWhatsApp from "@/components/BotonWhatsApp";
import { claseSuelta, incluyenTodosLosPlanes, negocio, planes } from "@/data/site";
import { textoDescuentoFamiliar } from "@/lib/faq";
import { formatearPrecio, minusculaInicial, numeroEnPalabras, precioPorClase } from "@/lib/formato";
import { diasDeApertura } from "@/lib/horarios";
import { paseLibre, planPorId } from "@/lib/planes";
import { metadataDePagina } from "@/lib/seo";
import { mensajePlan } from "@/lib/whatsapp";

function textoClases(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? "clase" : "clases"} por mes`;
}

const { localidad } = negocio.direccion;

const diasHabiles = diasDeApertura();

const pase = paseLibre();
const nombrePase = pase.nombre.toLowerCase();
const dosVeces = planPorId("2-veces");
const masBarato = planes.reduce((a, b) => (b.precio < a.precio ? b : a));
const nombreSuelta = claseSuelta.nombre.toLowerCase();

// Comparaciones de la tabla: cada afirmación se muestra solo si el cálculo la confirma.
const precioClasePase = precioPorClase(pase);
const porFrecuencia = [...planes].sort((a, b) => a.clasesPorMes - b.clasesPorMes);
const bajaConLaFrecuencia = porFrecuencia.every(
  (plan, i) => i === 0 || precioPorClase(plan) < precioPorClase(porFrecuencia[i - 1]),
);
const paseMenosDeLaMitad = precioClasePase * 2 < claseSuelta.precio;
const paseMasBarato = precioClasePase < claseSuelta.precio;
/** Cuántas clases del pase libre entran en el precio de una clase suelta. */
const clasesPasePorSuelta = Math.floor(claseSuelta.precio / precioClasePase);
const hayRedondeo = planes.some((p) => p.precio % p.clasesPorMes !== 0);

const lecturaTabla: string[] = [];
if (bajaConLaFrecuencia) {
  lecturaTabla.push("Cuantas más veces por semana venís, menos te sale cada clase.");
}
if (paseMasBarato) {
  lecturaTabla.push(
    `Con el ${nombrePase}, cada clase te sale ${formatearPrecio(precioClasePase)}, ${
      paseMenosDeLaMitad ? "menos de la mitad que" : "menos que"
    } una ${nombreSuelta}.`,
  );
}
if (clasesPasePorSuelta >= 2) {
  lecturaTabla.push(
    `Dicho de otro modo, el precio de una ${nombreSuelta} equivale a ${numeroEnPalabras(clasesPasePorSuelta)} clases del ${nombrePase}.`,
  );
}

export const metadata = metadataDePagina({
  titulo: "Planes y precios",
  descripcion: `Planes desde ${formatearPrecio(masBarato.precio)} con ${textoClases(masBarato.clasesPorMes)} en ${localidad}, sin turnos. ${pase.nombre}: ${formatearPrecio(pase.precio)}, ${formatearPrecio(precioClasePase)} por clase. ${claseSuelta.nombre}: ${formatearPrecio(claseSuelta.precio)}.`,
  ruta: "/planes",
});

export default function Planes() {
  return (
    <>
      <div className="contenedor pt-section">
        <h1>Planes y precios</h1>
        <p className="intro mt-4">
          En {negocio.nombre} no sacás turno: elegís cuántas veces por semana venís y decidís vos qué día y a qué
          hora, de {diasHabiles}.
        </p>
      </div>

      <section aria-labelledby="planes-y-clase-suelta" className="seccion">
        <div className="contenedor">
          <h2 id="planes-y-clase-suelta" className="mb-4">
            Planes y {nombreSuelta}
          </h2>
          {/*
           * Tarjetas compactas: dos columnas en mobile y los cuatro planes en una sola fila desde lg.
           * El precio va en text-2xl en mobile para que "$ 60.000" entre en la columna angosta de 375 px.
           * El nombre ocupa siempre dos líneas en mobile y baja a text-lg entre lg y xl para entrar en una:
           * así los precios de una misma fila quedan alineados.
           */}
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {planes.map((plan) => (
              <li key={plan.id} className="card flex flex-col p-4 sm:p-5">
                <h3 className="min-h-[2lh] text-lg leading-tight sm:min-h-0 sm:text-xl lg:text-lg xl:text-xl">
                  {plan.nombre}
                </h3>
                <p className="mt-3 text-2xl leading-none font-bold tracking-tight sm:text-3xl">
                  {formatearPrecio(plan.precio)}
                </p>
                <p className="mt-1.5 text-sm text-muted">{textoClases(plan.clasesPorMes)}</p>
                <div className="mt-auto pt-4">
                  <BotonWhatsApp
                    mensaje={mensajePlan(plan.nombre)}
                    className="w-full px-3 text-sm leading-tight sm:text-base"
                  >
                    {/* Un solo span: dentro del .btn (flex con gap) el texto queda en un único ítem. */}
                    <span>
                      Consultar por WhatsApp<span className="sr-only"> sobre el plan {minusculaInicial(plan.nombre)}</span>
                    </span>
                  </BotonWhatsApp>
                </div>
              </li>
            ))}
          </ul>

          {/* Clase suelta como franja: nombre y precio en una línea, el botón al costado desde sm. */}
          <div className="card mt-3 flex flex-col gap-3 bg-surface p-4 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg leading-tight sm:text-xl">{claseSuelta.nombre}</h3>
                <p className="text-2xl leading-none font-bold tracking-tight">{formatearPrecio(claseSuelta.precio)}</p>
              </div>
              <p className="mt-1.5 text-sm text-muted">Para venir a probar un día antes de decidirte por un plan.</p>
            </div>
            <BotonWhatsApp
              mensaje={`Hola, me interesa la ${nombreSuelta}.`}
              variante="secundario"
              className="w-full sm:w-auto sm:shrink-0"
            >
              <span>
                Consultar por WhatsApp<span className="sr-only"> sobre la {nombreSuelta}</span>
              </span>
            </BotonWhatsApp>
          </div>

          <p className="mt-4 max-w-[65ch]">{incluyenTodosLosPlanes}</p>
        </div>
      </section>

      {/*
       * "Cuánto te sale cada clase" y "¿Cuál me conviene?" en una misma fila desde md (tablet): la tabla y el
       * consejo se leen juntos, sin scroll entre uno y otro. En mobile se apilan, separados por una línea.
       */}
      <div className="seccion">
        <div className="contenedor grid gap-8 md:grid-cols-2 lg:gap-12">
          <section aria-labelledby="precio-por-clase">
            <h2 id="precio-por-clase" className="mb-4">
              Cuánto te sale cada clase
            </h2>
            <div className="max-w-xl overflow-hidden rounded-card border border-border">
              {/*
               * Texto un punto más chico donde la columna es angosta (mobile y la media columna entre md y lg):
               * así los nombres de los planes no parten cada fila en dos.
               */}
              <table className="w-full border-collapse text-left text-sm sm:text-base md:text-sm lg:text-base">
                <caption className="px-4 pt-3 pb-2 text-left font-semibold">
                  Precio por clase de cada plan{hayRedondeo ? " (redondeado al peso)" : ""} y de la {nombreSuelta}
                </caption>
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th scope="col" className="px-4 py-2">
                      Plan
                    </th>
                    <th scope="col" className="px-4 py-2 text-right">
                      Precio por clase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {planes.map((plan) => (
                    <tr key={plan.id} className="border-b border-border">
                      <th scope="row" className="px-4 py-2">
                        {plan.nombre}
                      </th>
                      <td className="px-4 py-2 text-right">{formatearPrecio(precioPorClase(plan))}</td>
                    </tr>
                  ))}
                  <tr className="bg-surface">
                    <th scope="row" className="px-4 py-2">
                      {claseSuelta.nombre}
                    </th>
                    <td className="px-4 py-2 text-right">{formatearPrecio(claseSuelta.precio)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {lecturaTabla.length > 0 && <p className="mt-4 max-w-[65ch]">{lecturaTabla.join(" ")}</p>}
          </section>

          <section aria-labelledby="cual-me-conviene" className="border-t border-border pt-8 md:border-t-0 md:pt-0">
            <h2 id="cual-me-conviene" className="mb-4">
              ¿Cuál me conviene?
            </h2>
            <div className="prosa">
              <p>
                Si arrancás de cero, con el plan de {dosVeces.nombre} en general alcanza para empezar a notar cambios.
                Los profes te arman la planilla pensada para esa cantidad de días.
              </p>
              <p>
                Si tenés horarios rotativos, el {nombrePase} te saca el problema: venís cualquier día, de {diasHabiles},
                a la hora que te quede libre. Si una semana te da para venir más y otra menos, no tenés que andar
                contando las veces.
              </p>
            </div>
            <div className="mt-6 max-w-[65ch] space-y-2 border-t border-border pt-4">
              <p>{textoDescuentoFamiliar()}</p>
              <p>{negocio.mediosDePago}</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
