/** Datos estructurados JSON-LD. Escapa "<" para que ningún texto pueda cerrar el <script>. */
export default function JsonLd({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
