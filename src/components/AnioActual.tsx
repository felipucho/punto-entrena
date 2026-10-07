"use client";

import { useSyncExternalStore } from "react";

const sinCambios = () => () => {};
const anioDelBuild = new Date().getFullYear();

/** El año del navegador: el HTML estático trae el del build y se corrige al hidratar, sin desajuste. */
export default function AnioActual() {
  return useSyncExternalStore(
    sinCambios,
    () => new Date().getFullYear(),
    () => anioDelBuild,
  );
}
