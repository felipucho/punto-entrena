import type { NextConfig } from "next";

/** Headers de seguridad básicos para todas las rutas. HSTS lo agrega Vercel. */
const headersDeSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF pesa bastante menos que WebP con la misma calidad; el navegador que no lo soporta recibe WebP.
    formats: ["image/avif", "image/webp"],
    // Las fotos casi no cambian: 31 días de caché. Si se reemplaza una, quien ya la vio puede seguir viendo la
    // anterior hasta que venza; si es urgente, se purga desde el panel de Vercel.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [{ source: "/:path*", headers: headersDeSeguridad }];
  },
};

export default nextConfig;
