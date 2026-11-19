import React from "react";
import { useEstado } from "@/lib/regiao";

// Marca: um pin de mapa (onde jogar) com um meeple dentro (jogos de tabuleiro),
// apoiado sobre as cúpulas do Congresso Nacional (Brasília).
export function LogoMark({ className = "w-10 h-10", title }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="48" height="48" rx="12" fill="hsl(152 36% 18%)" />
      {/* Cúpula do Senado (à esquerda) e cuia da Câmara (à direita) */}
      <path d="M7 40.5a5.5 4 0 0 1 11 0Z" fill="hsl(41 58% 48%)" opacity=".55" />
      <path d="M30 37h11a5.5 4 0 0 1-11 0Z" fill="hsl(41 58% 48%)" opacity=".55" />
      <rect x="6" y="40.5" width="36" height="1.6" rx=".8" fill="hsl(41 58% 48%)" opacity=".55" />
      {/* Pin */}
      <path
        d="M24 41.5S12 30.6 12 20.5a12 12 0 0 1 24 0C36 30.6 24 41.5 24 41.5Z"
        fill="hsl(41 58% 48%)"
      />
      {/* Meeple */}
      <g fill="hsl(152 36% 18%)">
        <circle cx="24" cy="14.6" r="3.1" />
        <path d="M19.6 18.6c2.9-1 5.9-1 8.8 0l3 1.7c.9.5.6 1.9-.4 1.9h-2.9l2.2 5.6c.2.5-.2 1-.7 1h-2.8L24 25.6l-2.8 3.2h-2.8c-.5 0-.9-.5-.7-1l2.2-5.6H17c-1 0-1.3-1.4-.4-1.9Z" />
      </g>
    </svg>
  );
}

export default function Logo({ className = "", markClassName = "w-10 h-10", inverted = false }) {
  const { info } = useEstado();
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="flex flex-col leading-none min-w-0">
        <span
          className={`font-display text-[1rem] sm:text-[1.25rem] tracking-tight ${
            inverted ? "text-white" : "text-foreground"
          }`}
        >
          <span className="font-500">eventos</span>
          <span className="font-900">BG</span>
        </span>
        <span
          className={`mt-1 truncate text-xs font-700 uppercase tracking-[0.08em] sm:tracking-[0.24em] ${
            inverted ? "text-accent" : "text-accent-ink"
          }`}
        >
          {info.rotulo}
        </span>
      </span>
    </span>
  );
}