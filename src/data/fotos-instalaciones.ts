/**
 * Fotos reales de /instalaciones, ordenadas por planta (los ids son los de `plantas` en site.ts).
 * Los archivos viven en public/fotos/<id de la planta>/<archivo>.jpg y la descripción sale como alt de la foto.
 * Un destacado sin foto acá sigue mostrando su lugar reservado. El comentario de cada línea es el nombre de origen (IMG_xxxx.HEIC).
 */
export type FotoInstalacion = {
  /** Nombre del archivo dentro de public/fotos/<planta>/, sin extensión. */
  archivo: string;
  /** Qué se ve en la foto. */
  descripcion: string;
};

export type FotosInstalacionesDePlanta = {
  /** La foto de cada destacado de la planta, por nombre del destacado (tal cual está en site.ts). */
  equipamiento: Readonly<Record<string, FotoInstalacion>>;
  /** Las fotos de la fila deslizable, en orden: primero vistas generales, después máquinas por grupo muscular. */
  galeria: readonly FotoInstalacion[];
};

export const fotosInstalaciones: Readonly<Record<string, FotosInstalacionesDePlanta>> = {
  "planta-baja": {
    // El banco multiarticular todavía no tiene foto propia: solo aparece en las vistas generales.
    equipamiento: {
      "Racks regulables": {
        archivo: "racks-con-discos-y-banco", // IMG_5830
        descripcion:
          "Fila de racks de potencia con discos guardados a los costados, una barra montada y un banco regulable en el rack más cercano.",
      },
      TRX: {
        archivo: "trx-en-la-pared", // IMG_5832
        descripcion: "Correas de TRX colgadas de un caño en la pared, con un banco de apoyo al lado.",
      },
      "Mancuernas y pesas rusas": {
        archivo: "mancuernas-y-pesas-rusas", // IMG_5820
        descripcion:
          "Hilera de mancuernas en su soporte, pesas rusas y bolsas de arena en un rack vertical, con un banco regulable en primer plano.",
      },
      "Cintas para correr": {
        archivo: "cintas-curvas-sin-motor", // IMG_5826
        descripcion:
          "Dos cintas curvas sin motor frente al ventanal, con una bicicleta fija a la izquierda y pelotas medicinales a la derecha.",
      },
    },
    galeria: [
      {
        archivo: "vista-general-desde-recepcion", // IMG_3309
        descripcion:
          "Planta baja desde el mostrador de recepción: bicicleta de spinning y cintas a la izquierda, mancuernas y pelotas contra la pared, TRX colgados al fondo y la escalera a la planta alta.",
      },
      {
        archivo: "vista-general-mancuernas-y-cintas", // IMG_3310
        descripcion:
          "Planta baja con piso de goma: hilera de mancuernas a la izquierda, cintas para correr a la derecha, racks con discos al fondo y el mostrador de recepción.",
      },
      {
        archivo: "vista-desde-la-escalera", // IMG_3311
        descripcion:
          "Planta baja vista desde la escalera: racks con banco, cintas para correr cerca de la entrada y el mostrador de recepción.",
      },
      {
        archivo: "vista-desde-arriba-cajones-y-pelotas", // IMG_3312
        descripcion:
          "Planta baja vista desde arriba: piso de goma con cajones de madera, pelotas amarillas y discos, racks a la izquierda y la escalera al fondo.",
      },
      {
        archivo: "bolsas-de-arena-y-wall-balls", // IMG_5829
        descripcion:
          "Rack vertical con bolsas de arena de 5 a 25 kg, bandas colgadas de la pared, steps, wall balls y pesas rusas.",
      },
      {
        archivo: "cajones-pliometricos-y-pelotas", // IMG_5831
        descripcion: "Cajones de madera para saltar, pelotas de pilates y una escalera metálica, con un rack al fondo.",
      },
    ],
  },
  "planta-alta": {
    equipamiento: {
      "Prensa 45°": {
        archivo: "prensa-45", // IMG_3324
        descripcion: "Prensa 45° de la planta alta: carro inclinado con plataforma de chapa para los pies y asiento acolchado.",
      },
      Hack: {
        archivo: "hack", // IMG_3323
        descripcion:
          "Hack de la planta alta: carro inclinado con respaldo y hombreras acolchadas, y otra máquina de piernas atrás.",
      },
      "Hip thrust": {
        archivo: "hip-thrust", // IMG_3318
        descripcion:
          "Máquina de hip thrust: respaldo acolchado inclinado, rodillo para apoyar sobre la cadera y plataforma para los pies.",
      },
      "Poleas dorsaleras": {
        archivo: "polea-dorsalera-con-barra", // IMG_3328
        descripcion:
          "Polea dorsalera con barra para jalón, asiento con apoyo para las piernas y pila de placas; al fondo, más poleas.",
      },
      "Máquina Smith": {
        archivo: "maquina-smith", // IMG_3319
        descripcion:
          "Máquina Smith con la barra guiada entre dos columnas azules, con un protector naranja en la barra.",
      },
    },
    galeria: [
      {
        archivo: "vista-general-hack-y-spinning", // IMG_3313
        descripcion:
          "Planta alta con piso de granito y techo bajo: un hack con discos y una bicicleta de spinning en primer plano, y las máquinas al fondo.",
      },
      {
        archivo: "vista-general-poleas-y-bancos", // IMG_3314
        descripcion: "Planta alta: una columna de poleas en primer plano, y bancos y máquinas de musculación hacia el fondo.",
      },
      {
        archivo: "vista-general-bancos-de-press", // IMG_3315
        descripcion:
          "Planta alta: banco de press plano con barra en el centro y una máquina de polea con asiento en primer plano.",
      },
      {
        archivo: "vista-general-bancos-y-maquinas", // IMG_3316
        descripcion:
          "Planta alta: un banco con almohadillas rojas y naranjas en primer plano, bancos con soportes y más máquinas al fondo.",
      },
      {
        archivo: "bicicleta-de-spinning-y-trx", // IMG_3325
        descripcion: "Bicicleta de spinning frente a la pared, con TRX colgados detrás y un cajón de madera al costado.",
      },
      {
        archivo: "maquina-de-piernas-con-respaldo-alto", // IMG_3321
        descripcion: "Máquina de piernas sentado con respaldo alto, rodillo largo al frente y pila de placas atrás.",
      },
      {
        archivo: "maquina-de-piernas-con-respaldo-gris", // IMG_3322
        descripcion:
          "Máquina de piernas sentado con respaldo gris regulable y rodillo acolchado abajo; a la izquierda, otra máquina de piernas.",
      },
      {
        archivo: "maquina-de-piernas-con-banco-acolchado", // IMG_3320
        descripcion: "Máquina de piernas con banco acolchado, rodillos al frente y pila de placas detrás.",
      },
      {
        archivo: "maquina-de-cadera-fox", // IMG_3317
        descripcion:
          "Máquina FOX de cadera con asiento naranja, almohadillas rojas y un brazo con rodillos, contra la pared violeta.",
      },
      {
        archivo: "maquina-de-aperturas-mariposa", // IMG_3332
        descripcion: "Máquina de aperturas (mariposa): brazos con almohadillas, respaldo acolchado y pila de placas.",
      },
      {
        archivo: "maquina-de-press-sentado", // IMG_3331
        descripcion: "Máquina de press sentado con respaldo alto, agarres a los costados y pila de placas.",
      },
      {
        archivo: "banco-de-press-inclinado", // IMG_3333
        descripcion: "Banco de press inclinado con la barra olímpica en los soportes, sobre piso de granito.",
      },
      {
        archivo: "banco-de-press-plano-con-discos", // IMG_3334
        descripcion: "Banco de press plano con la barra en los soportes y un árbol con discos al centro; al fondo, más bancos.",
      },
      {
        archivo: "polea-alta-con-asiento", // IMG_3327
        descripcion: "Polea alta con asiento y agarre triangular; atrás, máquinas de piernas y el resto de la sala.",
      },
      {
        archivo: "maquina-de-remo", // IMG_3329
        descripcion: "Máquina sentada con agarres verticales, apoyo acolchado y pila de placas, para trabajar remando.",
      },
      {
        archivo: "remo-en-t-con-apoyo-de-pecho", // IMG_3336
        descripcion:
          "Remo en T con apoyo rojo para el pecho, agarre en T y pernos para los discos; en primer plano, un banco con respaldo vertical.",
      },
      {
        archivo: "banco-scott", // IMG_3335
        descripcion: "Banco Scott (predicador) con apoyo acolchado inclinado para los brazos.",
      },
      {
        archivo: "banco-con-polea-y-apoyapies", // IMG_3330
        descripcion:
          "Banco plano acolchado con apoyapiés de chapa y, a un costado, una columna de poleas con pila de placas.",
      },
    ],
  },
};
