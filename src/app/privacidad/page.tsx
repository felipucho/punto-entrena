import { negocio } from "@/data/site";
import { formatearLista, telHref } from "@/lib/formato";
import { redesActivas } from "@/lib/redes";
import { metadataDePagina } from "@/lib/seo";
import { urlWhatsApp } from "@/lib/whatsapp";

export const metadata = metadataDePagina({
  titulo: "Política de privacidad",
  descripcion: `El sitio de ${negocio.nombre} no tiene formularios ni cookies propias. Qué pasa con el mapa de Google, WhatsApp y tus derechos por la Ley 25.326.`,
  ruta: "/privacidad",
});

/** "WhatsApp e Instagram": las redes en null no se mencionan. */
const serviciosEnlazados = formatearLista(["WhatsApp", ...redesActivas().map((red) => red.nombre)]);

// TODO: revisar antes de publicar. Texto legal redactado sin asesoramiento profesional.
export default function Privacidad() {
  return (
    <div className="contenedor pt-section pb-section">
      <h1>Política de privacidad</h1>
      <p className="intro mt-4">
        Acá te contamos qué pasa con tus datos cuando usás el sitio de {negocio.nombre}. Es un sitio
        informativo y no te pide ningún dato para recorrerlo.
      </p>

      <div className="mt-12 max-w-[65ch] space-y-12">
        <section aria-labelledby="privacidad-formularios">
          <h2 id="privacidad-formularios" className="mb-4">
            Formularios y registro
          </h2>
          <div className="prosa">
            <p>
              El sitio no tiene formularios ni cuentas de usuario. No tenés que cargar tu nombre, tu correo ni tu
              teléfono para ver ninguna página.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-cookies">
          <h2 id="privacidad-cookies" className="mb-4">
            Cookies y estadísticas
          </h2>
          <div className="prosa">
            <p>
              No usamos cookies propias ni herramientas de analítica. No medimos cuántas personas entran ni qué
              páginas miran.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-mapa">
          <h2 id="privacidad-mapa" className="mb-4">
            Mapa de Google
          </h2>
          <div className="prosa">
            <p>
              Para mostrarte dónde queda el gimnasio, el sitio usa un mapa de Google Maps. Cuando el mapa se carga,
              Google puede usar cookies y recibir datos de tu navegación según su propia política de privacidad,
              que no depende de nosotros.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-enlaces">
          <h2 id="privacidad-enlaces" className="mb-4">
            Enlaces a {serviciosEnlazados}
          </h2>
          <div className="prosa">
            <p>
              Los enlaces a {serviciosEnlazados} te llevan a servicios de terceros, cada uno con su propia
              política de privacidad. Lo que nos escribas por WhatsApp lo leemos en el gimnasio para responderte.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacidad-derechos">
          <h2 id="privacidad-derechos" className="mb-4">
            Tus derechos
          </h2>
          <div className="prosa">
            <p>
              La Ley 25.326 de Protección de Datos Personales te da derecho a saber qué datos tuyos tenemos, a
              pedir que los corrijamos y a pedir que los borremos (derechos de acceso, rectificación y supresión).
              Para cualquiera de esas consultas, escribinos por{" "}
              <a href={urlWhatsApp()} target="_blank" rel="noopener" className="enlace">
                WhatsApp
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>{" "}
              o llamanos al{" "}
              <a href={telHref()} className="enlace whitespace-nowrap">
                {negocio.telefono.visible}
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
