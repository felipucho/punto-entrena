import Link from "next/link";
import { exigirSesion } from "@/lib/panel-auth";
import { MENSAJE_SIN_ALMACEN, almacenDelEntorno } from "@/lib/panel-almacen";
import { leerPrecios, listarNovedades, type NovedadGuardada } from "@/lib/panel-novedades";
import { estaPublicada, formatearFecha, instanteDePublicacion } from "@/lib/novedades-fechas";
import { describirCambio, formatearMomento, MESES_CORTOS as MESES, queSeDeshizo, ultimosCambios, type EntradaHistorial } from "@/lib/panel-historial";
import BotonDeshacer from "./BotonDeshacer";
import { ahora, type Precios } from "@/lib/panel-contenido";
import FormularioPrecios from "./FormularioPrecios";
import Estado from "./Estado";
import { IconoAlerta, IconoFlecha, IconoMas } from "./iconos";


function Item({ n, ahora }: { n: NovedadGuardada; ahora: number }) {
  const valida = !Number.isNaN(instanteDePublicacion(n.fecha));
  return (
    <li>
      <Link href={`/panel/novedad/${n.slug}`} className="panel-item">
        <span className="panel-dia" aria-hidden="true">
          <b>{valida ? Number(n.fecha.slice(8, 10)) : "?"}</b>
          <small>{valida ? MESES[Number(n.fecha.slice(5, 7)) - 1] : "—"}</small>
        </span>
        <span className="panel-item-texto">
          <span className="panel-item-titulo">{n.titulo || "(sin título)"}</span>
          <span className="panel-item-meta">{valida ? `${formatearFecha(n.fecha)} · ${n.fecha.slice(11, 16)} h` : "Fecha inválida"}</span>
        </span>
        <Estado fecha={n.fecha} ahora={ahora} />
        <IconoFlecha />
      </Link>
    </li>
  );
}

export default async function Panel() {
  await exigirSesion();
  const almacen = almacenDelEntorno();
  if (!almacen) {
    return (
      <div className="panel-pagina">
        <p className="panel-alerta" role="alert">
          <IconoAlerta />
          {MENSAJE_SIN_ALMACEN}
        </p>
      </div>
    );
  }

  let precios: Precios | null = null;
  let novedades: NovedadGuardada[] = [];
  let falla = false;
  let cambios: EntradaHistorial[] = [];
  try {
    [precios, novedades, cambios] = await Promise.all([leerPrecios(almacen), listarNovedades(almacen), ultimosCambios(10)]);
  } catch (error) {
    console.error("[panel] lectura", error instanceof Error ? error.message : error);
    falla = true;
  }
  const ahoraMs = ahora();
  const enCola = novedades.filter((n) => !Number.isNaN(instanteDePublicacion(n.fecha)) && !estaPublicada(n.fecha, ahoraMs)).length;

  return (
    <div className="panel-pagina">
      <header>
        <h1>Panel</h1>
        <p className="panel-bajada">Lo que guardes acá aparece en puntoentrena.com en uno o dos minutos.</p>
      </header>

      {falla && (
        <p className="panel-alerta" role="alert">
          <IconoAlerta />
          No se pudo leer el contenido. Recargá la página; si sigue igual, avisale a quien se encarga del sitio.
        </p>
      )}

      <section aria-labelledby="titulo-novedades">
        <div className="panel-cabeza">
          <div>
            <h2 id="titulo-novedades">Novedades</h2>
            {novedades.length > 0 && (
              <p>
                {novedades.length === 1 ? "1 novedad" : `${novedades.length} novedades`}
                {enCola > 0 && ` · ${enCola} en cola`}
              </p>
            )}
          </div>
          <Link href="/panel/nueva" className="btn btn-primario">
            <IconoMas />
            Nueva novedad
          </Link>
        </div>
        {novedades.length === 0 && !falla ? (
          <div className="panel-vacio">
            <strong>Todavía no hay novedades</strong>
            <p>Un feriado, un cambio de horario, una clase nueva: lo que cargues aparece en la sección Novedades de la página.</p>
          </div>
        ) : (
          <ul className="panel-lista">
            {novedades.map((n) => (
              <Item key={n.slug} n={n} ahora={ahoraMs} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-precios">
        <div className="panel-cabeza">
          <div>
            <h2 id="titulo-precios">Precios</h2>
            <p>Por mes. El precio por clase se calcula solo.</p>
          </div>
        </div>
        {precios ? (
          // key: si los precios cambian por fuera (Deshacer), el formulario arranca de nuevo con los guardados.
          <FormularioPrecios key={JSON.stringify(precios)} inicial={precios} />
        ) : (
          !falla && (
            <p className="panel-alerta" role="alert">
              <IconoAlerta />
              No se encontró el archivo de precios.
            </p>
          )
        )}
      </section>

      {cambios.length > 0 && (
        <section aria-labelledby="titulo-cambios">
          <div className="panel-cabeza">
            <h2 id="titulo-cambios">Últimos cambios</h2>
          </div>
          <ul className="panel-lista">
            {cambios.map((c) => (
              <li key={c.id} className="panel-cambio">
                <span className="panel-cambio-texto">{describirCambio(c)}</span>
                <time className="panel-item-meta" dateTime={c.creado_el}>
                  {formatearMomento(c.creado_el)}
                </time>
                {c.deshacible && <BotonDeshacer id={c.id} que={queSeDeshizo(c.accion, c.detalle)} />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
