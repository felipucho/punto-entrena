// src/data/site.ts — única fuente de verdad del sitio.
// null = dato pendiente → lo que depende de él no se renderiza.

export type Direccion = {
  calle: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  referencia: string | null;
};

export type Negocio = {
  nombre: string;
  slogan: string;
  direccion: Direccion;
  telefono: { visible: string; tel: string; whatsapp: string };
  redes: { instagram: string | null; facebook: string | null };
  zonaHoraria: string;
  edadMinima: number;
  mediosDePago: string;
  descuentoFamiliar: { porcentaje: number; familiares: readonly string[] };
  formacionProfes: string;
  mensajeWhatsappGeneral: string;
  mensajeWhatsappEquipo: string;
  mensajeWhatsappHorarios: string;
  mensajeWhatsappInstalaciones: string;
  mensajeWhatsappFaq: string;
};

export type Plan = {
  id: string;
  nombre: string;
  clasesPorMes: number;
  precio: number;
};

export type Profe = {
  id: string;
  nombre: string;
  corto: string;
  frase: string | null;
  preguntaFrecuente: { pregunta: string; respuesta: string } | null;
};

/** "lmv" = lunes, miércoles y viernes; "mj" = martes y jueves. */
export type ColumnaGrilla = "lmv" | "mj";

export type FranjaGrilla =
  | { desde: string; hasta: string; cerrado: true }
  | { desde: string; hasta: string; cerrado?: false; lmv: string | null; mj: string | null };

export type Planta = {
  id: string;
  nombre: string;
  foco: string;
  destacados: readonly string[];
};

export type Objetivo = {
  id: string;
  nombre: string;
  mito: { mito: string; respuesta: string } | null;
  whatsapp: string;
};

/** Respuestas que se arman desde los datos con lib/faq.ts. */
export type ClaveInterpolada =
  | "paseLibre"
  | "descuentoFamiliar"
  | "edadMinima"
  | "claseSuelta"
  | "mediosDePago";

export type Pregunta = {
  pregunta: string;
  respuesta: string | { interpolar: ClaveInterpolada };
};

export const negocio: Negocio = {
  nombre: "Punto Entrenamiento y Salud",
  slogan: "Vos elegís tu objetivo. Punto te acompaña.",
  // URL base: process.env.NEXT_PUBLIC_SITE_URL (dominio pendiente), fallback "http://localhost:3000".
  direccion: {
    calle: "Roque Sáenz Peña 28",
    localidad: "Las Varillas",
    provincia: "Córdoba",
    codigoPostal: "5940",
    pais: "AR",
    referencia: null, // TODO Matías: referencia para llegar, tipo "a media cuadra de..."
  },
  // TODO Matías: confirmar si el 3533 es celular. Si lo es, el formato internacional para llamar (tel y JSON-LD)
  // lleva el 9, como el de WhatsApp: "+5493533442104". Hasta confirmarlo no se cambia el dato del pedido.
  telefono: {
    visible: "3533 44-2104",
    tel: "+543533442104",
    whatsapp: "5493533442104", // formato wa.me
  },
  redes: {
    instagram: "https://www.instagram.com/punto.entrenamiento/",
    facebook: null, // TODO: URL de la página de Facebook
  },
  zonaHoraria: "America/Argentina/Cordoba",
  edadMinima: 12,
  mediosDePago: "Aceptamos todos los medios de pago.",
  // TODO Matías: confirmar cómo se aplica el descuento familiar (a cada familiar, al que se suma, etc.).
  descuentoFamiliar: { porcentaje: 15, familiares: ["mamá", "papá", "hermanos", "hijos"] },
  formacionProfes: "Somos todos profesores de educación física o venimos de carreras afines.",
  mensajeWhatsappGeneral: "Hola, quiero empezar a entrenar. ¿Cómo hago?",
  mensajeWhatsappEquipo: "Hola, vi a los profes en la página y quiero empezar. ¿Cómo hago?",
  mensajeWhatsappHorarios: "Hola, vi los horarios y quiero arrancar. ¿Cómo es el primer día?",
  mensajeWhatsappInstalaciones: "Hola, vi el gimnasio en la página y me gustaría empezar. ¿Qué necesito?",
  mensajeWhatsappFaq: "Hola, estoy por empezar y me quedó una duda.",
};

