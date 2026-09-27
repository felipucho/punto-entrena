import type { Collection } from "tinacms";

// Textos fijos de /equipo. Los nombres, frases, horarios y preguntas de los profes siguen en src/data/site.ts.
const equipo: Collection = {
  name: "equipo",
  label: "Equipo",
  path: "content/paginas",
  format: "json",
  match: { include: "equipo" },
  ui: {
    router: () => "/equipo",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "string", name: "titulo", label: "Encabezado · título (antes del nombre del gimnasio)", required: true },
    { type: "string", name: "intro", label: "Encabezado · indicación", required: true, ui: { component: "textarea" } },
    { type: "string", name: "selectorTitulo", label: "Fotos · nombre de la fila (para lectores de pantalla)", required: true },
    { type: "string", name: "horariosEtiqueta", label: "Ficha del profe · horarios (antes del nombre)", required: true },
    { type: "string", name: "preguntaEtiqueta", label: "Ficha del profe · pregunta frecuente (antes del nombre)", required: true },
    { type: "string", name: "boton", label: "Cierre · botón", required: true },
  ],
};

export default equipo;
