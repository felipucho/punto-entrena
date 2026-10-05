import { IconoWhatsApp } from "@/components/BotonWhatsApp";
import { negocio } from "@/data/site";
import { urlWhatsApp } from "@/lib/whatsapp";

/**
 * Botón fijo abajo a la derecha, en todas las páginas: la cápsula amarilla de las historias, con un anillo negro
 * fino para que se despegue también de las placas amarillas. Entra desde abajo después de la primera vista.
 */
export default function WhatsAppFlotante() {
  return (
    <a
      href={urlWhatsApp(negocio.mensajeWhatsappGeneral)}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp (se abre en una pestaña nueva)"
      className="btn-flotante fixed right-4 bottom-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-fg transition-[background-color,translate,scale] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover active:scale-[.97] sm:right-6 sm:bottom-6"
    >
      <IconoWhatsApp className="size-5 shrink-0" />
      WhatsApp
    </a>
  );
}
