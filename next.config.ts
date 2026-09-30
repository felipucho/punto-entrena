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
    // Los originales miden como mucho 864 px de ancho. Los anchos del default por encima de 828 (1080…3840)
    // devolvían el mismo archivo con otra URL: otra transformación y otra entrada de caché, sin ganar nitidez.
    // 512 llena el salto de 384 a 640. La galería de /instalaciones ocupa ~255–284 px en un celular y, con densidad
    // de 1,75 a 2, necesita ~490–510 px; el navegador elige el primer ancho que alcanza, así que antes bajaba 640.
    // imageSizes queda en el default, explícito para leer la lista completa de anchos. Si llegan fotos más grandes
    // (por ejemplo, un hero a todo el ancho con original más grande), hay que sumar 1080 y 1920.
    deviceSizes: [512, 640, 750, 828],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // Las fotos casi no cambian: 31 días de caché. Si se reemplaza una, quien ya la vio puede seguir viendo la
    // anterior hasta que venza; si es urgente, se purga desde el panel de Vercel.
    minimumCacheTTL: 2678400,
  },
  // El CSS va en un <style> dentro del HTML en vez de un <link>, así la primera visita pinta sin esperar otro
  // request bloqueante. El CSS de Tailwind del sitio pesa ~15 KB comprimido. La contra es que no se cachea
  // aparte. Las navegaciones internas siguen usando <link>. Es experimental en Next 16: si trae problemas, se
  // saca esta línea.
  experimental: {
    inlineCss: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: headersDeSeguridad }];
  },
};

export default nextConfig;
