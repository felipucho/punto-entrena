import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF pesa bastante menos que WebP con la misma calidad; el navegador que no lo soporta recibe WebP.
  images: { formats: ["image/avif", "image/webp"] },
  // El editor de Tina vive en public/admin/index.html; así se entra escribiendo solo /admin.
  async redirects() {
    return [{ source: "/admin", destination: "/admin/index.html", permanent: false }];
  },
};

export default nextConfig;
