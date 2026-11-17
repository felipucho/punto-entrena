// Keystatic trae casi toda su interfaz escrita en inglés dentro del código (el `locale` de la config solo cambia unos
// pocos textos). Este script reemplaza, en node_modules/@keystatic/core/dist, los textos que ve quien edita por su
// versión en español. Corre en `postinstall` (también en Vercel) y es idempotente.
//
// Está atado a una versión exacta de @keystatic/core (la de package.json, sin ^): los textos buscados son literales del
// código compilado. Si se actualiza Keystatic, `npm test` avisa qué texto ya no existe (src/lib/keystatic.test.ts).
//
// Además de textos, tres reemplazos cambian la lista de novedades del panel (ver "Lista de novedades") y uno monta la
// vista previa de la novedad debajo del formulario (ver "Vista previa").
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VERSION_KEYSTATIC = "0.6.9";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const carpetaKeystatic = path.join(raiz, "node_modules", "@keystatic", "core");
const dist = path.join(carpetaKeystatic, "dist");

/** [texto en inglés tal cual está en el código, texto en español]. Se reemplaza en todos los archivos donde aparezca. */
export const TRADUCCIONES = [
  // Pantalla principal
  ['children: "Dashboard"', 'children: "Panel"'],
  ['title: "Content"', 'title: "Contenido"'],
  ["singular: 'entry',\n        plural: 'entries'", "singular: 'novedad',\n        plural: 'novedades'"],
  ["singular: 'change',\n        plural: 'changes'", "singular: 'cambio',\n        plural: 'cambios'"],
  ['"aria-label": "Add"', '"aria-label": "Agregar"'],
  ['children: "Changed"', 'children: "Modificado"'],
  ['"aria-label": "Changed"', '"aria-label": "Modificado"'],
  ['"aria-label": "Open app navigation"', '"aria-label": "Abrir menú"'],
  ['"aria-label": "show search"', '"aria-label": "mostrar búsqueda"'],
  ['"aria-label": "theme"', '"aria-label": "Tema"'],
  ['"aria-label": "User menu"', '"aria-label": "Menú de usuario"'],
  ['"aria-label": "git actions"', '"aria-label": "Acciones"'],

  // Entrar y salir
  ['children: "Log in with GitHub"', 'children: "Entrar con GitHub"'],
  ['children: "Log in with Keystatic Cloud"', 'children: "Entrar con Keystatic Cloud"'],
  ['"aria-label": "Authenticating"', '"aria-label": "Entrando"'],
  ['label: "Log out"', 'label: "Salir"'],
  ['label: "Account"', 'label: "Cuenta"'],
  ['label: "Github repo"', 'label: "Repositorio en GitHub"'],
  ['label: "View fork"', 'label: "Ver el fork"'],
  ['children: "Sign into Cloud"', 'children: "Entrar a Keystatic Cloud"'],
  ['title: "Not found"', 'title: "No encontrado"'],
  ['children: "Not found"', 'children: "No encontrado"'],
  ['message: "This page could not be found."', 'message: "Esta página no existe."'],
  ['title: "Branch not found"', 'title: "No se encontró la rama"'],
  ['title: "Failed to load shell"', 'title: "No se pudo cargar el panel"'],

  // Lista de novedades
  ['title: "Unable to load collection"', 'title: "No se pudo cargar la lista"'],
  ['"aria-label": "Loading Entries"', '"aria-label": "Cargando"'],
  ['title: "Empty collection"', 'title: "Todavía no hay nada"'],
  ['"There aren\'t any entries yet."', '"Todavía no hay novedades."'],
  ['children: "Create the first entry"', 'children: "Creá la primera"'],
  ['"to see it here."', '"y va a aparecer acá."'],
  ['title: "No results"', 'title: "Sin resultados"'],
  ['`No items matching "${searchTerm}" were found.`', '`No hay nada que coincida con "${searchTerm}".`'],
  ["name: 'Slug',", "name: 'Título',"],
  ["name: 'Name',", "name: 'Título',"],
  ["name: 'Status',", "name: 'Estado',"],
  ['"aria-label": "Status"', '"aria-label": "Estado"'],

  // Lista de novedades: la fila muestra el título (no el nombre interno), la columna de fecha muestra
  // "En cola" o "Publicada" y la lista abre ordenada por esa columna, la más nueva primero. Keystatic solo sabe
  // mostrar el valor crudo de un campo y ordenar por el nombre interno.
  [
    "    column: SLUG,\n    direction: 'ascending'\n  });",
    "    column: (props.config.collections[props.collection].columns || [])[0] || SLUG,\n    direction: (props.config.collections[props.collection].columns || []).length ? 'descending' : 'ascending'\n  });",
  ],
  [
    'weight: "medium",\n            children: item_0.name\n',
    'weight: "medium",\n            children: (item_0.data && item_0.data[collection.slugField]) || item_0.name\n',
  ],
  [
    "val = val + '';",
    // "2026-12-20T10:00" es hora de Argentina (UTC-3, sin horario de verano): src/lib/novedades.ts hace la misma cuenta.
    "val = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/.test(val) ? (Date.UTC(+val.slice(0, 4), +val.slice(5, 7) - 1, +val.slice(8, 10), +val.slice(11, 13) + 3, +val.slice(14, 16)) > Date.now() ? 'En cola' : 'Publicada') + ' · ' + val.slice(8, 10) + '/' + val.slice(5, 7) + '/' + val.slice(0, 4) + ' ' + val.slice(11) : val + '';",
  ],

  // Vista previa: FormForEntry (el formulario de crear, editar y de los singletons) pinta los campos y nada más. Se le
  // suma, debajo, el componente que src/app/keystatic/[[...params]]/page.tsx deja en globalThis.__puntoVistaPrevia
  // (VistaPreviaNovedad), con el estado del formulario. Si no está registrado, no se pinta nada.
  [
    `    t2 = /*#__PURE__*/jsx(ScrollView, {
      children: /*#__PURE__*/jsx(PageContainer, {
        paddingY: RESPONSIVE_PADDING,
        children: /*#__PURE__*/jsx(FormValueContentFromPreviewProps, {
          forceValidation: forceValidation,
          slugField: slugField,
          ...props
        })
      })
    });`,
    `    t2 = /*#__PURE__*/jsx(ScrollView, {
      children: /*#__PURE__*/jsxs(PageContainer, {
        paddingY: RESPONSIVE_PADDING,
        children: [/*#__PURE__*/jsx(FormValueContentFromPreviewProps, {
          forceValidation: forceValidation,
          slugField: slugField,
          ...props
        }), globalThis.__puntoVistaPrevia ? /*#__PURE__*/jsx(globalThis.__puntoVistaPrevia, {
          previewProps: props
        }) : null]
      })
    });`,
  ],

  // Crear, editar y borrar
  ['isCreating ? "Create" : "Save"', 'isCreating ? "Crear" : "Guardar"'],
  ['label: "Reset changes"', 'label: "Descartar cambios"'],
  ['label: "Reset"', 'label: "Descartar cambios"'],
  [String.raw`label: "Delete entry\u2026"`, String.raw`label: "Borrar\u2026"`],
  ['label: "Copy entry"', 'label: "Copiar"'],
  ['label: "Paste entry"', 'label: "Pegar"'],
  [String.raw`label: "Duplicate entry\u2026"`, String.raw`label: "Duplicar\u2026"`],
  ['label: "Preview"', 'label: "Vista previa"'],
  ['label: "View on GitHub"', 'label: "Ver en GitHub"'],
  ['"aria-label": "Saving changes"', '"aria-label": "Guardando"'],
  ['children: "Unsaved"', 'children: "Sin guardar"'],
  ['title: "Delete entry"', 'title: "Borrar"'],
  ['cancelLabel: "Cancel"', 'cancelLabel: "Cancelar"'],
  ['primaryActionLabel: "Yes, delete"', 'primaryActionLabel: "Sí, borrar"'],
  ['children: "Are you sure? This action cannot be undone."', 'children: "¿Seguro? No se puede deshacer."'],
  ['title: "Save and duplicate entry"', 'title: "Guardar y duplicar"'],
  ['primaryActionLabel: "Save and duplicate"', 'primaryActionLabel: "Guardar y duplicar"'],
  [
    'children: "You have unsaved changes. Save this entry to duplicate it."',
    'children: "Tenés cambios sin guardar. Guardá antes de duplicar."',
  ],
  ['children: "Entry not found."', 'children: "No se encontró."'],
  ['"aria-label": "Loading Item"', '"aria-label": "Cargando"'],
  ['"aria-label": "Creating entry"', '"aria-label": "Creando"'],
  ['toastQueue.positive("Entry created"', 'toastQueue.positive("Listo, se creó"'],
  ['toastQueue.positive("Entry pasted"', 'toastQueue.positive("Listo, se pegó"'],
  ['actionLabel: "Undo"', 'actionLabel: "Deshacer"'],
  ["toastQueue.critical('Failed to paste because clipboard access was denied'", "toastQueue.critical('No se pudo pegar: el navegador no dejó leer el portapapeles'"],
  ["toastQueue.critical('Failed to read clipboard'", "toastQueue.critical('No se pudo leer el portapapeles'"],
  ["toastQueue.critical('Entry not found in clipboard'", "toastQueue.critical('No hay nada copiado para pegar'"],
  ["throw new Error('Failed to update');", "throw new Error('No se pudo guardar');"],
  [
    "reason: 'Changes must be made via pull request to this branch. Create a new branch to save changes.'",
    "reason: 'En esta rama los cambios entran por pull request. Creá una rama nueva para guardar.'",
  ],
  [
    "reason: 'This entry has been updated since it was opened. Create a new branch to save changes.'",
    "reason: 'Esto se modificó desde que lo abriste. Creá una rama nueva para guardar.'",
  ],
  ['label: "Branch name"', 'label: "Nombre de la rama"'],
  ['"aria-label": "Creating Branch"', '"aria-label": "Creando la rama"'],
  ['children: "Create branch and save"', 'children: "Crear rama y guardar"'],
  ['children: ["Restored draft from "', 'children: ["Se recuperó un borrador de "'],
  [
    'children: "Other changes have been made to this entry since the draft. You may want to discard the draft changes."',
    'children: "Esto cambió desde que se guardó el borrador. Quizás convenga descartar el borrador."',
  ],
  [String.raw`Field validation failed:\n`, String.raw`Revisá los campos:\n`],

  // Campos
  ['children: "Choose file"', 'children: "Elegir foto"'],
  ['children: "Remove"', 'children: "Quitar"'],
  ['children: "Download"', 'children: "Descargar"'],
  ['"aria-label": "regenerate"', '"aria-label": "volver a generar"'],
  ['children: "Regenerate"', 'children: "Rehacer"'],

  // Errores de validación
  ["`${label} is required`", "`${label}: es obligatorio`"],
  ['children: [props.label, " is required"]', 'children: [props.label, ": es obligatorio"]'],
  ["`${props.label} is required`", "`${props.label}: es obligatorio`"],
  ["`${label} is not a valid datetime`", "`${label}: no es una fecha y hora válida`"],
  ["`${label} must be a whole number`", "`${label}: tiene que ser un número entero`"],
  ["`${label} must be at least ${validation.min}`", "`${label}: tiene que ser al menos ${validation.min}`"],
  ["`${label} must be at most ${validation.max}`", "`${label}: no puede ser más de ${validation.max}`"],
  ["`${fieldLabel} must not be empty`", "`${fieldLabel}: no puede estar vacío`"],
  ["`${fieldLabel} must be at least ${min} characters long`", "`${fieldLabel}: tiene que tener al menos ${min} caracteres`"],
  ["`${fieldLabel} must be no longer than ${max} characters`", "`${fieldLabel}: no puede pasar de ${max} caracteres`"],
  ["`${fieldLabel} must match the pattern ${pattern.regex}`", "`${fieldLabel}: no tiene el formato correcto`"],
  ["`${fieldLabel} must not contain slashes`", "`${fieldLabel}: no puede tener barras`"],
  ["`${fieldLabel} must not start or end with spaces`", "`${fieldLabel}: no puede empezar ni terminar con espacios`"],
  ["`${fieldLabel} must be unique`", "`${fieldLabel}: ya existe otro igual`"],
];

