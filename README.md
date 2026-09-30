# Punto Entrenamiento y Salud

Sitio web del gimnasio Punto Entrenamiento y Salud, de Las Varillas, Córdoba. Next.js (App Router), TypeScript y Tailwind CSS, con render estático.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (todas las rutas estáticas)
npm run lint
npm test         # vitest: estado en vivo, horarios de cada profe, precio por clase, SEO y metadata de las páginas
```

## Dónde se cambia cada cosa

- **Datos del gimnasio** (precios, horarios, profes, dirección, teléfono, preguntas): solo en `src/data/site.ts`. Todo lo demás (precio por clase, horario general, horarios de cada profe, JSON-LD, respuestas del FAQ) se calcula desde ahí.
- **Un dato en `null`** oculta lo que depende de él (frase y pregunta de cada profe, horas tranquilas, referencia para llegar, Facebook). Al completarlo, aparece solo.
- **Instagram y ficha de Google Maps**: `negocio.redes` y `negocio.mapa` en `src/data/site.ts`. La ficha (link corto y coordenadas del pin) sale en el botón "Cómo llegar" de `/contacto` y en `hasMap` y `geo` del JSON-LD.
- **Textos de las páginas**: `content/paginas/*.json`. Se editan a mano y el sitio los toma al compilar.
- **Dominio**: variable de entorno `NEXT_PUBLIC_SITE_URL` (por ejemplo `https://dominio-del-gimnasio.com.ar`, todavía no está definido). Sin ella se usa el dominio de producción que Vercel expone en `VERCEL_PROJECT_PRODUCTION_URL` y, fuera de Vercel, `http://localhost:3000`. Esa URL sale en canonical, `og:url`, `og:image`, `twitter:image`, sitemap, robots y JSON-LD.
- **Video del hero**: subir a `public/video/` los cuatro archivos `hero-1080.webm`, `hero-1080.mp4`, `hero-720.webm` y `hero-720.mp4`. Hasta que estén los cuatro, el hero muestra la foto de la planta baja; esa misma foto es el poster del video. Las specs de exportación están en `src/components/HeroVideo.tsx`.
- **Fotos**: cada `Foto` marca el lugar y la descripción de una foto a reemplazar. Para cambiar una foto, reemplazar el archivo de `public/fotos/` con el mismo nombre y volver a publicar. Quien ya la vio puede seguir viendo la anterior hasta 31 días (caché de imágenes); si es urgente, se purga desde el panel de Vercel.
- **Tokens de diseño**: `src/app/estilos/tokens.css` (componentes, base y movimiento en la misma carpeta; `src/app/globals.css` los importa).

## Publicar en Vercel

1. Importar el repositorio en Vercel. Next.js se detecta solo, sin comandos personalizados.
2. En Settings → Environment Variables, cargar `NEXT_PUBLIC_SITE_URL` con el dominio final (`https://…`) para Production.
3. Cada push a `master` publica. El build de Vercel no corre lint ni tests: correr `npm run lint` y `npm test` antes de subir.
