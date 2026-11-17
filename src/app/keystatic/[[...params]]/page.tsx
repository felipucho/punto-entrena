"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../../keystatic.config";
import VistaPreviaNovedad from "../VistaPreviaNovedad";

// scripts/traducir-keystatic.mjs hace que el formulario de Keystatic monte este componente debajo de los campos.
(globalThis as { __puntoVistaPrevia?: typeof VistaPreviaNovedad }).__puntoVistaPrevia = VistaPreviaNovedad;

export default makePage(config);
