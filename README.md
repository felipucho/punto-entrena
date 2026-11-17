# Punto Entrenamiento y Salud

Sitio web del gimnasio Punto Entrenamiento y Salud, de Las Varillas, Córdoba. Next.js (App Router), TypeScript y Tailwind CSS, con render estático.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (el sitio es estático; solo el panel /keystatic y su API son dinámicos, y /novedades se regenera cada 60 s)
npm run lint
npm test         # vitest: estado en vivo, horarios de cada profe, precio por clase, SEO y metadata de las páginas
```

## Dónde se cambia cada cosa

- **Datos del gimnasio** (horarios, profes, dirección, teléfono, preguntas): solo en `src/data/site.ts`; los precios, en `content/precios.json`. Todo lo demás (precio por clase, horario general, horarios de cada profe, JSON-LD, respuestas del FAQ) se calcula desde ahí.
- **Un dato en `null`** oculta lo que depende de él (frase y pregunta de cada profe, horas tranquilas, referencia para llegar, Facebook). Al completarlo, aparece solo.
- **Instagram y ficha de Google Maps**: `negocio.redes` y `negocio.mapa` en `src/data/site.ts`. La ficha (link corto y coordenadas del pin) sale en el botón "Cómo llegar" de `/contacto` y en `hasMap` y `geo` del JSON-LD.
- **Novedades** (`/novedades`): una por archivo en `content/novedades/`, con `titulo`, `fecha` (fecha y hora de publicación, `YYYY-MM-DDTHH:mm`, **hora de Argentina**), `texto`, `foto` opcional y `tamano` de la foto (`chica`, `mediana` —la de siempre si falta— o `grande`: un tercio, dos tercios o todo el ancho de la columna; una foto más chica que eso se estira y puede verse algo blanda). Se cargan desde el panel `/keystatic` (ver abajo), que debajo del formulario muestra "Así se va a ver": la novedad dibujada como en el sitio (iframe a `/vista-previa-novedad`, que no es indexable), al ritmo de lo que se escribe. El texto es plano: una línea en blanco separa párrafos y un salto simple queda como salto. La foto va a color y entera, con su proporción real, en `public/fotos/novedades/<novedad>/foto.<ext>`: `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif` (un HEIC del iPhone no se muestra: se avisa en el build y la novedad sale sin foto). `npm test` revisa fechas, campos y fotos. Se muestran de la más nueva a la más vieja, solo las que ya llegaron a su hora. Los textos fijos de la página están en `content/paginas/novedades.json`.
  - **Programadas**: si la fecha y hora todavía no llegaron, la novedad queda en cola y aparece sola a esa hora, sin que nadie publique (para cancelarla, se borra). La hora se interpreta como Argentina (UTC-3, sin horario de verano) aunque el servidor corra en UTC. `/novedades` es la única ruta que se regenera sola (`revalidate = 60`): la novedad aparece hasta ~1 minuto después de su hora, con la primera visita que llegue pasado ese minuto. Mientras está en cola, ni su texto ni su foto salen en el HTML del sitio.
  - **Cómo llega el dato a Vercel**: `scripts/generar-novedades.mjs` corre antes de `build`, `dev` y `test` (`pre*` en `package.json`), lee `content/novedades/`, mide cada foto con sharp y escribe `src/data/novedades.generada.json` (ignorado por git). La página lo importa, así que viaja dentro de la función que la regenera (solo texto y tamaños: las fotos se sirven desde `public/`, no pesan en la función). Las novedades nuevas entran con el deploy que dispara cada guardado del panel; lo que hace la regeneración es mostrar a su hora las ya cargadas. En `npm run dev` se lee `content/novedades/` en el momento.
- **Textos de las páginas**: `content/paginas/*.json`. Se editan a mano y el sitio los toma al compilar.
- **Dominio**: `https://puntoentrena.com`, fijo en `src/lib/seo.ts` (la variable de entorno `NEXT_PUBLIC_SITE_URL` lo pisa si hace falta). Esa URL sale en canonical, `og:url`, `og:image`, `twitter:image`, sitemap, robots y JSON-LD, también en local y en los deploys de preview.
- **Video del hero**: subir a `public/video/` los cuatro archivos `hero-1080.webm`, `hero-1080.mp4`, `hero-720.webm` y `hero-720.mp4`. Hasta que estén los cuatro, el hero muestra la foto de la planta baja; esa misma foto es el poster del video. Las specs de exportación están en `src/components/HeroVideo.tsx`.
- **Fotos**: cada `Foto` marca el lugar y la descripción de una foto a reemplazar. Para cambiar una foto, reemplazar el archivo de `public/fotos/` con el mismo nombre y volver a publicar. Quien ya la vio puede seguir viendo la anterior hasta 31 días (caché de imágenes); si es urgente, se purga desde el panel de Vercel.
- **Tokens de diseño**: `src/app/estilos/tokens.css` (componentes, base y movimiento en la misma carpeta; `src/app/globals.css` los importa).

## Panel de edición (Keystatic)

- **URL**: `https://puntoentrena.com/keystatic` (desde el celular o la compu). Es lo único editable ahí: los 5 precios (`content/precios.json`) y las novedades (crear, editar, borrar, con foto opcional y fecha y hora de publicación; la lista muestra cuáles están "En cola" y cuáles "Publicada"). No es indexable ni figura en el sitemap.
- **Cómo publica**: cada "Guardar" es un commit a `felipucho/punto-entrena` (rama `master`), y eso dispara el deploy de siempre (push → fork → Vercel; ver `CLAUDE.md`). Los cambios se ven en el sitio uno o dos minutos después. No hay base de datos.
- **Quién entra**: cada persona que edita necesita una cuenta de GitHub con permiso de escritura en el repo (se loguea con GitHub en el panel).
- **Variables en Vercel** (Settings → Environment Variables): `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (una cadena larga al azar) y `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (el slug de la GitHub App). Salen de crear la GitHub App: en local, `KEYSTATIC_STORAGE=github npm run dev` (en PowerShell: `$env:KEYSTATIC_STORAGE="github"; npm run dev`), abrir `/keystatic` y seguir el asistente "Set up GitHub app", que las escribe en `.env.local` (ignorado por git); después copiarlas a Vercel y, en la App de GitHub, sumar `https://puntoentrena.com/api/keystatic/github/oauth/callback` a las callback URLs. Sin ellas el build anda igual y solo el panel falla.
- **En local** (`npm run dev`, sin `KEYSTATIC_STORAGE`) el panel escribe directo en el disco, sin GitHub ni commits.
- **En español**: las etiquetas y descripciones de cada campo están en `keystatic.config.ts`. Los textos propios de Keystatic (botones, avisos, errores) vienen en inglés dentro de su código: `scripts/traducir-keystatic.mjs` los reemplaza en `node_modules` al instalar (`postinstall`, también en Vercel). Por eso `@keystatic/core` y `@keystatic/next` están fijados sin `^`; al actualizarlos, `npm test` (`src/lib/keystatic.test.ts`) dice qué textos hay que revisar. El mismo script hace que la lista de novedades muestre el título, la columna de fecha diga "En cola" o "Publicada" y la ordene de la más nueva a la más vieja. Sin traducir, el panel anda igual, en inglés.
- **Estructura**: `keystatic.config.ts` define qué se edita; el panel y su API (`src/app/keystatic`, `src/app/api/keystatic`) tienen un layout raíz aparte del sitio (`src/app/(site)`), así que no heredan Header, Footer ni CSS global. La vista previa de las novedades (`src/app/(vista-previa)`) es otro layout raíz: el CSS y las fuentes del sitio, sin Header ni Footer. El panel la monta con un parche de `scripts/traducir-keystatic.mjs` (Keystatic no tiene un gancho para sumar nada al formulario) y le manda el estado del formulario por `postMessage`. El 404 de las URLs sin ruta es `src/app/global-not-found.tsx` (`experimental.globalNotFound` en `next.config.ts`).

## Publicar en Vercel

1. Importar el repositorio en Vercel. Next.js se detecta solo, sin comandos personalizados.
2. En Settings → Domains, `puntoentrena.com` como dominio principal y `www.puntoentrena.com` redirigiendo a él.
3. Cada push a `master` publica. El build de Vercel no corre lint ni tests: correr `npm run lint` y `npm test` antes de subir.
