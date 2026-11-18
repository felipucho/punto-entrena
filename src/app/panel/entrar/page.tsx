import { redirect } from "next/navigation";
import Isotipo from "@/components/Isotipo";
import { haySesion, panelActivo } from "@/lib/panel-auth";
import { IconoAlerta } from "../iconos";
import FormularioEntrar from "./FormularioEntrar";

export default async function Entrar() {
  if (await haySesion()) redirect("/panel");

  return (
    <div className="panel-entrar">
      <div className="panel-entrar-caja">
        <div>
          <Isotipo />
          <h1>Panel</h1>
          <p className="panel-bajada">Novedades y precios de puntoentrena.com.</p>
        </div>
        {panelActivo() ? (
          <FormularioEntrar />
        ) : (
          <p className="panel-alerta" role="alert">
            <IconoAlerta />
            El panel está apagado: faltan SUPABASE_URL y SUPABASE_SECRET_KEY en Vercel. Avisale a quien se encarga del sitio.
          </p>
        )}
      </div>
    </div>
  );
}
