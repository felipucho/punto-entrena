import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { negocio } from "@/data/site";
import { imagenCompartir } from "@/lib/seo";

/*
 * Imagen para compartir (WhatsApp, redes, buscadores) de todas las páginas: una placa de Punto. Negro, titular
 * mixto en Anton (blanco / amarillo), la cinta con el nombre y el isotipo a la derecha. Sin fotos de stock.
 * Anton va en TTF local (licencia OFL): ImageResponse no lee WOFF2 y no se baja nada en el build.
 */

const { localidad } = negocio.direccion;

export const alt = imagenCompartir.alt;
export const size = { width: imagenCompartir.width, height: imagenCompartir.height };
export const contentType = "image/png";

// Mismos valores que los primitivos de src/app/estilos/tokens.css (--negro-grano, --amarillo, --blanco).
const NEGRO = "#0d0d0d";
const AMARILLO = "#ffc624";
const BLANCO = "#ffffff";

const anton = await readFile(join(process.cwd(), "src/app/fuentes/Anton-Regular.ttf"));

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          background: NEGRO,
          fontFamily: "Anton",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 0.95, color: BLANCO }}>GIMNASIO EN</div>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 0.95, color: AMARILLO }}>
            {localidad.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 36,
              padding: "6px 18px",
              background: AMARILLO,
              color: NEGRO,
              fontSize: 40,
              letterSpacing: 1,
            }}
          >
            {negocio.nombre.toUpperCase()}
          </div>
        </div>
        {/* El isotipo de src/components/Isotipo.tsx, con los colores fijos. */}
        <svg width="300" height="324" viewBox="0 0 467 505">
          <path fill={BLANCO} d="M0 62H254A126 126 0 0 1 254 314H169V240H218A52 52 0 0 0 218 136H93Z" />
          <path fill={BLANCO} d="M59 151H154V324L59 505Z" />
          <path fill={AMARILLO} d="M154 324V383L59 505Z" />
          <circle fill={AMARILLO} cx="431" cy="36" r="36" />
        </svg>
      </div>
    ),
    { ...size, fonts: [{ name: "Anton", data: anton, style: "normal", weight: 400 }] },
  );
}
