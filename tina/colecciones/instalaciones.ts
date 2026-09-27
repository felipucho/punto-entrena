import type { Collection } from "tinacms";

// Textos fijos de /instalaciones. Las plantas, su foco y sus destacados siguen en src/data/site.ts.
const instalaciones: Collection = {
  name: "instalaciones",
  label: "Instalaciones",
  path: "content/paginas",
  format: "json",
  match: { include: "instalaciones" },
  ui: {
    router: () => "/instalaciones",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "string", name: "titulo", label: "Portada · título", required: true },
    { type: "string", name: "comoSeEntrenaTitulo", label: "Plantas · cómo se entrena · título", required: true },
    {
      type: "object",
      name: "queEntrenas",
      label: "Plantas · cómo se entrena · texto",
      fields: [
        {
          type: "string",
          name: "plantaBaja",
          label: "Planta baja",
          required: true,
          ui: { component: "textarea" },
        },
        {
          type: "object",
          name: "plantaAlta",
          label: "Planta alta (en el medio va el foco de la planta)",
          fields: [
            { type: "string", name: "antesDelFoco", label: "Planta alta · antes del foco", required: true },
            {
              type: "string",
              name: "despuesDelFoco",
              label: "Planta alta · después del foco",
              required: true,
              ui: { component: "textarea" },
            },
          ],
        },
      ],
    },
    { type: "string", name: "equipamientoTitulo", label: "Plantas · equipamiento · título", required: true },
    { type: "string", name: "boton", label: "Cierre · botón", required: true },
  ],
};

export default instalaciones;
