import React, { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import { cn } from "@/lib/utils";

function primeiraGaleria(evento) {
  if (!Array.isArray(evento?.gallery)) return "";
  return evento.gallery.find((url) => typeof url === "string" && url) || "";
}

export function resolverArte(evento) {
  const titulo = evento?.title?.trim() || "evento";
  if (evento?.photo_url) return { url: evento.photo_url, alt: `Cartaz de ${titulo}`, marca: false };
  const galeria = primeiraGaleria(evento);
  if (galeria) return { url: galeria, alt: `Imagem de ${titulo}`, marca: false };
  if (evento?.loja_photo) {
    const nome = evento.loja_name?.trim() || "espaço";
    return { url: evento.loja_photo, alt: `Foto de ${nome}`, marca: false, daLoja: true };
  }
  return { url: "", alt: `Logo do eventosboardgame.com no lugar do cartaz de ${titulo}`, marca: true };
}

export function comFotoDaLoja(evento, fotos) {
  if (!evento || evento.photo_url || evento.loja_photo || !evento.loja_id || !fotos) return evento;
  const url = fotos instanceof Map ? fotos.get(evento.loja_id) : fotos[evento.loja_id];
  return url ? { ...evento, loja_photo: url } : evento;
}

// `sizes` diz ao navegador quanto da tela o cartaz ocupa; o padrão vale para os cards (até ~210px).
export default function ArteEvento({ evento, className = "", sizes = "210px" }) {
  const arte = resolverArte(evento);
  // Cartaz que não carrega (link quebrado) cai na marca, em vez de deixar uma miniatura cinza vazia.
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [arte.url]);
  const marca = arte.marca || falhou;
  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden", "bg-board", className)}>
      {marca ? (
        <div className="absolute inset-0 grid place-items-center">
          <LogoMark className="w-12 h-12 max-h-[70%] max-w-[70%]" title={arte.alt} />
        </div>
      ) : (
        <>
          {/* Faixa ao redor do cartaz: a própria imagem ampliada, desfocada e clareada,
              para as laterais continuarem as cores das bordas em vez de ficarem brancas.
              Vale nos dois temas; o !bg-transparent anula o fundo branco que o modo escuro põe em <img>. */}
          <img
            src={imagemOtimizada(arte.url, { width: 48, height: 60 }).src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-150 object-cover blur-2xl saturate-100"
          />
          <div className="absolute inset-0 bg-white/55" aria-hidden="true" />
          <img
            {...imagemOtimizada(arte.url, { width: 640, height: 800, larguras: [240, 360, 480, 640] })}
            sizes={sizes}
            onError={() => setFalhou(true)}
            alt={arte.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain !bg-transparent"
          />
        </>
      )}
    </div>
  );
}
