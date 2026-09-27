# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas de Las Varillas (Córdoba) y localidades cercanas que están pensando en empezar a entrenar: sobre todo quienes nunca fueron a un gimnasio, adultos mayores y personas en rehabilitación; también adultos en general y deportistas. Llegan desde el celular, casi siempre después de buscar un gimnasio en Google o de preguntarle a un asistente de IA (ChatGPT, Gemini).

Su trabajo: resolver cinco dudas antes de animarse (cuánto cuesta, cuándo puede ir, cómo es el lugar, quién lo va a atender y si el gimnasio es para su caso) y consultar por WhatsApp.

## Product Purpose

Sitio del gimnasio Punto Entrenamiento y Salud. Existe para diferenciar a Punto de los otros gimnasios de la zona mostrando lo que ellos no muestran (los profes, los precios y la forma de trabajar), para aparecer entre las primeras opciones en buscadores y asistentes de IA, y para generar consultas: cada sección termina en un WhatsApp con el mensaje ya escrito según lo que la persona estaba mirando. Éxito: consultas por WhatsApp de gente nueva.

## Positioning

Atención personalizada: una planilla individual que arman los profes según el nivel de cada alumno, y siempre se sabe qué profe está atendiendo (estado en vivo calculado desde la grilla de profes). Precios y costo por clase publicados, horarios detallados por profe y una sección por objetivo con un mito desmentido por perfil. Según el relevamiento de la propuesta (septiembre 2026), ningún gimnasio de la zona muestra esto.

## Operating Context

- Ocho secciones (Inicio, Planes, Horarios, Instalaciones, Equipo, Objetivos, Preguntas frecuentes, Contacto) más privacidad y términos. Navegación arriba a la derecha y botón de WhatsApp siempre visible.
- Dos plantas con foco distinto y cuatro profes; los datos viven en `src/data/site.ts`.
- Fuera de la web: Instagram, Facebook (enlace pendiente) y ficha de Google Maps, con los mismos datos de contacto que el sitio.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19 y Tailwind v4, render estático: 10 rutas más not-found.
- Única fuente de datos: `src/data/site.ts`. Todo lo derivado se calcula (precio por clase, horarios por profe, estado en vivo, JSON-LD, respuestas del FAQ). Un dato en `null` oculta lo que depende de él.
- JS de cliente solo en `EstadoEnVivo`, `HeroVideo`, `MenuMobile` y `Selector`.
- Estructura y rutas están cerradas. Los textos se reescribieron en septiembre 2026 con técnicas de copywriting y psicología de marketing, y se volvieron a reescribir ese mismo mes para sacar obviedades y que suenen humanos (ver "Voz y persuasión"); todo cambio de texto posterior sigue esas reglas. La etapa de diseño cambia solo la capa visual: tokens de `src/app/globals.css`, estilos de componentes, fotos, video y logo.
- Todo el contenido es texto real (nunca dentro de imágenes), con datos estructurados y carga rápida en celular.
- Pendientes que no se inventan: frase y pregunta frecuente de cada profe, horas más tranquilas, referencia para llegar, cómo se aplica el descuento familiar, confirmación de qué llevar, si el teléfono es celular (+54 9), enlace de Facebook, dominio y coordenadas.

## Brand Commitments

- Nombre: Punto Entrenamiento y Salud.
- El logo y los colores de marca existen y son fijos; el archivo original del logo todavía no se entregó. El diseño los aplica tal cual, no los reinterpreta.
- Voz de los textos aprobados: español rioplatense con voseo, directa y concreta.
- Anti-objetivo confirmado: estética de gimnasio agresiva o fotos de stock; nada que intimide al principiante.

## Voz y persuasión

- **No aclares que oscurece** (regla de Felipe, septiembre 2026): no se aclara lo que es normal en cualquier gimnasio. Si nadie lo dudaba, no se dice. Fuera: "sin turnos", "venís cuando te queda cómodo", "te conocen por tu nombre", "sin compromiso", "es gratis escribir", "precios a la vista" y las negaciones defensivas ("no al revés", "no pasa nada").
- Que suene humano: como lo diría Matías en el mostrador a un vecino de Las Varillas. Frases cortas, sin moldes repetidos (pregunta retórica + "Acá…"), sin repetir la misma idea en cada sección.
- Cada sección nombra una duda real del lector, muestra cómo es en Punto y cierra con un paso chico por WhatsApp.
- Técnicas permitidas: objeción → respuesta, beneficio antes que característica, datos reales interpolados, anclaje del precio por clase contra la clase suelta, recomendación solo donde ya existe (2 veces por semana para arrancar, pase libre con horarios rotativos), autoridad real (profes de educación física).
- Prohibido: testimonios, reseñas o cifras de alumnos inventadas; urgencia o escasez; promesas de resultado; claims médicos; condiciones no confirmadas ("gratis", "sin matrícula", comodidades); frases atribuidas a profes; exclamaciones y lenguaje fitness agresivo o de culpa.
- CTA = verbo + lo que obtiene. En botones de WhatsApp con ícono visible, "por WhatsApp" va en `sr-only` para que el botón entre en un renglón a 375 px.
- Menú y títulos de tarjetas usan los mismos nombres de sección (Equipo, Objetivos).

## Evidence on Hand

- Textos finales y datos reales en el código: precios, grilla de profes, plantas y equipamiento, primer mes y mito por perfil.
- Ausentes, no se fabrican: fotos, video del lugar, logo original, frases de profes, reseñas o testimonios. `public/` está vacío; cada foto faltante está marcada con `ImagePlaceholder` y el video tiene sus specs en `src/components/HeroVideo.tsx`.
- No se usan fotos de stock ni imágenes generadas presentadas como del gimnasio.

## Product Principles

1. Nada inventado: cada dato sale de `site.ts` o de Matías; si falta, se oculta.
2. Mostrar en vez de prometer: precios, costo por clase, profes con nombre y horario, estado en vivo.
3. Bajarle la ansiedad a quien nunca fue a un gimnasio: claridad antes que épica.
4. Cada sección termina en una consulta concreta por WhatsApp.
5. Legible para personas, buscadores y asistentes de IA: texto real, respuestas breves, rápido en celular.

## Accessibility & Inclusion

Público con adultos mayores y personas en rehabilitación: texto base de 17 px que respeta el tamaño elegido en el navegador, contraste AA como mínimo, foco visible, respeto de `prefers-reduced-motion` y botón de pausa en el video (WCAG 2.2.2). Ninguna etapa retrocede en esto.
