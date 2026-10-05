import Link from "next/link";
import Isotipo from "@/components/Isotipo";
import { negocio } from "@/data/site";
import { direccionCompleta, telHref, telefonoInternacional } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";

export default function Footer() {
  const redes = redesActivas();

  return (
    // Negro pleno con grano y el isotipo recortado contra el borde derecho como marca de agua (la cuña y el punto
    // en un amarillo apagado). Compacto: marca y dirección a la izquierda, redes y teléfono juntos a la derecha; abajo
    // los legales con el © debajo, siempre a la izquierda. Los botones flotantes (WhatsApp y volver arriba) van
    // apilados a la derecha: en celular el padding de abajo los deja debajo del ©; desde 640 px alcanza con menos,
    // pero tiene que dejar los links de arriba a la derecha por encima de la flecha.
    <footer className="relative isolate overflow-hidden border-t border-border bg-oscuro bg-(image:--grano) pb-20 sm:pb-16">
      <Isotipo className="pointer-events-none absolute -right-10 -bottom-16 -z-10 h-56 w-auto text-surface-alt [--color-punto:color-mix(in_srgb,var(--color-accent)_30%,transparent)] lg:-bottom-20 lg:h-72" />
      <div className="contenedor pt-7 sm:pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-titulo">
              <Isotipo className="h-6 w-auto shrink-0" />
              {negocio.nombre}
            </p>
            <address className="mt-1 text-sm not-italic text-muted">{direccionCompleta()}</address>
          </div>

          <ul aria-label="Contacto" className="flex flex-wrap gap-x-5">
            {redes.map((red) => (
              <li key={red.url}>
                <a href={red.url} target="_blank" rel="noopener" className="enlace inline-flex min-h-11 items-center">
                  {red.nombre}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
            <li>
              <a href={telHref()} title={telefonoInternacional()} className="enlace inline-flex min-h-11 items-center">
                Número
                <span className="sr-only">: {telefonoInternacional()}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-4 border-t border-border pt-1 text-muted">
          <div className="flex gap-x-5 text-sm">
            <Link href="/privacidad" prefetch={false} className="enlace inline-flex min-h-11 items-center font-normal">
              Privacidad
            </Link>
            <Link href="/terminos" prefetch={false} className="enlace inline-flex min-h-11 items-center font-normal">
              Términos
            </Link>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} {negocio.nombre}
          </p>
        </div>
      </div>
    </footer>
  );
}
