// Corre en el navegador: reduce la foto antes de subirla, así entra en los 4,5 MB que Vercel deja pasar por pedido
// (una foto de celular pesa 3 a 8 MB). Endereza según EXIF, lado largo de 1600 px como máximo, WebP calidad 0,82, a color.
// El servidor la vuelve a procesar con sharp (src/lib/panel-foto.ts); esto solo cuida el peso del viaje.

const LADO_MAXIMO = 1600;
const CALIDADES = [0.82, 0.7, 0.55];
/** Si ni con la calidad más baja baja de acá, se avisa en vez de mandarla. */
const MAX_BYTES = 3.5 * 1024 * 1024;

type Dibujable = { source: CanvasImageSource; ancho: number; alto: number; liberar: () => void };

async function decodificar(archivo: File): Promise<Dibujable> {
  try {
    // "from-image": aplica la orientación EXIF (una foto de celular parada se ve parada).
    const bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    return { source: bitmap, ancho: bitmap.width, alto: bitmap.height, liberar: () => bitmap.close() };
  } catch {
    // Navegadores sin createImageBitmap con opciones: un <img> también respeta la orientación EXIF.
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, ancho: img.naturalWidth, alto: img.naturalHeight, liberar: () => URL.revokeObjectURL(url) };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }
}

const aBlob = (canvas: HTMLCanvasElement, tipo: string, calidad: number) =>
  new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, tipo, calidad));

export async function reducirFoto(archivo: File): Promise<Blob> {
  const dibujable = await decodificar(archivo);
  try {
    if (!dibujable.ancho || !dibujable.alto) throw new Error("sin tamaño");
    const escala = Math.min(1, LADO_MAXIMO / Math.max(dibujable.ancho, dibujable.alto));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(dibujable.ancho * escala));
    canvas.height = Math.max(1, Math.round(dibujable.alto * escala));
    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("sin canvas");
    contexto.drawImage(dibujable.source, 0, 0, canvas.width, canvas.height);

    let ultimo: Blob | null = null;
    for (const calidad of CALIDADES) {
      let blob = await aBlob(canvas, "image/webp", calidad);
      // Safari viejo no sabe WebP y devuelve PNG (pesado): se pasa a JPEG.
      if (!blob || blob.type !== "image/webp") blob = await aBlob(canvas, "image/jpeg", Math.min(calidad + 0.05, 0.9));
      if (!blob) throw new Error("no se pudo codificar");
      ultimo = blob;
      if (blob.size <= MAX_BYTES) return blob;
    }
    throw new Error(`pesa demasiado (${ultimo?.size ?? 0} bytes)`);
  } finally {
    dibujable.liberar();
  }
}
