import type { Collection } from "tinacms";

// Textos fijos de /contacto. Teléfono, redes, horario, dirección y precios salen de src/data/site.ts.
const contacto: Collection = {
  name: "contacto",
  label: "Contacto",
  path: "content/paginas",
  format: "json",
  match: { include: "contacto" },
  ui: {
    router: () => "/contacto",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    { type: "string", name: "titulo", label: "Portada · título", required: true },
    { type: "string", name: "intro", label: "Portada · bajada", required: true, ui: { component: "textarea" } },
    { type: "string", name: "whatsappTitulo", label: "WhatsApp y teléfono · título", required: true },
    { type: "string", name: "whatsappBoton", label: "WhatsApp y teléfono · botón", required: true },
    { type: "string", name: "etiquetaTelefono", label: "WhatsApp y teléfono · etiqueta del teléfono", required: true },
    { type: "string", name: "etiquetaRedes", label: "WhatsApp y teléfono · etiqueta de las redes", required: true },
    { type: "string", name: "etiquetaHorario", label: "WhatsApp y teléfono · etiqueta del horario", required: true },
    {
      type: "string",
      name: "dondeTitulo",
      label: "Dónde estamos · título (sigue el nombre de la localidad)",
      required: true,
    },
    { type: "string", name: "comoLlegarBoton", label: "Dónde estamos · botón", required: true },
    { type: "string", name: "otraLocalidadTitulo", label: "Otra localidad · título", required: true },
    {
      type: "string",
      name: "otraLocalidadAviso",
      label: "Otra localidad · segundo párrafo",
      required: true,
      ui: { component: "textarea" },
    },
    { type: "string", name: "otraLocalidadBoton", label: "Otra localidad · botón", required: true },
  ],
};

export default contacto;
