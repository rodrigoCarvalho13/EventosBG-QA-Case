import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { imagemOtimizada } from "@/lib/imagemOtimizada";

// Visualizador de fotos em tela cheia: carrossel (setas, deslizar, teclado)
// e zoom (pinça, duplo toque/clique, roda do mouse, botões + e −).
const MAX = 4;

export default function Lightbox({ images = [], index = 0, alt = "Foto", legendas = [], onClose }) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const gesto = useRef(null);
  const ultimoToque = useRef(0);
  const total = images.length;

  const reset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };
  const ir = useCallback(
    (d) => {
      if (total < 2) return;
      setI((v) => (v + d + total) % total);
      reset();
    },
    [total]
  );
  const mudarZoom = (z) => {
    const nz = Math.min(MAX, Math.max(1, z));
    setZoom(nz);
    if (nz === 1) setPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") ir(1);
      else if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [ir, onClose]);

  const distancia = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      gesto.current = { tipo: "pinca", d0: distancia(), z0: zoom };
    } else {
      gesto.current = { tipo: "arrasto", x0: e.clientX, y0: e.clientY, p0: pos, t0: Date.now() };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;
    if (g.tipo === "pinca" && pointers.current.size === 2) {
      mudarZoom((g.z0 * distancia()) / g.d0);
    } else if (g.tipo === "arrasto" && zoom > 1) {
      setPos({ x: g.p0.x + (e.clientX - g.x0), y: g.p0.y + (e.clientY - g.y0) });
    }
  };

  const onPointerUp = (e) => {
    const g = gesto.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    gesto.current = null;
    if (!g || g.tipo !== "arrasto") return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    // Sem zoom, deslizar para o lado troca de foto.
    if (zoom === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      ir(dx < 0 ? 1 : -1);
      return;
    }
    // Toque/clique rápido parado: duplo toque alterna o zoom.
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && Date.now() - g.t0 < 300) {
      const agora = Date.now();
      if (agora - ultimoToque.current < 300) {
        mudarZoom(zoom > 1 ? 1 : 2.5);
        ultimoToque.current = 0;
      } else {
        ultimoToque.current = agora;
      }
    }
  };

  const onWheel = (e) => mudarZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));

  if (!total) return null;

  const botao =
    "grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — foto ${i + 1} de ${total}${legendas[i] ? `: ${legendas[i]}` : ""}`}
      className="fixed inset-0 z-[1000] bg-black flex flex-col select-none"
    >
      <div className="flex items-center justify-between gap-2 p-3 text-white">
        <span className="text-sm font-600 px-2">{total > 1 ? `${i + 1} / ${total}` : ""}</span>
        <div className="flex items-center gap-2">
          <button type="button" className={botao} onClick={() => mudarZoom(zoom / 1.5)} disabled={zoom <= 1} aria-label="Diminuir zoom">
            <ZoomOut className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" className={botao} onClick={() => mudarZoom(zoom * 1.5)} disabled={zoom >= MAX} aria-label="Aumentar zoom">
            <ZoomIn className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" className={botao} onClick={onClose} aria-label="Fechar" autoFocus>
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        data-testid="lightbox-area"
      >
        <img
          key={images[i]}
          src={images[i]}
          alt={`${alt}${legendas[i] ? `: ${legendas[i]}` : total > 1 ? ` ${i + 1}` : ""}`.trim()}
          draggable={false}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transition: gesto.current ? "none" : "transform 0.15s ease-out",
            cursor: zoom > 1 ? "grab" : "zoom-in",
          }}
        />
        {total > 1 && (
          <>
            <button type="button" onClick={() => ir(-1)} onPointerDown={(e) => e.stopPropagation()} className={`${botao} absolute left-3 top-1/2 -translate-y-1/2`} aria-label="Foto anterior">
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => ir(1)} onPointerDown={(e) => e.stopPropagation()} className={`${botao} absolute right-3 top-1/2 -translate-y-1/2`} aria-label="Próxima foto">
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {legendas[i] && (
        <p className="px-4 pt-2 text-center text-sm text-white/90">{legendas[i]}</p>
      )}

      {total > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto p-3">
          {images.map((src, k) => (
            <button
              key={src + k}
              type="button"
              onClick={() => {
                setI(k);
                reset();
              }}
              aria-label={`Ver foto ${k + 1}`}
              aria-current={k === i ? "true" : undefined}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${k === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img {...imagemOtimizada(src, { width: 96, crop: true })} alt={`${alt} ${k + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      <p className="sr-only">Use pinça, duplo toque ou os botões para dar zoom. Deslize para trocar de foto.</p>
    </div>,
    document.body
  );
}
