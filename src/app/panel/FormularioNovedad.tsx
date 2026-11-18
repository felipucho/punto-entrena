"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ArticuloNovedad from "@/components/ArticuloNovedad";
import { MAX_TEXTO, MAX_TITULO } from "@/lib/panel-contenido";
import { avisoEnCola, fechaArgentina, formatearFecha, instanteDePublicacion } from "@/lib/novedades-fechas";
import { TAMANOS_FOTO } from "@/lib/novedades-tamanos.mjs";
import type { TamanoFoto } from "@/lib/novedades-tamanos.mjs";
import { borrarNovedadAccion, guardarNovedadAccion, type Respuesta } from "./acciones";
import CuandoSePublica, { type ModoPublicacion } from "./CuandoSePublica";
import Estado from "./Estado";
import { IconoAlerta, IconoBasura, IconoFoto, IconoTilde, IconoVolver } from "./iconos";
import { reducirFoto } from "./reducir-foto";

export type NovedadInicial = {
  /** null si es una novedad nueva. */
  slug: string | null;
  titulo: string;
  fecha: string;
  texto: string;
  tamano: TamanoFoto;
  /** Ruta pública de la foto ya guardada, o null. */
  foto: string | null;
};

const ETIQUETA_TAMANO: Record<TamanoFoto, string> = { chica: "Chica", mediana: "Mediana", grande: "Grande" };
/** Cuánto se llena la barrita de cada opción: la parte de la columna que ocupa la foto en escritorio. */
const ANCHO_MUESTRA: Record<TamanoFoto, string> = { chica: "33%", mediana: "66%", grande: "100%" };

