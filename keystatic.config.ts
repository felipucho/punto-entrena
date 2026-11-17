import { collection, config, fields, singleton } from "@keystatic/core";
import MarcaPunto from "./src/app/keystatic/MarcaPunto";

/*
 * Panel de edición en /keystatic: solo precios y novedades. Cada guardado es un commit al repo, que dispara el deploy.
 * En desarrollo escribe directo en el disco; en producción, a GitHub (necesita las variables KEYSTATIC_* de Vercel;
 * sin ellas el build anda igual y solo falla el panel).
 * Todo lo que ve quien edita está en español. Los textos propios de Keystatic (botones, avisos, errores) los traduce
 * scripts/traducir-keystatic.mjs al instalar las dependencias.
 */
const precio = (label: string) =>
  fields.integer({
    label,
    description: "Lo que se cobra por mes. El precio por día se calcula solo.",
    validation: { isRequired: true, min: 1 },
  });

export default config({
  storage:
    // KEYSTATIC_STORAGE=github solo sirve para correr el asistente que crea la GitHub App (ver README).
    process.env.NODE_ENV === "development" && process.env.KEYSTATIC_STORAGE !== "github"
      ? { kind: "local" }
      : { kind: "github", repo: "felipucho/punto-entrena" },
  locale: "es-ES",
  ui: {
    brand: { name: "Punto", mark: MarcaPunto },
    navigation: ["precios", "novedades"],
  },
  singletons: {
    // Sin "/" al final, Keystatic escribe content/precios.json (y no content/precios/index.json).
    precios: singleton({
      label: "Precios",
      path: "content/precios",
      format: { data: "json" },
      schema: {
        unaVez: precio("1 vez por semana"),
        dosVeces: precio("2 veces por semana"),
        tresVeces: precio("3 veces por semana"),
        paseLibre: precio("Pase libre"),
        dia: fields.integer({
          label: "Día (clase suelta)",
          description: "Lo que se cobra una clase suelta.",
          validation: { isRequired: true, min: 1 },
        }),
      },
    }),
  },
  collections: {
    novedades: collection({
      label: "Novedades",
      path: "content/novedades/*",
      format: { data: "json" },
      slugField: "titulo",
      // Fecha y hora de publicación: scripts/traducir-keystatic.mjs la muestra como "En cola" o "Publicada" y ordena la lista por ella.
      columns: ["fecha"],
      schema: {
        titulo: fields.slug({
          name: {
            label: "Título",
            description: "Lo primero que se lee. Cortito, por ejemplo: Feriado del lunes.",
            validation: { isRequired: true },
          },
          // Keystatic no deja ocultar este campo: lo usa para nombrar el archivo y se completa solo.
          slug: { label: "Nombre interno", description: "Se completa solo con el título. No hace falta tocarlo." },
        }),
        // Sin zona horaria: el sitio lo toma como hora de Argentina (ver src/lib/novedades.ts).
        fecha: fields.datetime({
          label: "Fecha y hora de publicación",
          description:
            "Cuándo aparece en la página, hora de Argentina. Si ponés un momento que todavía no llegó, la novedad queda en cola y se publica sola a esa hora (puede tardar hasta 1 minuto más). Para cancelarla, borrala.",
          defaultValue: { kind: "now" },
          validation: { isRequired: true },
        }),
        texto: fields.text({
          label: "Texto",
          description: "Lo que querés contar. Dejá una línea vacía para empezar otro párrafo.",
          multiline: true,
          validation: { isRequired: true },
        }),
        foto: fields.image({
          label: "Foto",
          description: "Opcional. Sirve cualquier foto, sin preparar nada: el sitio la hace más liviana solo (puede tardar un minuto en verse).",
          directory: "public/fotos/novedades",
          publicPath: "/fotos/novedades/",
        }),
        // Los valores son los de TAMANOS_FOTO (src/lib/novedades-tamanos.mjs); src/lib/keystatic.test.ts los compara.
        tamano: fields.select({
          label: "Tamaño de la foto",
          description: "Cómo de grande se ve la foto en la página. Abajo ves cómo queda.",
          options: [
            { label: "Chica", value: "chica" },
            { label: "Mediana", value: "mediana" },
            { label: "Grande", value: "grande" },
          ],
          defaultValue: "mediana",
        }),
      },
    }),
  },
});
