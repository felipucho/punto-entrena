# Punto Entrenamiento y Salud

Sitio web del gimnasio Punto Entrenamiento y Salud, de Las Varillas, Córdoba. Next.js (App Router), TypeScript y Tailwind CSS, con render estático.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (el sitio es estático; solo el panel /panel es dinámico, y /novedades se regenera cada 60 s)
npm run lint
npm test         # vitest: estado en vivo, horarios de cada profe, precio por clase, SEO y metadata de las páginas
```

## Dónde se cambia cada cosa

- **Datos del gimnasio** (horarios, profes, dirección, teléfono, preguntas): solo en `src/data/site.ts`; los precios, en `content/precios.json`. Todo lo demás (precio por clase, horario general, horarios de cada profe, JSON-LD, respuestas del FAQ) se calcula desde ahí.
- **Un dato en `null`** oculta lo que depende de él (frase y pregunta de cada profe, horas tranquilas, referencia para llegar, Facebook). Al completarlo, aparece solo.
- **Instagram y ficha de Google Maps**: `negocio.redes` y `negocio.mapa` en `src/data/site.ts`. La ficha (link corto y coordenadas del pin) sale en el botón "Cómo llegar" de `/contacto` y en `hasMap` y `geo` del JSON-LD.
- **Novedades** (`/novedades`): una por archivo en `content/novedades/`, con `titulo`, `fecha` (fecha y hora de publicación, `YYYY-MM-DDTHH:mm`, **hora de Argentina**), `texto`, `foto` opcional y `tamano` de la foto (`chica`, `mediana` —la de siempre si falta— o `grande`: un tercio, dos tercios o todo el ancho de la columna; una foto más chica que eso se estira y puede verse algo blanda). Se cargan desde el panel `/panel` (ver abajo), que debajo del formulario muestra "Así se va a ver": la novedad dibujada como en el sitio (mismo componente `ArticuloNovedad`), al ritmo de lo que se escribe. El texto es plano: una línea en blanco separa párrafos y un salto simple queda como salto. La foto va a color y entera, con su proporción real, en `public/fotos/novedades/<novedad>/foto.<ext>`: `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif` (un HEIC del iPhone no se muestra: se avisa en el build y la novedad sale sin foto). `npm test` revisa fechas, campos y fotos. Se muestran de la más nueva a la más vieja, solo las que ya llegaron a su hora. Los textos fijos de la página están en `content/paginas/novedades.json`.
  - **Programadas**: si la fecha y hora todavía no llegaron, la novedad queda en cola y aparece sola a esa hora, sin que nadie publique (para cancelarla, se borra). La hora se interpreta como Argentina (UTC-3, sin horario de verano) aunque el servidor corra en UTC. `/novedades` es la única ruta que se regenera sola (`revalidate = 60`): la novedad aparece hasta ~1 minuto después de su hora, con la primera visita que llegue pasado ese minuto. Mientras está en cola, ni su texto ni su foto salen en el HTML del sitio.
  - **Cómo llega el dato a Vercel**: `scripts/generar-novedades.mjs` corre antes de `build`, `dev` y `test` (`pre*` en `package.json`), lee `content/novedades/`, mide cada foto con sharp y escribe `src/data/novedades.generada.json` (ignorado por git). La página lo importa, así que viaja dentro de la función que la regenera (solo texto y tamaños: las fotos se sirven desde `public/`, no pesan en la función). Las novedades nuevas entran con el deploy que dispara cada guardado del panel; lo que hace la regeneración es mostrar a su hora las ya cargadas. En `npm run dev` se lee `content/novedades/` en el momento.
- **Textos de las páginas**: `content/paginas/*.json`. Se editan a mano y el sitio los toma al compilar.
- **Dominio**: `https://puntoentrena.com`, fijo en `src/lib/seo.ts` (la variable de entorno `NEXT_PUBLIC_SITE_URL` lo pisa si hace falta). Esa URL sale en canonical, `og:url`, `og:image`, `twitter:image`, sitemap, robots y JSON-LD, también en local y en los deploys de preview.
- **Video del hero**: subir a `public/video/` los cuatro archivos `hero-1080.webm`, `hero-1080.mp4`, `hero-720.webm` y `hero-720.mp4`. Hasta que estén los cuatro, el hero muestra la foto de la planta baja; esa misma foto es el poster del video. Las specs de exportación están en `src/components/HeroVideo.tsx`.
- **Fotos**: cada `Foto` marca el lugar y la descripción de una foto a reemplazar. Para cambiar una foto, reemplazar el archivo de `public/fotos/` con el mismo nombre y volver a publicar. Quien ya la vio puede seguir viendo la anterior hasta 31 días (caché de imágenes); si es urgente, se purga desde el panel de Vercel.
- **Tokens de diseño**: `src/app/estilos/tokens.css` (componentes, base y movimiento en la misma carpeta; `src/app/globals.css` los importa).

## Panel (/panel)

- **Qué es**: un panel propio en `https://puntoentrena.com/panel`, con usuario y contraseña por persona. Edita los 5 precios (`content/precios.json`) y las novedades (`content/novedades/<slug>.json` + foto en `public/fotos/novedades/<slug>/foto.webp`; la lista muestra cuáles están "En cola" y cuáles "Publicada"). Quien lo usa nunca ve GitHub. No es indexable (noindex, `robots.txt`, sin sitemap). Al pie de `/panel` aparecen los últimos 10 cambios (quién y cuándo).
- **Cómo publica**: cada "Guardar" es un commit a `felipucho/punto-entrena` (rama `master`, autor "Panel de Punto", mensaje `Panel (Mati): ...`) con el JSON y la foto juntos, y eso dispara el deploy de siempre (push → fork → Vercel; ver `CLAUDE.md`). Se ve en el sitio uno o dos minutos después. La foto se achica en el navegador (WebP, 1600 px) y el servidor la vuelve a procesar con sharp.
- **Cuentas, sesiones e historial**: viven en Supabase (Postgres), esquema en `supabase/migrations/`. Las contraseñas se guardan con scrypt (nunca en claro); la cookie lleva un token al azar y en la base solo está su sha256. La sesión dura 180 días y "Salir" la borra también en el servidor. Las tablas tienen RLS sin políticas: solo el servidor del panel, con la clave secreta, puede leerlas.
- **Variables en Vercel** (Settings → Environment Variables), tres:
  - `SUPABASE_URL`: la URL del proyecto (`https://<id>.supabase.co`).
  - `SUPABASE_SECRET_KEY`: la clave secreta (`sb_secret_...`) de Supabase → Project Settings → API Keys. Nunca al navegador ni a git. Sin las dos de Supabase el panel queda apagado.
  - `GITHUB_TOKEN`: token de GitHub para guardar. Sin él (en producción) el panel avisa y no guarda.
- **Crear el token**: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Resource owner: `felipucho`. Repository access: *Only select repositories* → `felipucho/punto-entrena`. Permissions → Repository → **Contents: Read and write** (nada más). Poner un vencimiento largo y anotar la fecha: cuando venza, el panel muestra un error de permiso y hay que generar otro y pegarlo en Vercel.
- **Agregar un usuario o cambiarle la contraseña** (en la compu, con `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en `.env.local`, ignorado por git):
  `npm run panel:usuario -- mati "Mati"` y escribir la contraseña dos veces (no se ve; mínimo 12 caracteres). El usuario va en minúsculas (`a-z 0-9 . _ -`, de 3 a 32). Si ya existe, le cambia la contraseña y cierra sus sesiones. Sin terminal se lee de la entrada estándar (una línea).
- **Desactivar un usuario**: `npm run panel:usuario -- --desactivar mati` (queda sin acceso y se le cierran las sesiones). `npm run panel:usuario -- --lista` muestra usuario, nombre y estado.
- **Bloqueo**: 5 contraseñas incorrectas de un usuario en 15 minutos (contando desde su último ingreso correcto) bloquean ese usuario, y 20 intentos fallidos desde una misma IP en 15 minutos bloquean esa IP. El mensaje dice cuántos minutos faltan. Cada intento queda en la tabla `intentos` (se purgan los de más de 30 días al entrar). Los pedidos rechazados por bloqueo no se anotan, así insistir no lo alarga.
- **Mantener Supabase despierto**: el plan gratis pausa el proyecto tras 7 días sin actividad. `.github/workflows/supabase-despierto.yml` llama todos los días a la función `public.ping()` con la clave pública (publishable), que está escrita en el archivo a propósito: solo puede ejecutar esa función, que devuelve 1 (`supabase/migrations/20261117000100_ping.sql`). No hace falta ningún secret de GitHub. También se puede lanzar a mano desde la pestaña Actions.
- **En local** (`npm run dev`) sin `GITHUB_TOKEN`, el panel escribe directo en el disco, pero igual necesita `SUPABASE_URL` y `SUPABASE_SECRET_KEY` en `.env.local`. `PANEL_DISCO_RAIZ` (solo en desarrollo) apunta a otra carpeta, para probar sin tocar `content/`.
- **Estructura**: `src/app/panel` (páginas, server actions y formularios; layout raíz propio, sin Header ni Footer del sitio) y `src/lib/panel-*.ts` (`panel-db` cliente de Supabase, `panel-claves` scrypt, `panel-bloqueo`, `panel-token`, `panel-auth` login y sesión, `panel-historial`, y validación, foto y almacenamiento en GitHub o disco). Cada página y cada server action verifica la sesión por su cuenta. El 404 de las URLs sin ruta es `src/app/global-not-found.tsx` (`experimental.globalNotFound` en `next.config.ts`).

## Publicar en Vercel

1. Importar el repositorio en Vercel. Next.js se detecta solo, sin comandos personalizados.
2. En Settings → Domains, `puntoentrena.com` como dominio principal y `www.puntoentrena.com` redirigiendo a él.
3. Cada push a `master` publica. El build de Vercel no corre lint ni tests: correr `npm run lint` y `npm test` antes de subir.
