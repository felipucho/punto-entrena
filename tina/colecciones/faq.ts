import type { Collection } from "tinacms";

// Textos fijos de /faq. Las preguntas viven en src/data/site.ts y src/lib/faq.ts porque también arman el JSON-LD.
const faq: Collection = {
  name: "faq",
  label: "Preguntas frecuentes",
  path: "content/paginas",
  format: "json",
  match: { include: "faq" },
  ui: {
    router: () => "/faq",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "string", name: "titulo", label: "Portada · título", required: true },
    { type: "string", name: "intro", label: "Portada · bajada", required: true, ui: { component: "textarea" } },
    { type: "string", name: "comoEmpiezoTitulo", label: "Cómo empiezo · título", required: true },
    { type: "string", name: "queLlevarTitulo", label: "Qué llevar · título", required: true },
    { type: "string", name: "dudasTitulo", label: "Dudas · título", required: true },
    { type: "string", name: "boton", label: "Cierre · botón", required: true },
  ],
};

export default faq;
