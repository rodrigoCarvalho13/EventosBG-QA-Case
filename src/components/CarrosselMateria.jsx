import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import "./editorMateria.css";

export default function CarrosselMateria({ fotos = [], titulo = "matéria", onAmpliar, ampliarRef }) {
  const capaInicial = Math.max(0, fotos.findIndex((foto) => foto?.capa));
  const [index, setIndex] = useState(capaInicial);
  const [direcao, setDirecao] = useState(1);
  const toque = useRef(null);
  const total = fotos.length;
  const atual = Math.min(index, Math.max(0, total - 1));
  const foto = fotos[atual];
  const reduzir = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const proxima = fotos[(atual + 1) % total];
    if (!proxima?.url) return;
    const img = new Image();
    img.src = proxima.url;
  }, [atual, fotos, total]);

  if (!foto) return null;

  const ir = (proximo, sentido) => {
    setDirecao(sentido);
    setIndex((proximo + total) % total);
  };

  const aoTeclado = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      ir(atual + 1, 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      ir(atual - 1, -1);
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  const legenda = foto.legenda || `${titulo}, foto ${atual + 1}`;

  return (
    <div
      className="carrossel-materia"
      role="region"
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${titulo}`}
      tabIndex={0}
      onKeyDown={aoTeclado}
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-zinc-950"
        onTouchStart={(event) => { toque.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => {
          if (toque.current == null) return;
          const dx = event.changedTouches[0].clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        }}
      >
        <img
          src={foto.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
        />
        <img
          key={`${foto.url}-${atual}`}
          {...imagemOtimizada(foto.url, { width: 1400, height: 788 })}
          alt={legenda}
          className={`carrossel-materia-foto absolute inset-0 m-auto h-full w-full object-contain ${reduzir ? "" : direcao < 0 ? "entra-esq" : "entra-dir"}`}
          decoding="async"
        />
        <p className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-sm font-700 text-white" aria-live="polite">
          {atual + 1} / {total}
        </p>
        <button
          type="button"
          ref={ampliarRef}
          onClick={() => onAmpliar?.(atual)}
          className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/65 px-3 text-sm font-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" /> Tela cheia
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={() => ir(atual - 1, -1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => ir(atual + 1, 1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {foto.legenda && <p className="mt-3 text-sm text-muted-foreground">{foto.legenda}</p>}
      {total > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas">
          {fotos.map((item, indice) => (
            <li key={`${item.url}-${indice}`} className="shrink-0">
              <button
                type="button"
                onClick={() => ir(indice, indice > atual ? 1 : -1)}
                aria-current={indice === atual ? "true" : undefined}
                aria-label={item.legenda ? `Mostrar ${item.legenda}` : `Mostrar foto ${indice + 1}`}
                className={`relative block h-16 w-20 overflow-hidden rounded-lg border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${indice === atual ? "border-accent" : "border-transparent"}`}
              >
                <img {...imagemOtimizada(item.url, { width: 160, height: 128, crop: true })} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
