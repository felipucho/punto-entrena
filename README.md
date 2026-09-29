# Punto Entrenamiento y Salud

Sitio web del gimnasio Punto Entrenamiento y Salud, de Las Varillas, Córdoba. Next.js (App Router), TypeScript y Tailwind CSS, con render estático.

## Comandos

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (todas las rutas estáticas)
npm run lint
npm test         # vitest: estado en vivo, horarios de cada profe y precio por clase
```

## Dónde se cambia cada cosa

- **Datos del gimnasio** (precios, horarios, profes, dirección, teléfono, preguntas): solo en `src/data/site.ts`. Todo lo demás (precio por clase, horario general, horarios de cada profe, JSON-LD, respuestas del FAQ) se calcula desde ahí.
- **Un dato en `null`** oculta lo que depende de él (frase y pregunta de cada profe, horas tranquilas, referencia para llegar, Facebook). Al completarlo, aparece solo.
- **Dominio**: variable de entorno `NEXT_PUBLIC_SITE_URL` (por ejemplo `https://dominio-del-gimnasio.com.ar`, todavía no está definido). Sin ella se usa `http://localhost:3000` en canonical, sitemap, robots y JSON-LD.
- **Video del hero**: subir a `public/video/` los archivos `hero-1080.webm`, `hero-1080.mp4`, `hero-720.webm`, `hero-720.mp4` y `hero-poster.jpg`. Las specs de exportación están en `src/components/HeroVideo.tsx`.
- **Fotos**: cada `Foto` marca el lugar y la descripción de una foto a reemplazar.
- **Tokens de diseño**: `src/app/estilos/tokens.css` (componentes, base y movimiento en la misma carpeta; `src/app/globals.css` los importa).
