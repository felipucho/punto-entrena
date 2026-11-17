import VistaPrevia from "./VistaPrevia";

/** Solo la abre el iframe del panel. Sin datos propios: los recibe por postMessage. Estática. */
export default function Pagina() {
  return <VistaPrevia />;
}
