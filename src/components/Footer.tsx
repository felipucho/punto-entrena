import Link from "next/link";
import { negocio, objetivos } from "@/data/site";
import { direccionCompleta, telHref, telefonoInternacional } from "@/lib/formato";
import { horarioGeneral } from "@/lib/horarios";
import { redesActivas } from "@/lib/redes";

export default function Footer() {
  const redes = redesActivas();

  return (
    <footer className="border-t border-border bg-surface pb-24 sm:pb-12">
      <div className="contenedor grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-bold">{negocio.nombre}</p>
          <address className="mt-2 not-italic">
            <p>{direccionCompleta()}</p>
            <p className="mt-1">
              <a href={telHref()} className="enlace">
                {telefonoInternacional()}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-base">Horario</h2>
          <p className="mt-2">{horarioGeneral()}</p>
        </div>

        <nav aria-labelledby="footer-objetivos">
          <h2 id="footer-objetivos" className="text-base">
            Entrenamiento según tu objetivo
          </h2>
          <ul className="mt-2 space-y-1">
            {objetivos.map((objetivo) => (
              <li key={objetivo.id}>
                <Link href={`/objetivos#${objetivo.id}`} className="enlace font-normal">
                  {objetivo.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {redes.length > 0 && (
            <>
              <h2 className="text-base">Redes</h2>
              <ul className="mt-2 space-y-1">
                {redes.map((red) => (
                  <li key={red.url}>
                    <a href={red.url} target="_blank" rel="noopener" className="enlace font-normal">
                      {red.nombre}
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <ul className="mt-6 space-y-1 text-sm">
            <li>
              <Link href="/privacidad" className="enlace font-normal">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="enlace font-normal">
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
