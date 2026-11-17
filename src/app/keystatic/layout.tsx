import type { Metadata } from "next";

/* Raíz aparte de la del sitio: el panel no lleva Header, Footer ni el CSS global. */
export const metadata: Metadata = { title: "Panel de Punto", robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
