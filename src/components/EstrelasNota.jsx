import React, { useState } from "react";
import { Star } from "lucide-react";

export default function EstrelasNota({ value = 0, onChange = null, size = 18, label = "" }) {
  const [hover, setHover] = useState(0);
  const ativa = hover || value;
  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={label || `Nota ${value} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            style={{ width: size, height: size }}
            className={value >= n ? "fill-accent text-accent-ink" : "text-muted-foreground/70"}
          />
        ))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center" role="radiogroup" aria-label={label || "Sua nota"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
          className="grid place-items-center w-11 h-11 rounded-md hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star
            aria-hidden="true"
            style={{ width: size, height: size }}
            className={ativa >= n ? "fill-accent text-accent-ink" : "text-muted-foreground"}
          />
        </button>
      ))}
    </span>
  );
}

export function NotaResumo({ nota, total, className = "" }) {
  const n = Number(total) || 0;
  if (!n) {
    return <span className={`text-sm text-muted-foreground ${className}`}>Sem avaliações ainda</span>;
  }
  const media = Number(nota) || 0;
  const texto = media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-600 ${className}`} aria-label={`Nota ${texto} de 5, ${n} ${n === 1 ? "avaliação" : "avaliações"}`}>
      <Star className="w-4 h-4 fill-accent text-accent-ink" aria-hidden="true" />
      {texto}
      <span className="font-500 text-muted-foreground">({n})</span>
    </span>
  );
}
