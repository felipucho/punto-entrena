import localFont from "next/font/local";
import AlLlegar from "@/components/AlLlegar";

/*
 * Firma de Fino Estudio, que hizo el sitio: va debajo del ©, con su letra, tamaño y color. Solo «fino estudio» usa la
 * letra de la marca (Atkinson Hyperlegible Next, recortada a esas letras: 3 KB, sin precarga). El ícono es el de la
 * marca en el color del pie, con las barras pintadas del fondo. Se afina con el mouse o el foco y, sola, una vez al
 * entrar en pantalla.
 */
const letraFino = localFont({
  src: "../fuentes/firma-fino.woff2",
  weight: "200 800",
  display: "swap",
  preload: false,
});

// Ícono de 64 × 64 del manual de Fino Estudio: barras de 12 · 7,5 · 4 · 1,4 de ancho, centradas, de y 17 a y 47.
const BARRAS = [
  { x: 12.55, ancho: 12 },
  { x: 29.55, ancho: 7.5 },
  { x: 41.55, ancho: 4 },
  { x: 49.55, ancho: 1.4 },
];

export default function FirmaFino() {
  return (
    <AlLlegar
      href="https://finoestudio.com"
      aria-label="Página hecha por Fino Estudio (se abre en una pestaña nueva)"
      className="firma-fino inline-flex min-h-11 items-center text-xs"
    >
      {/* un renglón de texto adentro del flex: así las dos letras comparten la línea de base */}
      <span>
        Página hecha por
        <svg viewBox="0 0 64 64" aria-hidden="true" className="firma-fino-icono">
          <rect width="64" height="64" rx="15" />
          {BARRAS.map((b) => (
            <rect key={b.x} x={b.x} y="17" width={b.ancho} height="30" />
          ))}
        </svg>
        <span aria-hidden="true" className={`firma-fino-nombre ${letraFino.className}`}>
          <i>f</i>
          <i>i</i>
          <i>n</i>
          <i>o</i> <i>estudio</i>
        </span>
      </span>
    </AlLlegar>
  );
}
