import Link from "next/link";
import { exigirSesion } from "@/lib/panel-auth";
import { MENSAJE_SIN_ALMACEN, almacenDelEntorno } from "@/lib/panel-almacen";
import { leerNovedad, type NovedadGuardada } from "@/lib/panel-novedades";
import FormularioNovedad from "../../FormularioNovedad";

export default async function EditarNovedad({ params }: { params: Promise<{ slug: string }> }) {
  await exigirSesion();
  const { slug } = await params;
  const almacen = almacenDelEntorno();
  if (!almacen) {
    return (
      <p className="panel-alerta mt-10" role="alert">
        {MENSAJE_SIN_ALMACEN}
      </p>
    );
  }

  let novedad: NovedadGuardada | null = null;
  let falla = false;
  try {
    novedad = await leerNovedad(almacen, slug);
  } catch (error) {
    console.error("[panel] lectura", error instanceof Error ? error.message : error);
    falla = true;
  }

  if (!novedad) {
    return (
      <div className="grid justify-items-start gap-4 pt-10">
        <p className="panel-alerta" role="alert">
          {falla ? "No se pudo leer la novedad. Recargá la página." : "Esa novedad no existe (¿la borraron?)."}
        </p>
        <Link href="/panel" className="panel-boton">
          Volver al panel
        </Link>
      </div>
    );
  }

  const { titulo, fecha, texto, tamano, foto } = novedad;
  return <FormularioNovedad key={slug} inicial={{ slug, titulo, fecha, texto, tamano, foto }} />;
}
