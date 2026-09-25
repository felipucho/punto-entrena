import Link from "next/link";
import MenuMobile from "@/components/MenuMobile";
import { negocio } from "@/data/site";
import { enlaceContacto, navegacion } from "@/lib/rutas";

export default function Header() {
  return (
    <header className="relative border-b border-border bg-bg">
      <div className="contenedor flex min-h-16 items-center justify-between gap-4 py-3">
        {/* TODO: reemplazar el nombre por el logo SVG cuando esté (con el nombre como texto accesible). */}
        <Link href="/" className="text-lg leading-tight font-bold">
          {negocio.nombre}
        </Link>
        <nav aria-label="Principal">
          <MenuMobile enlaces={navegacion} destacado={enlaceContacto} />
        </nav>
      </div>
    </header>
  );
}