export const planes: readonly Plan[] = [
  { id: "1-vez", nombre: "1 vez por semana", clasesPorMes: 4, precio: 40000 },
  { id: "2-veces", nombre: "2 veces por semana", clasesPorMes: 8, precio: 50000 },
  { id: "3-veces", nombre: "3 veces por semana", clasesPorMes: 12, precio: 55000 },
  { id: "pase-libre", nombre: "Pase libre", clasesPorMes: 20, precio: 60000 },
];
export const claseSuelta = { nombre: "Clase suelta", precio: 15000 } as const;
export const incluyenTodosLosPlanes =
  "Con cualquier plan usás las dos plantas y tenés tu planilla, que los profes van ajustando.";
// Brief "¿Cuál me conviene?": si arrancás de cero, con 2 veces por semana ya ves cambios;
// si tenés horarios rotativos, te conviene el pase libre.
// Brief "Cuánto te sale cada clase": el pase libre sale menos de la mitad que una clase suelta.

export const profes: readonly Profe[] = [
  { id: "matias-salve", nombre: "Matías Salve", corto: "Mati", frase: null, preguntaFrecuente: null },
  { id: "cesar-martinazzo", nombre: "César Martinazzo", corto: "César", frase: null, preguntaFrecuente: null },
  { id: "gino-magnani", nombre: "Gino Magnani", corto: "Gino", frase: null, preguntaFrecuente: null },
  { id: "valentina-salve", nombre: "Valentina Salve", corto: "Vale", frase: null, preguntaFrecuente: null },
];
// frase: TODO Matías, frase en primera persona de cada profe. Es una cita de una persona real: nunca la inventes.
// preguntaFrecuente: TODO Matías, { pregunta, respuesta } con la duda que más le hacen a cada uno. Tampoco se inventa.

// Grilla semanal. lmv = lunes, miércoles y viernes; mj = martes y jueves.
// Valor = id del profe; null = abierto sin profe asignado. "desde" inclusivo, "hasta" exclusivo.
export const grilla: readonly FranjaGrilla[] = [
  { desde: "07:00", hasta: "09:00", lmv: "cesar-martinazzo", mj: "gino-magnani" },
  { desde: "09:00", hasta: "10:00", lmv: "gino-magnani", mj: "gino-magnani" },
  { desde: "10:00", hasta: "12:00", lmv: "valentina-salve", mj: "gino-magnani" },
  { desde: "12:00", hasta: "13:00", cerrado: true },
  { desde: "13:00", hasta: "15:00", lmv: "cesar-martinazzo", mj: "cesar-martinazzo" },
  { desde: "15:00", hasta: "16:00", lmv: "cesar-martinazzo", mj: "matias-salve" },
  { desde: "16:00", hasta: "17:00", lmv: null, mj: "matias-salve" },
  { desde: "17:00", hasta: "21:00", lmv: "matias-salve", mj: "valentina-salve" },
];
// Sábados y domingos: cerrado. En todo el horario de apertura hay acceso libre a las dos plantas.

/** Columna de la grilla que usa cada día (0 = domingo … 6 = sábado). null = cerrado todo el día. */
export const columnaPorDia: Readonly<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, ColumnaGrilla | null>> = {
  0: null,
  1: "lmv",
  2: "mj",
  3: "lmv",
  4: "mj",
  5: "lmv",
  6: null,
};

// TODO Matías: franjas con menos gente. El formato final se define cuando llegue el dato;
// mientras sea null, la sección "Horas más tranquilas" de /horarios no se renderiza.
export const horasTranquilas: string | null = null;

export const plantas: readonly Planta[] = [
  {
    id: "planta-baja",
    nombre: "Planta baja",
    foco: "Funcional y peso libre",
    destacados: ["Racks regulables", "TRX", "Mancuernas y pesas rusas", "Banco multiarticular", "Cintas para correr"],
    // Brief "Qué entrenás acá": fuerza, funcional y peso libre.
  },
  {
    id: "planta-alta",
    nombre: "Planta alta",
    foco: "Musculación",
    destacados: ["Prensa 45°", "Hack", "Hip thrust", "Poleas dorsaleras", "Máquina Smith"],
    // Brief "Qué entrenás acá": musculación por grupo muscular.
  },
];

