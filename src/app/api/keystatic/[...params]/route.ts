import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

/*
 * Se arma en el primer request y no al importar: con storage "github", makeRouteHandler tira si faltan las
 * variables KEYSTATIC_* y Next importa este módulo durante el build, que tiene que andar sin ellas.
 */
let handler: ReturnType<typeof makeRouteHandler> | undefined;
const obtener = () => (handler ??= makeRouteHandler({ config }));

export const GET = (request: Request) => obtener().GET(request);
export const POST = (request: Request) => obtener().POST(request);
