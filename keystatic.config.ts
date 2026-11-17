import { collection, config, fields, singleton } from "@keystatic/core";

/*
 * Panel de edición en /keystatic: solo precios y novedades. Cada guardado es un commit al repo, que dispara el deploy.
 * En desarrollo escribe directo en el disco; en producción, a GitHub (necesita las variables KEYSTATIC_* de Vercel;
 * sin ellas el build anda igual y solo falla el panel).
 */
const precio = (label: string) =>
  fields.integer({ label, description: "En pesos",validation: { isRequired: true, min: 1 } });

export default config({
  storage:
    // KEYSTATIC_STORAGE=github solo sirve para correr el asistente que crea la GitHub App (ver README).
    process.env.NODE_ENV === "development" && process.env.KEYSTATIC_STORAGE !== "github"
      ? { kind: "local" }
      : { kind: "github", repo: "felipucho/punto-entrena" },
  locale: "es-ES",
  ui: {
    brand: { name: "Punto" },
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
        dia: precio("Día (clase suelta)"),
      },
    }),
  },
  collections: {
    novedades: collection({
      label: "Novedades",
      path: "content/novedades/*",
      format: { data: "json" },
      slugField: "titulo",
      columns: ["fecha"],
      schema: {
        titulo: fields.slug({ name: { label: "Título", validation: { isRequired: true } } }),
        fecha: fields.date({ label: "Fecha", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
        texto: fields.text({
          label: "Texto",
          description: "Una línea en blanco separa los párrafos.",
          multiline: true,
          validation: { isRequired: true },
        }),
        foto: fields.image({
          label: "Foto (opcional)",
          directory: "public/fotos/novedades",
          publicPath: "/fotos/novedades/",
        }),
      },
    }),
  },
});
