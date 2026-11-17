"use client";

import { useEffect, useRef, useState } from "react";
import { TAMANO_FOTO_POR_DEFECTO, TAMANOS_FOTO } from "@/lib/novedades-tamanos.mjs";
import { avisoEnCola, fechaArgentina, instanteDePublicacion } from "@/lib/novedades-fechas";
import { MENSAJE_ALTO, MENSAJE_LISTA, MENSAJE_VALORES, type ValoresVistaPrevia } from "@/lib/vista-previa-novedad";

/*
 * "Así se va a ver": la novedad que se está editando, dibujada como en /novedades. Va debajo del formulario de
 * novedades. Keystatic no tiene un gancho oficial para esto: scripts/traducir-keystatic.mjs parchea FormForEntry para
 * montar este componente (registrado en globalThis por src/app/keystatic/[[...params]]/page.tsx) y pasarle el estado
 * del formulario (`previewProps`), que se actualiza en cada tecla. La vista es un iframe a /vista-previa-novedad, que
 * trae el CSS del sitio; acá se le mandan los valores por postMessage.
 */

type CampoForm<T> = { value: T };
/** Lo único que usamos de los previewProps de Keystatic: los campos de la colección de novedades. */
type PropsNovedad = {
  fields?: {
    titulo?: CampoForm<{ name: string; slug: string }>;
    fecha?: CampoForm<string | null> & { onChange?: (valor: string | null) => void };
    texto?: CampoForm<string>;
    foto?: CampoForm<{ data: Uint8Array; extension: string } | null>;
    tamano?: CampoForm<string>;
  };
};

const TIPOS_FOTO: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Una URL blob: de la foto que está en el formulario (la subida recién o la ya guardada). Se libera al cambiarla. */
function useUrlDeFoto(foto: { data: Uint8Array; extension: string } | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const data = foto?.data;
  const extension = foto?.extension;
  useEffect(() => {
    // Sincroniza con un recurso externo (el blob): el estado solo guarda su URL.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!data) {
      setUrl(null);
      return;
    }
    const nueva = URL.createObjectURL(new Blob([data as BlobPart], { type: TIPOS_FOTO[(extension ?? "").toLowerCase()] ?? "" }));
    setUrl(nueva);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => URL.revokeObjectURL(nueva);
  }, [data, extension]);
  return url;
}

export default function VistaPreviaNovedad({ previewProps }: { previewProps: PropsNovedad }) {
  const campos = previewProps.fields;
  const iframe = useRef<HTMLIFrameElement>(null);
  const [alto, setAlto] = useState(240);
  const fotoSrc = useUrlDeFoto(campos?.foto?.value);

  const fecha = campos?.fecha?.value ?? null;
  const tamano = TAMANOS_FOTO.find((t) => t === campos?.tamano?.value) ?? TAMANO_FOTO_POR_DEFECTO;
  const valores: ValoresVistaPrevia = {
    fecha: fecha !== null && !Number.isNaN(instanteDePublicacion(fecha.slice(0, 16))) ? fecha.slice(0, 16) : null,
    titulo: campos?.titulo?.value.name ?? "",
    texto: campos?.texto?.value ?? "",
    tamano,
    fotoSrc,
  };
  // Los valores como texto: sirve de dependencia del efecto y es lo último que hay que mandar cuando el iframe avisa
  // que ya escucha (carga tarde o se recarga).
  const clave = JSON.stringify(valores);
  const ultima = useRef(clave);

  const enviar = () =>
    iframe.current?.contentWindow?.postMessage({ tipo: MENSAJE_VALORES, valores: JSON.parse(ultima.current) }, location.origin);

  useEffect(() => {
    ultima.current = clave;
    enviar();
  }, [clave]);

  // La hora de publicación puede llegar con el panel abierto: el aviso de "En cola" se refresca solo.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const alRecibir = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== iframe.current?.contentWindow) return;
      if (e.data?.tipo === MENSAJE_LISTA) enviar();
      else if (e.data?.tipo === MENSAJE_ALTO && typeof e.data.alto === "number") setAlto(e.data.alto);
    };
    window.addEventListener("message", alRecibir);
    return () => window.removeEventListener("message", alRecibir);
  }, []);

  const aviso = avisoEnCola(valores.fecha, ahora);

  // "Publicar ahora": pone la fecha en este momento y guarda. Se guarda recién cuando el formulario ya tiene la fecha
  // nueva (el próximo render), si no Keystatic guardaría la fecha vieja.
  const seccion = useRef<HTMLElement>(null);
  const publicando = useRef(false);
  useEffect(() => {
    if (publicando.current && aviso === null) {
      publicando.current = false;
      seccion.current?.closest("form")?.requestSubmit();
    }
  }, [aviso]);
  const publicarAhora = () => {
    publicando.current = true;
    campos?.fecha?.onChange?.(fechaArgentina(Date.now()));
  };

  // Solo en el formulario de novedades: Keystatic usa el mismo formulario para los precios.
  if (!campos?.tamano || !campos.texto) return null;

  return (
    <section ref={seccion} className="punto-vista-previa" aria-labelledby="punto-vista-previa-titulo">
      <h2 id="punto-vista-previa-titulo">Así se va a ver</h2>
      <p>
        Es una simulación de la página de novedades: cambia sola mientras escribís, elegís el tamaño o cargás la foto.
        {aviso !== null && <strong> {aviso}</strong>}
      </p>
      {aviso !== null && campos.fecha?.onChange && (
        <button type="button" onClick={publicarAhora}>
          Publicar ahora
        </button>
      )}
      <iframe ref={iframe} src="/vista-previa-novedad" title="Vista previa de la novedad" style={{ height: alto }} />
    </section>
  );
}
