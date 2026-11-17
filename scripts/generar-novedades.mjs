// Antes del build, del dev y de los tests: arma src/data/novedades.generada.json con las novedades de
// content/novedades/ y el tamaño de cada foto. La página /novedades lo importa (queda dentro de la función que la
// regenera en Vercel) y filtra por fecha al renderizar. Está en .gitignore: se regenera siempre.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { armarNovedades } from "../src/lib/novedades-datos.mjs";

const destino = path.join(process.cwd(), "src", "data", "novedades.generada.json");
const novedades = await armarNovedades();
await mkdir(path.dirname(destino), { recursive: true });
await writeFile(destino, `${JSON.stringify(novedades, null, 2)}\n`);
console.log(`[novedades] ${novedades.length} en ${path.relative(process.cwd(), destino)}`);
