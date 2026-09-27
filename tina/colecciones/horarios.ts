import type { Collection, TinaField } from "tinacms";

// Textos fijos de /horarios. El horario, la grilla y las horas tranquilas siguen en src/data/site.ts y src/lib.

const texto = (name: string, label: string, largo = false): TinaField => ({
  type: "string",
  name,
  label,
  required: true,
  ...(largo ? { ui: { component: "textarea" } } : {}),
});

const horarios: Collection = {
  name: "horarios",
  label: "Horarios",
  path: "content/paginas",
  format: "json",
  match: { include: "horarios" },
  ui: {
    router: () => "/horarios",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    texto("titulo", "Encabezado · título"),
    texto("introAntes", "Encabezado · intro (antes del horario)"),
    texto("profesTitulo", "Grilla de profes · título"),
    texto("profesNota", "Grilla de profes · nota", true),
    texto("tranquilasTitulo", "Horas tranquilas · título"),
    texto("boton", "Cierre · botón"),
  ],
};

export default horarios;
