import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El editor de Tina vive en public/admin/index.html; así se entra escribiendo solo /admin.
  async redirects() {
    return [{ source: "/admin", destination: "/admin/index.html", permanent: false }];
  },
};

export default nextConfig;
