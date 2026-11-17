import type { Metadata } from "next";
import { plantillaTitulo } from "@/lib/seo";
import SiteLayout from "./(site)/layout";
import NoEncontrada, { metadata as base } from "./(site)/not-found";

// Con dos layouts raíz Next no puede armar el 404 de una URL sin ruta: se compone acá con el layout del sitio.
export const metadata: Metadata = {
  title: plantillaTitulo.replace("%s", String(base.title)),
  description: base.description,
};

export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NoEncontrada />
    </SiteLayout>
  );
}
