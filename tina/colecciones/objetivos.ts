import type { Collection } from "tinacms";

// Textos fijos de /objetivos. El nombre, el mito y el mensaje de WhatsApp de cada objetivo siguen en src/data/site.ts.
const objetivos: Collection = {
  name: "objetivos",
  label: "Objetivos",
  path: "content/paginas",
  format: "json",
  match: { include: "objetivos" },
  ui: {
    router: () => "/objetivos",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "string", name: "titulo", label: "Encabezado · título", required: true },
    { type: "string", name: "intro", label: "Encabezado · bajada", required: true, ui: { component: "textarea" } },
    {
      type: "string",
      name: "introMito",
      label: "Encabezado · frase del mito (se ve si algún objetivo tiene mito)",
      required: true,
      ui: { component: "textarea" },
    },
    { type: "string", name: "selectorTitulo", label: "Pestañas · nombre (para lectores de pantalla)", required: true },
    { type: "string", name: "primerMesEtiqueta", label: "Panel · título de «Tu primer mes»", required: true },
    {
      type: "object",
      name: "primerMes",
      label: "Panel · primer mes de cada objetivo",
      fields: [
        { type: "string", name: "adultos", label: "Adultos", required: true, ui: { component: "textarea" } },
        { type: "string", name: "adultosMayores", label: "Adultos mayores", required: true, ui: { component: "textarea" } },
        { type: "string", name: "rehabilitacion", label: "Rehabilitación", required: true, ui: { component: "textarea" } },
        { type: "string", name: "principiantes", label: "Principiantes", required: true, ui: { component: "textarea" } },
        { type: "string", name: "deportistas", label: "Deportistas", required: true, ui: { component: "textarea" } },
      ],
    },
    { type: "string", name: "mitoEtiqueta", label: "Panel · título del mito", required: true },
    { type: "string", name: "boton", label: "Panel · botón", required: true },
  ],
};

export default objetivos;
