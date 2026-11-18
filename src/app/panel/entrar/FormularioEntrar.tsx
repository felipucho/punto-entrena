"use client";

import { useActionState, useState } from "react";
import { entrar } from "../acciones";
import { IconoAlerta, IconoOjo, IconoOjoTachado } from "../iconos";

export default function FormularioEntrar() {
  const [estado, accion, pendiente] = useActionState(entrar, null);
  const [ver, setVer] = useState(false);

  return (
    <form action={accion} className="grid gap-5">
      <div className="panel-campo">
        <label htmlFor="usuario" className="panel-etiqueta">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          autoFocus
          maxLength={64}
          defaultValue={estado?.usuario}
          className="panel-input"
          aria-invalid={estado ? true : undefined}
          aria-describedby={estado ? "clave-error" : undefined}
        />
      </div>
      <div className="panel-campo">
        <label htmlFor="clave" className="panel-etiqueta">
          Contraseña
        </label>
        <div className="panel-clave">
          <input
            id="clave"
            name="clave"
            type={ver ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            className="panel-input"
            aria-invalid={estado ? true : undefined}
            aria-describedby={estado ? "clave-error" : undefined}
          />
          <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Ocultar la contraseña" : "Mostrar la contraseña"} aria-pressed={ver}>
            {ver ? <IconoOjoTachado /> : <IconoOjo />}
          </button>
        </div>
      </div>
      {estado && (
        <p id="clave-error" className="panel-mensaje" data-tipo="error" role="alert">
          <IconoAlerta />
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={pendiente} aria-busy={pendiente} className="btn btn-primario">
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
