import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import { negocio } from "@/data/site";
import { direccionCompleta, telHref, telefonoInternacional } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";

export default function Footer() {
  const redes = redesActivas();

  return (
    // Negro pleno con grano y el isotipo recortado contra el borde derecho como marca de agua (la cuña y el punto
    // en un amarillo apagado). Compacto: marca y contacto arriba, legales en una línea abajo. El padding de abajo deja
    // lugar a los botones flotantes en todos los anchos: sin él, WhatsApp tapa los links legales. Desde 640 px los
    // legales van a la derecha, justo arriba de la flecha de volver arriba: por eso crece un poco más.
    <footer className="relative isolate overflow-hidden border-t border-border bg-oscuro bg-(image:--grano) pb-20 sm:pb-24">
      <Isotipo className="pointer-events-none absolute -right-10 -bottom-16 -z-10 h-56 w-auto text-surface-alt [--color-punto:color-mix(in_srgb,var(--color-accent)_30%,transparent)] lg:-bottom-20 lg:h-72" />
      <div className="contenedor py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-titulo">
              <Isotipo className="h-6 w-auto shrink-0" />
              {negocio.nombre}
            </p>
            <address className="mt-2 flex flex-col text-sm not-italic text-muted sm:flex-row sm:items-center sm:gap-x-2">
              <span>{direccionCompleta()}</span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <a href={telHref()} className="enlace inline-flex min-h-11 items-center self-start font-normal sm:self-auto">
                {telefonoInternacional()}
              </a>
            </address>
          </div>

          {redes.length > 0 && (
            <ul aria-label="Redes" className="flex flex-wrap gap-x-5">
              {redes.map((red) => (
                <li key={red.url}>
                  <a href={red.url} target="_blank" rel="noopener" className="enlace inline-flex min-h-11 items-center">
                    {red.nombre}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 border-t border-border pt-2 text-sm text-muted">
          <p className="basis-full pt-3 sm:basis-auto sm:pt-0 sm:mr-auto">
            © {new Date().getFullYear()} {negocio.nombre}
          </p>
          <Link href="/privacidad" className="enlace inline-flex min-h-11 items-center font-normal">
            Privacidad
          </Link>
          <Link href="/terminos" className="enlace inline-flex min-h-11 items-center font-normal">
            Términos
          </Link>
        </div>
      </div>
    </footer>
  );
}
