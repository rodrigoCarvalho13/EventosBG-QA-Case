import React from "react";
import { LogoMark } from "@/components/Logo";

// Carregando: a marca do site flutuando dentro de um anel dourado que gira.
// `fullscreen` cobre a tela toda (troca de página); sem ele, ocupa só o espaço do conteúdo.
export default function LogoSpinner({ label = "Carregando…", fullscreen = false, className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullscreen ? "fixed inset-0 z-50 bg-background" : "py-16"
      } ${className}`}
    >
      <div className="relative w-24 h-24">
        <span className="absolute inset-3 rounded-full bg-accent/25 animate-ping [animation-duration:1.8s]" aria-hidden="true" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-spin [animation-duration:1.1s]" aria-hidden="true">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="4" className="stroke-muted" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="95 190"
            className="stroke-accent"
          />
        </svg>
        <LogoMark className="absolute inset-0 m-auto w-14 h-14 drop-shadow-md animate-logo-float" />
      </div>
      <p className="text-sm font-600 text-muted-foreground">{label}</p>
    </div>
  );
}
