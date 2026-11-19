import React from "react";

// Silhueta do Congresso Nacional: cúpula do Senado, torres gêmeas e cuia da Câmara.
export default function BrasiliaSkyline({ className = "" }) {
  return (
    <svg
      viewBox="0 0 480 120"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      {/* Torres gêmeas */}
      <rect x="226" y="14" width="11" height="80" />
      <rect x="243" y="14" width="11" height="80" />
      <path d="M237 40h6M237 44h6" />
      {/* Plataforma */}
      <path d="M96 94h288" />
      <path d="M108 94v8h264v-8" />
      {/* Senado (cúpula) */}
      <path d="M140 94a30 22 0 0 1 60 0" />
      {/* Câmara (cuia) */}
      <path d="M276 76h76a38 18 0 0 1-76 0Z" />
      {/* Chão */}
      <path d="M0 110h480" opacity=".5" />
    </svg>
  );
}
