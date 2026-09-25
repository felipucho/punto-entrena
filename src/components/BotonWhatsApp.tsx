import type { ReactNode } from "react";
import { urlWhatsApp } from "@/lib/whatsapp";

type Props = {
  /** Texto que llega precargado al chat. */
  mensaje: string;
  /** Texto visible del botón. */
  children?: ReactNode;
  variante?: "primario" | "secundario" | "claro";
  className?: string;
};

/** Link a WhatsApp con mensaje precargado. Abre en pestaña nueva. */
export default function BotonWhatsApp({
  mensaje,
  children = "Escribinos por WhatsApp",
  variante = "primario",
  className = "",
}: Props) {
  return (
    <a
      href={urlWhatsApp(mensaje)}
      target="_blank"
      rel="noopener"
      className={`btn btn-${variante} ${className}`.trim()}
    >
      {children}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}
