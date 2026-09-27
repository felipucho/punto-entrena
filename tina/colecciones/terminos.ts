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
// por eso hay textos partidos en "antes" y "después" del dato o del enlace.
const terminos: Collection = {
  name: "terminos",
  label: "Términos y condiciones",
  path: "content/paginas",
  format: "json",
  match: { include: "terminos" },
  ui: {
    router: () => "/terminos",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    texto("titulo", "Portada · título"),
    texto("introAntes", "Portada · intro antes del nombre del gimnasio", true),
    texto("introDespues", "Portada · intro después del nombre del gimnasio", true),
    seccion("precios", "Precios y horarios", [
      texto("titulo", "Precios · título"),
      texto("textoAntes", "Precios · texto antes del enlace a planes"),
      texto("enlacePlanes", "Precios · enlace a planes"),
      texto("textoMedio", "Precios · texto entre los enlaces"),
      texto("enlaceHorarios", "Precios · enlace a horarios"),
      texto("textoDespues", "Precios · texto antes del enlace a WhatsApp", true),
    ]),
    seccion("entrenamiento", "Información sobre entrenamiento", [
      texto("titulo", "Entrenamiento · título"),
      texto("texto", "Entrenamiento · texto", true),
    ]),
    seccion("terceros", "Servicios de terceros", [
      texto("titulo", "Terceros · título"),
      texto("texto", "Terceros · texto después de la lista de servicios", true),
    ]),
    seccion("datos", "Tus datos y consultas", [
      texto("titulo", "Datos · título"),
      texto("texto", "Datos · texto antes del enlace a WhatsApp", true),
      texto("textoTelefono", "Datos · texto antes del teléfono"),
    ]),
  ],
};

export default terminos;
