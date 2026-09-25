import { negocio } from "@/data/site";
import { urlWhatsApp } from "@/lib/whatsapp";

/** Botón fijo abajo a la derecha, en todas las páginas. */
export default function WhatsAppFlotante() {
  return (
    <a
      href={urlWhatsApp(negocio.mensajeWhatsappGeneral)}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp (se abre en una pestaña nueva)"
      className="btn btn-primario btn-flotante fixed right-4 bottom-4 z-40 rounded-full border-accent-fg px-5 sm:right-6 sm:bottom-6"
    >
      WhatsApp
    </a>
  );
}
