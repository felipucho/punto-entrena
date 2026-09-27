import type { Collection, TinaField } from "tinacms";

// Textos fijos de /planes. Precios, nombres de planes y cálculos siguen en src/data/site.ts y src/lib.

const texto = (name: string, label: string, largo = false): TinaField => ({
  type: "string",
  name,
  label,
  required: true,
  ...(largo ? { ui: { component: "textarea" } } : {}),
});

const planes: Collection = {
  name: "planes",
  label: "Planes",
  path: "content/paginas",
  format: "json",
  match: { include: "planes" },
  ui: {
    router: () => "/planes",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    texto("titulo", "Encabezado · título"),
    texto("intro", "Encabezado · intro", true),
    {
      type: "object",
      name: "planesTitulo",
      label: "Planes · título (va con el nombre de la clase suelta en el medio)",
      fields: [texto("antes", "Antes del nombre"), texto("despues", "Después del nombre")],
    },
    texto("planBoton", "Planes · botón de cada plan"),
    texto("sueltaTexto", "Clase suelta · texto", true),
    texto("sueltaBoton", "Clase suelta · botón"),
    texto("precioTitulo", "Precio por clase · título"),
    texto("tablaColumnaPlan", "Precio por clase · columna del plan"),
    texto("tablaColumnaPrecio", "Precio por clase · columna del precio"),
    texto("convieneTitulo", "Qué plan me conviene · título"),
  ],
};

export default planes;