export const objetivos: readonly Objetivo[] = [
  {
    id: "adultos",
    nombre: "Adultos",
    // BORRADOR: validar con un profe.
    mito: {
      mito: "Si no salís destruido, no entrenaste.",
      respuesta:
        "No hace falta terminar agotado para que el entrenamiento sirva. Lo que da resultados es la constancia y una carga que puedas sostener semana a semana.",
    },
    whatsapp: "Hola, quiero empezar a entrenar. ¿Qué plan me conviene?",
  },
  {
    id: "adultos-mayores",
    nombre: "Adultos mayores",
    // BORRADOR: validar con un profe.
    mito: {
      mito: "A mi edad ya no estoy para levantar pesas.",
      respuesta:
        "Al contrario. Con el peso justo para vos, entrenar fuerza ayuda a conservar músculo, equilibrio y autonomía.",
    },
    whatsapp: "Hola, ya tengo mis años y quiero empezar a entrenar. ¿Cómo es para arrancar?",
  },
  {
    id: "rehabilitacion",
    nombre: "Rehabilitación",
    // BORRADOR: validar con un profe.
    mito: {
      mito: "Me lesioné: mejor quedarme quieto hasta que no me duela nada.",
      respuesta:
        "El reposo total por mucho tiempo suele hacer perder fuerza y movilidad. En general se recomienda volver a moverse de a poco, con ejercicios adaptados y respetando las indicaciones de tu médico.",
    },
    whatsapp: "Hola, vengo de una lesión y quiero empezar a entrenar. ¿Cómo sería?",
  },
  {
    id: "principiantes",
    nombre: "Principiantes",
    // BORRADOR: validar con un profe.
    mito: {
      mito: "Primero me pongo en forma y después voy al gimnasio.",
      respuesta:
        "Venís al gimnasio justamente para ponerte en forma, y arrancás desde donde estás hoy.",
    },
    whatsapp: "Hola, nunca fui a un gimnasio y quiero arrancar. ¿Por dónde empiezo?",
  },
  {
    id: "deportistas",
    nombre: "Deportistas",
    // BORRADOR: validar con un profe.
    mito: {
      mito: "Si hacés pesas, te ponés lento para el deporte.",
      respuesta:
        "Bien planificadas, las pesas se usan en casi todos los deportes para ganar potencia y ayudar a prevenir lesiones.",
    },
    whatsapp: "Hola, hago deporte y quiero sumar gimnasio. ¿Cómo lo combino con mis entrenamientos?",
  },
];
// Brief "Tu primer mes": qué te preguntan el primer día, cómo arranca la planilla y cómo avanza, en términos
// generales y coherentes con la planilla individual y el seguimiento, sin inventar procedimientos concretos.
// Brief deportistas: ya entrenan alumnos de clubes locales.

export const comoFunciona: readonly string[] = [
  "Nos escribís por WhatsApp y nos contás qué buscás.",
  "Los profes te arman una planilla para tu nivel y lo que querés lograr.",
  "Empezás a entrenar y los profes la van ajustando según cómo te va.",
];
export const queLlevar: readonly string[] = ["Ropa cómoda", "Zapatillas", "Botella de agua", "Toalla"];
// TODO Matías: confirmar si el gimnasio pide algo más (toalla obligatoria, candado, etc.).

// Podés pulir la redacción con <guia_de_textos> sin cambiar el dato.
// Las respuestas { interpolar } se arman en lib/faq.ts con los datos de este archivo.
export const preguntas: readonly Pregunta[] = [
  { pregunta: "Nunca entrené y no sé usar las máquinas, ¿puedo ir igual?",
    respuesta: "Sí. Los profes te muestran cómo se hace cada ejercicio y te van guiando mientras entrenás." },
  // Brief: podés venir todos los días de lunes a viernes (clasesPorMes) + precio del pase libre.
  { pregunta: "¿Qué es el pase libre?", respuesta: { interpolar: "paseLibre" } },
  { pregunta: "¿Hay clases grupales?",
    respuesta: "No. Cada uno entrena con su propia planilla." },
  // Brief: descuentoFamiliar.porcentaje + descuentoFamiliar.familiares.
  { pregunta: "¿Hay descuento si voy con alguien de mi familia?", respuesta: { interpolar: "descuentoFamiliar" } },
  // Brief: edadMinima.
  { pregunta: "¿Desde qué edad se puede entrenar?", respuesta: { interpolar: "edadMinima" } },
  // Brief: precio de claseSuelta.
  { pregunta: "¿Puedo ir un día a probar antes de pagar el mes?", respuesta: { interpolar: "claseSuelta" } },
  // Brief: mediosDePago.
  { pregunta: "¿Cómo puedo pagar?", respuesta: { interpolar: "mediosDePago" } },
];
