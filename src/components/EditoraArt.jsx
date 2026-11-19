import React from "react";

// Arte das editoras: pilha de caixas de jogo, leque de cartas, dados e um meeple.
// Usa as cores do tema (currentColor = traço; accent = destaques), serve nos dois temas.
export default function EditoraArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Chão */}
      <path d="M10 272h380" opacity=".4" />

      {/* Caixas empilhadas */}
      <g>
        <rect x="70" y="214" width="190" height="58" rx="4" fill="hsl(var(--accent) / .22)" />
        <path d="M70 232h190" />
        <path d="M96 244h70M96 254h40" opacity=".7" />
        <rect x="88" y="160" width="160" height="54" rx="4" fill="hsl(var(--accent) / .38)" />
        <path d="M88 176h160" />
        <circle cx="214" cy="196" r="9" />
        <path d="M110 196h60" opacity=".7" />
        <g transform="rotate(-6 168 110)">
          <rect x="96" y="104" width="144" height="56" rx="4" fill="hsl(var(--accent) / .6)" />
          <path d="M96 120h144" />
          <path d="M116 138l16-14 16 14 16-14 16 14" />
        </g>
      </g>

      {/* Leque de cartas */}
      <g transform="translate(300 232)">
        <g transform="rotate(-24)"><rect x="-26" y="-92" width="52" height="76" rx="6" fill="hsl(var(--background))" /></g>
        <g transform="rotate(-8)"><rect x="-26" y="-92" width="52" height="76" rx="6" fill="hsl(var(--background))" /></g>
        <g transform="rotate(10)">
          <rect x="-26" y="-92" width="52" height="76" rx="6" fill="hsl(var(--accent))" />
          <path d="M0-72l9 14-9 14-9-14z" stroke="hsl(var(--accent-foreground))" />
        </g>
      </g>

      {/* Dados */}
      <g transform="translate(300 262) rotate(-8)">
        <rect x="14" y="-30" width="30" height="30" rx="5" fill="hsl(var(--background))" />
        <circle cx="22" cy="-22" r="2" fill="currentColor" stroke="none" />
        <circle cx="36" cy="-8" r="2" fill="currentColor" stroke="none" />
        <circle cx="29" cy="-15" r="2" fill="currentColor" stroke="none" />
      </g>

      {/* Meeple em cima da pilha */}
      <path
        d="M168 58c-9 0-15 6-15 13 0 5 3 8 7 10-8 3-18 8-18 14 0 4 4 6 9 6h10l-5 12h24l-5-12h10c5 0 9-2 9-6 0-6-10-11-18-14 4-2 7-5 7-10 0-7-6-13-15-13z"
        transform="translate(0 -2)"
        fill="hsl(var(--accent))"
      />

      {/* Brilhos */}
      <path d="M52 70v16M44 78h16M350 60v14M343 67h14" opacity=".7" />
    </svg>
  );
}
