import { exigirSesion } from "@/lib/panel-auth";
import { fechaArgentina } from "@/lib/novedades-fechas";
import { MENSAJE_SIN_ALMACEN, almacenDelEntorno } from "@/lib/panel-almacen";
import { ahora } from "@/lib/panel-contenido";
import FormularioNovedad from "../FormularioNovedad";

export default async function NuevaNovedad() {
  await exigirSesion();
  if (!almacenDelEntorno()) {
    return (
      <p className="panel-alerta mt-10" role="alert">
        {MENSAJE_SIN_ALMACEN}
      </p>
    );
  }
  return <FormularioNovedad inicial={{ slug: null, titulo: "", fecha: fechaArgentina(ahora()), texto: "", tamano: "mediana", foto: null }} />;
}
