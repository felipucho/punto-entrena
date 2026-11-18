// Bloqueo por intentos fallidos del login. Función pura: recibe los intentos recientes y el reloj, así se prueba sin base.

export const VENTANA_MS = 15 * 60_000;
export const MAX_FALLOS_USUARIO = 5;
export const MAX_FALLOS_IP = 20;

export type Intento = { usuario: string; ip: string; exito: boolean; creado_el: string | number };

export type Bloqueo = { bloqueado: false } | { bloqueado: true; minutos: number };

const instante = (i: Intento) => (typeof i.creado_el === "number" ? i.creado_el : Date.parse(i.creado_el));

/** Si hay `max` fallos o más dentro de la ventana, el instante en que bajan de `max`; si no, null. */
function hastaCuando(fallos: number[], max: number): number | null {
  if (fallos.length < max) return null;
  const orden = [...fallos].sort((a, b) => a - b);
  // Hay que esperar a que venzan los fallos más viejos hasta quedar con max - 1.
  return orden[orden.length - max] + VENTANA_MS;
}

/**
 * Bloqueado si el usuario acumula 5 fallos en 15 minutos desde su último éxito, o si esa IP acumula 20 fallos en 15
 * minutos (con cualquier usuario). `minutos` es lo que falta para el desbloqueo, redondeado para arriba (mínimo 1).
 */
export function calcularBloqueo(intentos: readonly Intento[], usuario: string, ip: string, ahora: number): Bloqueo {
  const desde = ahora - VENTANA_MS;
  const validos = intentos.map((i) => ({ i, t: instante(i) })).filter(({ t }) => Number.isFinite(t) && t > desde && t <= ahora + 60_000);

  const delUsuario = validos.filter(({ i }) => i.usuario === usuario);
  const ultimoExito = delUsuario.filter(({ i }) => i.exito).reduce((max, { t }) => Math.max(max, t), -Infinity);
  const fallosUsuario = delUsuario.filter(({ i, t }) => !i.exito && t > ultimoExito).map(({ t }) => t);
  const fallosIp = validos.filter(({ i }) => !i.exito && i.ip === ip).map(({ t }) => t);

  const hasta = [hastaCuando(fallosUsuario, MAX_FALLOS_USUARIO), hastaCuando(fallosIp, MAX_FALLOS_IP)].filter((h): h is number => h !== null);
  if (hasta.length === 0) return { bloqueado: false };
  return { bloqueado: true, minutos: Math.max(1, Math.ceil((Math.max(...hasta) - ahora) / 60_000)) };
}

export const mensajeBloqueo = (minutos: number) => `Demasiados intentos. Probá de nuevo en ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`;