/**
 * Aplica TRADUCCIONES a los archivos de dist.
 * - `faltan`: textos que no están ni en inglés ni en español (Keystatic cambió).
 * - `pendientes`: textos todavía en inglés (con `escribir: false`, los que el postinstall aplicaría).
 */
export function traducir({ escribir = true } = {}) {
  const archivos = readdirSync(dist)
    .filter((nombre) => nombre.endsWith(".js"))
    .map((nombre) => {
      const ruta = path.join(dist, nombre);
      return { ruta, texto: readFileSync(ruta, "utf8"), cambiado: false };
    });
  const faltan = [];
  const pendientes = [];
  for (const [ingles, espanol] of TRADUCCIONES) {
    const conIngles = archivos.filter((a) => a.texto.includes(ingles));
    if (conIngles.length > 0) {
      pendientes.push(ingles);
      for (const a of conIngles) {
        a.texto = a.texto.replaceAll(ingles, () => espanol);
        a.cambiado = true;
      }
    } else if (!archivos.some((a) => a.texto.includes(espanol))) {
      faltan.push(ingles);
    }
  }
  if (escribir) for (const a of archivos) if (a.cambiado) writeFileSync(a.ruta, a.texto);
  return { faltan, pendientes };
}

export function versionInstalada() {
  return JSON.parse(readFileSync(path.join(carpetaKeystatic, "package.json"), "utf8")).version;
}

// Ejecutado desde npm (postinstall). No corta la instalación: sin traducir el panel anda igual, en inglés.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const version = versionInstalada();
    if (version !== VERSION_KEYSTATIC) {
      console.warn(`[keystatic] versión ${version}, las traducciones son de la ${VERSION_KEYSTATIC}: revisar scripts/traducir-keystatic.mjs`);
    }
    const { faltan, pendientes } = traducir();
    console.log(`[keystatic] ${pendientes.length} textos traducidos`);
    if (faltan.length > 0) console.warn(`[keystatic] no se encontraron ${faltan.length} textos:\n  ${faltan.join("\n  ")}`);
  } catch (error) {
    console.warn(`[keystatic] no se tradujo el panel (${error instanceof Error ? error.message : error})`);
  }
}
