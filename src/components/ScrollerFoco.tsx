"use client";

import type { ComponentProps } from "react";

/**
 * Un <div> igual a cualquier otro (mismos atributos, mismo markup) para los contenedores que scrollean en
 * horizontal: cuando se enfoca con teclado un descendiente, lo trae a la vista. Chrome solo scrollea hasta el foco
 * si el elemento queda totalmente fuera; uno cortado a la mitad quedaría con el anillo de foco tapado.
 * Con mouse o toque no se mueve nada (:focus-visible): el scroll en plena pulsación haría errar el click.
 */
export default function ScrollerFoco({ onFocusCapture, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      onFocusCapture={(evento) => {
        onFocusCapture?.(evento);
        const foco = evento.target as Element;
        if (foco !== evento.currentTarget && foco.matches(":focus-visible")) {
          foco.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }}
    />
  );
}