export default function FormularioNovedad({ inicial }: { inicial: NovedadInicial }) {
  const router = useRouter();
  const [slug, setSlug] = useState(inicial.slug);
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [fecha, setFecha] = useState(inicial.fecha);
  const [texto, setTexto] = useState(inicial.texto);
  const [tamano, setTamano] = useState<TamanoFoto>(inicial.tamano);
  // Una novedad ya publicada que se corrige conserva su fecha; una en cola se sigue programando; una nueva sale ahora.
  const [publicadaEl, setPublicadaEl] = useState<string | null>(() =>
    inicial.slug && instanteDePublicacion(inicial.fecha) <= Date.now() ? inicial.fecha : null,
  );
  const [modo, setModo] = useState<ModoPublicacion>(() => (!inicial.slug ? "ahora" : publicadaEl ? "mantener" : "programar"));

  // La foto: `fotoVista` es lo que se dibuja; `fotoNueva` es lo que todavía no se subió; `fotoGuardada` dice si el repo ya tiene una.
  const [fotoVista, setFotoVista] = useState<string | null>(inicial.foto);
  const [fotoNueva, setFotoNueva] = useState<Blob | null>(null);
  const [fotoGuardada, setFotoGuardada] = useState(inicial.foto !== null);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const urlBlob = useRef<string | null>(null);

  const [ocupado, setOcupado] = useState(false);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => () => {
    if (urlBlob.current) URL.revokeObjectURL(urlBlob.current);
  }, []);

  const fechaValida = !Number.isNaN(instanteDePublicacion(fecha));
  const aviso = fechaValida ? avisoEnCola(fecha, ahora) : null;

  const [arrastrando, setArrastrando] = useState(false);

  function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (archivo) void cargarFoto(archivo);
  }

  async function cargarFoto(archivo: File) {
    if (archivo.type !== "" && !archivo.type.startsWith("image/")) {
      setErrorFoto("Eso no es una foto. Probá con un JPG, PNG o WebP.");
      return;
    }
    setErrorFoto(null);
    setProcesandoFoto(true);
    try {
      const blob = await reducirFoto(archivo);
      if (urlBlob.current) URL.revokeObjectURL(urlBlob.current);
      urlBlob.current = URL.createObjectURL(blob);
      setFotoNueva(blob);
      setFotoVista(urlBlob.current);
    } catch {
      setErrorFoto("No pudimos leer esa foto. Probá con otra (mejor JPG, PNG o WebP).");
    } finally {
      setProcesandoFoto(false);
    }
  }

  function sacarFoto() {
    setFotoNueva(null);
    setFotoVista(null);
    setErrorFoto(null);
  }

  function cambiarModo(nuevo: ModoPublicacion) {
    // Volver a "dejarla como está" recupera la fecha original aunque se haya tocado el selector.
    if (nuevo === "mantener" && publicadaEl) setFecha(publicadaEl);
    setModo(nuevo);
  }

  async function guardar() {
    const publicarAhora = modo === "ahora";
    const datos = new FormData();
    if (slug) datos.set("slug", slug);
    datos.set("titulo", titulo);
    datos.set("fecha", fecha);
    datos.set("texto", texto);
    datos.set("tamano", tamano);
    if (publicarAhora) datos.set("publicarAhora", "1");
    if (fotoNueva) datos.set("foto", new File([fotoNueva], "foto.webp", { type: fotoNueva.type }));
    else if (fotoVista === null && fotoGuardada) datos.set("quitarFoto", "1");

    setOcupado(true);
    setRespuesta(null);
    try {
      const r = await guardarNovedadAccion(datos);
      setRespuesta(r);
      if (r.ok) {
        // Ya salió (ahora, o programada para una hora que pasó): de acá en adelante se corrige sin moverle la fecha.
        const salio = publicarAhora ? fechaArgentina(Date.now()) : instanteDePublicacion(fecha) <= Date.now() ? fecha : null;
        if (salio) {
          setFecha(salio);
          setPublicadaEl(salio);
          setModo("mantener");
        }
        setFotoNueva(null);
        setFotoGuardada(r.foto !== null && r.foto !== undefined);
        if (r.slug && r.slug !== slug) {
          // Era nueva: de acá en adelante se edita. La URL pasa a la de edición sin recargar.
          setSlug(r.slug);
          window.history.replaceState(null, "", `/panel/novedad/${r.slug}`);
        }
      }
    } catch {
      setRespuesta({ ok: false, error: "No se pudo guardar. Revisá la conexión y probá de nuevo." });
    } finally {
      setOcupado(false);
    }
  }

  async function borrar() {
    if (!slug) return;
    if (!window.confirm(`¿Borrar "${titulo || "esta novedad"}"? Se puede deshacer desde Últimos cambios.`)) return;
    setOcupado(true);
    setRespuesta(null);
    try {
      const r = await borrarNovedadAccion(slug);
      if (r.ok) router.push("/panel");
      else setRespuesta(r);
    } catch {
      setRespuesta({ ok: false, error: "No se pudo borrar. Revisá la conexión y probá de nuevo." });
    } finally {
      setOcupado(false);
    }
  }


  const etiquetaFecha = fechaValida ? `${formatearFecha(fecha)}, ${fecha.slice(11, 16)} h` : null;
  const hayContenido = titulo.trim() !== "" || texto.trim() !== "" || fotoVista !== null;

  return (
    <div className="panel-pagina">
      <div className="panel-editor">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          <Link href="/panel" className="panel-enlace panel-volver">
            <IconoVolver />
            Volver al panel
          </Link>
          <header className="mb-10">
            <h1>{slug ? "Editar novedad" : "Nueva novedad"}</h1>
            {slug && etiquetaFecha && (
              <p className="panel-bajada flex flex-wrap items-center gap-3">
                <Estado fecha={fecha} ahora={ahora} />
                {etiquetaFecha}
              </p>
            )}
          </header>

          <div className="panel-campos">
            <div className="panel-campo">
              <label htmlFor="titulo" className="panel-etiqueta">
                Título
                <small aria-hidden="true">
                  {titulo.length}/{MAX_TITULO}
                </small>
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={MAX_TITULO}
                required
                placeholder="Feriado del lunes"
                className="panel-input"
                data-grande
                aria-describedby="titulo-ayuda"
              />
              <p id="titulo-ayuda" className="panel-ayuda">
                Lo primero que se lee. Mejor cortito.
              </p>
            </div>

            <div className="panel-campo">
              <label htmlFor="texto" className="panel-etiqueta">
                Texto
                <small aria-hidden="true">
                  {texto.length}/{MAX_TEXTO}
                </small>
              </label>
              <textarea
                id="texto"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={MAX_TEXTO}
                required
                placeholder="El lunes 24 no abrimos por el feriado. El martes volvemos con el horario de siempre."
                className="panel-input"
                aria-describedby="texto-ayuda"
              />
              <p id="texto-ayuda" className="panel-ayuda">
                Para empezar otro párrafo, dejá una línea vacía.
              </p>
            </div>

            <div className="panel-campo">
              <span className="panel-etiqueta" id="foto-etiqueta">
                Foto <small>opcional</small>
              </span>
              {fotoVista ? (
                <div className="panel-foto">
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel, puede ser un blob: */}
                  <img src={fotoVista} alt="" />
                  <div className="grid gap-3">
                    <p className="panel-ayuda">{fotoNueva ? "Foto nueva, lista para guardar." : "La foto que está guardada."}</p>
                    <div className="panel-foto-acciones">
                      <label className="panel-boton">
                        <input type="file" accept="image/*" onChange={alElegir} aria-labelledby="foto-etiqueta" />
                        <IconoFoto />
                        Cambiar
                      </label>
                      <button type="button" onClick={sacarFoto} className="panel-boton" data-tono="peligro">
                        <IconoBasura />
                        Sacar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  className="panel-soltar"
                  data-arrastrando={arrastrando || undefined}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                  }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    const archivo = e.dataTransfer.files[0];
                    if (archivo) void cargarFoto(archivo);
                  }}
                >
                  <input type="file" accept="image/*" onChange={alElegir} aria-labelledby="foto-etiqueta" aria-describedby="foto-ayuda" />
                  <IconoFoto />
                  <strong>{procesandoFoto ? "Preparando la foto…" : "Elegí una foto"}</strong>
                  <span id="foto-ayuda" className="text-sm">
                    Cualquiera del celular: se achica sola.
                  </span>
                </label>
              )}
              {errorFoto && (
                <p className="panel-mensaje" data-tipo="error" role="alert">
                  <IconoAlerta />
                  {errorFoto}
                </p>
              )}
            </div>

            {fotoVista && (
              <fieldset className="panel-campo border-0 p-0">
                <legend className="panel-etiqueta mb-2">Tamaño de la foto</legend>
                <div className="panel-segmentos">
                  {TAMANOS_FOTO.map((t) => (
                    <label key={t}>
                      <input type="radio" name="tamano" value={t} checked={tamano === t} onChange={() => setTamano(t)} />
                      <i aria-hidden="true" style={{ "--ancho": ANCHO_MUESTRA[t] } as React.CSSProperties} />
                      {ETIQUETA_TAMANO[t]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <CuandoSePublica modo={modo} onModo={cambiarModo} fecha={fecha} onFecha={setFecha} publicadaEl={publicadaEl} ahora={ahora} />
          </div>

          <div className="panel-guardar">
            <p className="panel-mensaje" data-tipo={respuesta ? (respuesta.ok ? "ok" : "error") : undefined} role="status" aria-live="polite">
              {respuesta && (
                <>
                  {respuesta.ok ? <IconoTilde /> : <IconoAlerta />}
                  {respuesta.ok ? respuesta.mensaje : respuesta.error}
                </>
              )}
            </p>
            <div className="panel-guardar-botones">
              {slug && (
                <button type="button" disabled={ocupado} onClick={() => void borrar()} className="panel-boton" data-tono="peligro">
                  <IconoBasura />
                  Borrar
                </button>
              )}
              <button type="submit" disabled={ocupado || procesandoFoto} aria-busy={ocupado} className="btn btn-primario">
                {ocupado ? "Guardando…" : modo === "ahora" ? "Publicar" : modo === "programar" && aviso ? "Programar" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>

        <section className="panel-previa" aria-labelledby="titulo-vista">
          <h2 id="titulo-vista">Así se va a ver</h2>
          <div className="panel-navegador">
            <div className="panel-navegador-barra" aria-hidden="true">
              <span>puntoentrena.com/novedades</span>
            </div>
            <div className="panel-navegador-cuerpo">
              {hayContenido ? (
                <ArticuloNovedad
                  fecha={fechaValida ? fecha : undefined}
                  titulo={titulo}
                  texto={texto}
                  foto={fotoVista ? { src: fotoVista, ancho: 0, alto: 0 } : undefined}
                  tamano={tamano}
                  sinOptimizar
                />
              ) : (
                <p className="panel-navegador-vacio">Escribí el título y el texto: acá aparece la novedad tal como se va a ver.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
