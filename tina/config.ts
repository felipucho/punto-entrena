import { defineConfig, type TinaField } from "tinacms";
import planes from "./colecciones/planes";
import horarios from "./colecciones/horarios";
import contacto from "./colecciones/contacto";
import faq from "./colecciones/faq";
import equipo from "./colecciones/equipo";
import objetivos from "./colecciones/objetivos";
import instalaciones from "./colecciones/instalaciones";
import privacidad from "./colecciones/privacidad";
import terminos from "./colecciones/terminos";

// Solo se edita en local (npm run dev → /admin). Los cambios se guardan en content/ y se suben con git.
// Para editar desde la web publicada hace falta TinaCloud (clientId + token).

const texto = (name: string, label: string, largo = false): TinaField => ({
  type: "string",
  name,
  label,
  required: true,
  ...(largo ? { ui: { component: "textarea" } } : {}),
});

const tarjeta = (name: string, label: string): TinaField => ({
  type: "object",
  name,
  label,
  fields: [texto("titulo", "Título"), texto("frase", "Frase", true)],
});

export default defineConfig({
  branch: "master",
  clientId: null,
  token: null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "inicio",
        label: "Inicio",
        path: "content/paginas",
        format: "json",
        match: { include: "inicio" },
        ui: {
          router: () => "/",
          allowedActions: { create: false, delete: false },
        },
        fields: [
          texto("heroLinea1", "Portada · titular (blanco)"),
          texto("heroLinea2", "Portada · titular (amarillo)"),
          texto("heroBajada", "Portada · bajada", true),
          texto("heroBoton", "Portada · botón"),
          texto("queEsTitulo", "Qué es · título"),
          texto("queEsIntro", "Qué es · primer párrafo", true),
          texto("queEsTexto", "Qué es · segundo párrafo", true),
          texto("planillaTitulo", "Cómo entrenás · planilla · título"),
          texto("planillaTexto", "Cómo entrenás · planilla · texto", true),
          texto("planillaEnlace", "Cómo entrenás · planilla · enlace"),
          texto("plantasTitulo", "Cómo entrenás · plantas · título"),
          texto("plantasTexto", "Cómo entrenás · plantas · texto (cada renglón se ve aparte)", true),
          texto("plantasEnlace", "Cómo entrenás · plantas · enlace"),
          texto("profesTitulo", "Cómo entrenás · profes · título"),
          texto("profesTexto", "Cómo entrenás · profes · texto", true),
          texto("profesEnlace", "Cómo entrenás · profes · enlace"),
          texto("precioBoton", "Bloque de precio · botón"),
          texto("conoceMasTitulo", "Tarjetas · título"),
          {
            type: "object",
            name: "tarjetas",
            label: "Tarjetas",
            fields: [
              tarjeta("planes", "Planes"),
              tarjeta("horarios", "Horarios"),
              tarjeta("instalaciones", "Instalaciones"),
              tarjeta("equipo", "Equipo"),
              tarjeta("objetivos", "Objetivos"),
            ],
          },
          texto("cierreTitulo", "Cierre · título"),
          texto("cierreTexto", "Cierre · texto", true),
          texto("cierreBoton", "Cierre · botón"),
        ],
      },
      planes, horarios, contacto, faq, equipo, objetivos, instalaciones, privacidad, terminos,
    ],
  },
});
