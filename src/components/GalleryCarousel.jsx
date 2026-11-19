import React, { useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryCarousel({ images = [], alt = "Foto", onOpen }) {
  const [index, setIndex] = useState(0);
  const toque = useRef(null);
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!list.length) return null;

  if (list.length === 1) {
    return (
      <button type="button" onClick={() => onOpen?.(0)} aria-label={`Ampliar ${alt}`} className="block w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted cursor-zoom-in">
        <Image src={list[0]} alt={alt} fittingType="fit" className="w-full h-full" />
      </button>
    );
  }

  const go = (d) => setIndex((i) => (i + d + list.length) % list.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-muted">
      <button
        type="button"
        className="block w-full aspect-[16/9] cursor-zoom-in"
        aria-label={`Ampliar foto ${index + 1}`}
        onClick={() => onOpen?.(index)}
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          // Deslizar para o lado troca de foto.
          const dx = e.changedTouches[0].clientX - (toque.current ?? e.changedTouches[0].clientX);
          if (Math.abs(dx) > 40) {
            e.preventDefault();
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        <Image
          src={list[index]}
          alt={`${alt} ${index + 1}`}
          fittingType="fit"
          className="w-full h-full"
        />
      </button>

      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors"
        aria-label="Foto anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors"
        aria-label="Próxima foto"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex">
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="grid place-items-center w-8 h-8 group"
            aria-label={`Ir para foto ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50 group-hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>

      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-600 bg-black/55 text-white">
        {index + 1} / {list.length}
      </span>
    </div>
  );
}