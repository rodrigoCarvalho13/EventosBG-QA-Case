import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Faixa horizontal que desliza (dedo, trackpad ou setas). Cada filho vira um
// "slide" com largura fixa; no celular mostra um card e um pedaço do próximo.
// Com `inclinar`, os cards ficam levemente tortos (alternando o lado) com sombra
// forte e se endireitam ao passar o mouse.
const INCLINACAO = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2"];

export default function Carrossel({ children, label, itemClassName = "w-[85%] sm:w-[340px]", inclinar = false }) {
  const ref = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);
  const itens = React.Children.toArray(children);

  const atualizar = () => {
    const el = ref.current;
    if (!el) return;
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    atualizar();
    const el = ref.current;
    if (!el) return;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(atualizar) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [itens.length]);

  const mover = (d) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const seta =
    "hidden sm:grid absolute top-1/2 -translate-y-1/2 z-10 place-items-center w-11 h-11 rounded-full bg-card border border-border card-shadow text-foreground hover:border-accent transition disabled:opacity-0 disabled:pointer-events-none";

  return (
    <div className="relative sm:px-12">
      <ul
        ref={ref}
        onScroll={atualizar}
        aria-label={label}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth ${inclinar ? "pt-4 pb-8" : "pb-3"} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {itens.map((filho, i) => (
          <li
            key={filho.key ?? i}
            className={`snap-start shrink-0 ${itemClassName} [&>*]:h-full ${
              inclinar
                ? `${INCLINACAO[i % INCLINACAO.length]} transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 [&>*]:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)]`
                : ""
            }`}
          >
            {filho}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => mover(-1)} disabled={!podeVoltar} className={`${seta} left-0`} aria-label={`Voltar em ${label}`}>
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => mover(1)} disabled={!podeAvancar} className={`${seta} right-0`} aria-label={`Avançar em ${label}`}>
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
