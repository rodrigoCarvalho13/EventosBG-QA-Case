import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ExternalLink, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PlataformaIcon from "@/components/PlataformaIcon";
import { PLATAFORMAS, embedUrl, thumbUrl, videoCriadorPath } from "@/lib/videos";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import ComCurtir from "@/components/CurtirBotao";

export function Avatar({ name, photo, className = "w-9 h-9" }) {
  return photo ? (
    <img {...imagemOtimizada(photo, { width: 96, crop: true })} alt={name || "Foto"} loading="lazy" decoding="async" className={`${className} rounded-full object-cover ring-2 ring-white/80`} />
  ) : (
    <span className={`${className} grid place-items-center rounded-full bg-accent text-accent-foreground font-700 ring-2 ring-white/80`}>
      {(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

// Player num modal: assiste aqui mesmo ou abre no app da rede.
export function VideoPlayer({ video, open, onOpenChange }) {
  if (!video) return null;
  const p = PLATAFORMAS[video.platform];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 gap-0 overflow-hidden rounded-2xl bg-black border-white/10 text-white [&>button]:text-white [&>button]:z-10 ${
          video.vertical ? "max-w-[min(92vw,calc(75vh*9/16))]" : "max-w-[min(94vw,56rem)]"
        }`}
      >
        <DialogTitle className="sr-only">{video.title || `Vídeo de ${video.criador_name}`}</DialogTitle>
        <DialogDescription className="sr-only">Vídeo do {p?.label}</DialogDescription>
        <div className={video.vertical ? "aspect-[9/16] w-full" : "aspect-video w-full"}>
          {open && (
            <iframe
              src={embedUrl(video)}
              title={video.title || `Vídeo de ${video.criador_name}`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
              allowFullScreen
            />
          )}
        </div>
        <div className="flex items-center gap-3 p-3">
          <Link to={videoCriadorPath(video)} onClick={() => onOpenChange(false)} className="flex items-center gap-2 min-w-0 flex-1 hover:underline">
            <Avatar name={video.criador_name} photo={video.criador_photo} className="w-8 h-8 text-sm" />
            <span className="truncate text-sm font-600">{video.title || video.criador_name}</span>
          </Link>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${p?.cor} px-3.5 py-2 text-xs font-700 text-white`}
          >
            <PlataformaIcon platform={video.platform} className="w-3.5 h-3.5" />
            Abrir no {p?.label}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Capa do vídeo: miniatura do YouTube ou arte com o gradiente da rede.
function VideoCardBase({ video, destaque = false, mostrarCriador = true, className = "" }) {
  const [aberto, setAberto] = useState(false);
  const p = PLATAFORMAS[video.platform] || PLATAFORMAS.youtube;
  const thumb = thumbUrl(video);
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`group relative w-full overflow-hidden rounded-3xl text-left text-white shadow-lg ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent ${destaque ? "aspect-[4/5] sm:aspect-auto sm:h-full sm:min-h-[420px]" : "aspect-[4/5]"} ${className}`}
        aria-label={`Assistir ${video.title || `vídeo de ${video.criador_name}`} (${p.label})`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${p.cor}`} />
        {thumb ? (
          <img src={thumb} alt={video.title || `Vídeo de ${video.criador_name || "criador"}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <>
            <div className="absolute inset-0 dice-pattern opacity-25" aria-hidden="true" />
            <PlataformaIcon platform={video.platform} className="absolute -right-6 -top-6 w-40 h-40 text-white/15 rotate-12" />
            {video.criador_photo && (
              <img {...imagemOtimizada(video.criador_photo, { width: 96, crop: true })} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity" />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-xs font-700">
          <PlataformaIcon platform={video.platform} className="w-3.5 h-3.5" /> {p.label}
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className={`grid place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform group-hover:scale-110 ${destaque ? "w-20 h-20" : "w-14 h-14"}`}>
            <Play className={`${destaque ? "w-9 h-9" : "w-6 h-6"} ml-1 fill-current`} aria-hidden="true" />
          </span>
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          {video.title && <p className={`font-display font-700 leading-tight line-clamp-2 mb-2 ${destaque ? "text-2xl" : "text-base"}`}>{video.title}</p>}
          {mostrarCriador && (
            <span className="flex items-center gap-2 text-sm font-600">
              <Avatar name={video.criador_name} photo={video.criador_photo} className="w-7 h-7 text-xs" />
              <span className="truncate">{video.criador_name}</span>
              {video.criador_influencer && <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" aria-label="Influenciador" />}
            </span>
          )}
        </div>
      </button>
      <VideoPlayer video={video} open={aberto} onOpenChange={setAberto} />
    </>
  );
}

export default function VideoCard(props) {
  return (
    <ComCurtir tipo="video" id={props.video?.id}>
      <VideoCardBase {...props} />
    </ComCurtir>
  );
}
