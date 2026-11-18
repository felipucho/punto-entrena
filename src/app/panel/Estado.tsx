import { estaPublicada, instanteDePublicacion } from "@/lib/novedades-fechas";
import { IconoAlerta, IconoReloj, IconoTilde } from "./iconos";

export default function Estado({ fecha, ahora }: { fecha: string; ahora: number }) {
  if (Number.isNaN(instanteDePublicacion(fecha)))
    return (
      <span className="panel-estado" data-estado="revisar">
        <IconoAlerta />
        Revisar fecha
      </span>
    );
  return estaPublicada(fecha, ahora) ? (
    <span className="panel-estado" data-estado="publicada">
      <IconoTilde />
      Publicada
    </span>
  ) : (
    <span className="panel-estado" data-estado="cola">
      <IconoReloj />
      En cola
    </span>
  );
}
