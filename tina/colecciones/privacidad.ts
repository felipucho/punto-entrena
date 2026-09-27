import type { Collection, TinaField } from "tinacms";

// Mismo helper que en tina/config.ts: un texto obligatorio, en textarea si es largo.
const texto = (name: string, label: string, largo = false): TinaField => ({
  type: "string",
  name,
  label,
  required: true,
  ...(largo ? { ui: { component: "textarea" } } : {}),
});

const seccion = (name: string, label: string, fields: TinaField[]): TinaField => ({
  type: "object",
  name,
  label,
  fields,
});

// Lo que sale de src/data/site.ts (nombre del gimnasio, redes, teléfono) queda en el código:
// por eso hay textos partidos en "antes" y "después" del dato.
const privacidad: Collection = {
  name: "privacidad",
  label: "Política de privacidad",
  path: "content/paginas",
  format: "json",
  match: { include: "privacidad" },
  ui: {
    router: () => "/privacidad",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    texto("titulo", "Portada · título"),
    texto("introAntes", "Portada · intro antes del nombre del gimnasio", true),
    texto("introDespues", "Portada · intro después del nombre del gimnasio", true),
    seccion("formularios", "Formularios y registro", [
      texto("titulo", "Formularios · título"),
      texto("texto", "Formularios · texto", true),
    ]),
    seccion("cookies", "Cookies y estadísticas", [
      texto("titulo", "Cookies · título"),
      texto("texto", "Cookies · texto", true),
    ]),
    seccion("mapa", "Mapa de Google", [texto("titulo", "Mapa · título"), texto("texto", "Mapa · texto", true)]),
    seccion("enlaces", "Enlaces a otros servicios", [
      texto("tituloAntes", "Enlaces · título antes de la lista de servicios"),
      texto("textoAntes", "Enlaces · texto antes de la lista de servicios"),
      texto("textoDespues", "Enlaces · texto después de la lista de servicios", true),
    ]),
    seccion("derechos", "Tus derechos", [
      texto("titulo", "Derechos · título"),
      texto("texto", "Derechos · texto antes del enlace a WhatsApp", true),
      texto("textoTelefono", "Derechos · texto antes del teléfono"),
    ]),
  ],
};

export default privacidad;
