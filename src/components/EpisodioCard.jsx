import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, ExternalLink, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar } from "@/components/VideoCard";
import { PODCAST_PLATAFORMAS, embedEpisodio, thumbEpisodio, episodioPodcastPath } from "@/lib/podcasts";
import ComCurtir from "@/components/CurtirBotao";

export function Player({ ep, open, onOpenChange }) {
  const p = PODCAST_PLATAFORMAS[ep.platform] || PODCAST_PLATAFORMAS.outro;
  const embed = embedEpisodio(ep);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(94vw,40rem)] p-0 gap-0 overflow-hidden rounded-2xl bg-card">
        <DialogTitle className="sr-only">{ep.title || `Episódio de ${ep.podcast_name}`}</DialogTitle>
        <DialogDescription className="sr-only">Episódio no {p.label}</DialogDescription>
        <div className="p-4 pt-12 space-y-4">
          {open && embed && (
            <iframe
              src={embed}
              title={ep.title || ep.podcast_name}
              className={ep.platform === "youtube" ? "w-full aspect-video rounded-xl" : "w-full h-[232px] rounded-xl"}
              allow="autoplay; encrypted-media; clipboard-write; fullscreen"
              allowFullScreen
            />
          )}
          <div className="flex items-center gap-3">
            <Link to={episodioPodcastPath(ep)} onClick={() => onOpenChange(false)} className="flex items-center gap-2 min-w-0 flex-1 hover:underline">
              <Avatar name={ep.podcast_name} photo={ep.podcast_photo} className="w-8 h-8 text-sm" />
              <span className="truncate text-sm font-600">{ep.title || ep.podcast_name}</span>
            </Link>
            <a
              href={ep.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${p.cor} px-3.5 py-2 text-xs font-700 text-white`}
            >
              {embed ? `Abrir no ${p.label}` : `Ouvir no ${p.label === "Ouvir" ? "link" : p.label}`}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EpisodioCardBase({ episodio, destaque = false, mostrarPodcast = true, className = "" }) {
  const [aberto, setAberto] = useState(false);
  const p = PODCAST_PLATAFORMAS[episodio.platform] || PODCAST_PLATAFORMAS.outro;
  const thumb = thumbEpisodio(episodio);
  const abrir = () => {
    if (embedEpisodio(episodio)) setAberto(true);
    else window.open(episodio.url, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={`group relative w-full overflow-hidden rounded-3xl text-left text-white shadow-lg ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent ${destaque ? "aspect-square sm:aspect-auto sm:h-full sm:min-h-[420px]" : "aspect-square"} ${className}`}
        aria-label={`Ouvir ${episodio.title || `episódio de ${episodio.podcast_name}`} (${p.label})`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${p.cor}`} />
        {thumb ? (
          <img src={thumb} alt={episodio.title || `Episódio de ${episodio.podcast_name || "podcast"}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <>
            <div className="absolute inset-0 dice-pattern opacity-25" aria-hidden="true" />
            <Mic className="absolute -right-4 -top-4 w-36 h-36 text-white/15 rotate-12" aria-hidden="true" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-xs font-700">
          <Mic className="w-3.5 h-3.5" aria-hidden="true" /> {p.label}
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className={`grid place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform group-hover:scale-110 ${destaque ? "w-20 h-20" : "w-14 h-14"}`}>
            <Play className={`${destaque ? "w-9 h-9" : "w-6 h-6"} ml-1 fill-current`} aria-hidden="true" />
          </span>
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          {episodio.title && <p className={`font-display font-700 leading-tight line-clamp-2 mb-2 ${destaque ? "text-2xl" : "text-base"}`}>{episodio.title}</p>}
          {mostrarPodcast && (
            <span className="flex items-center gap-2 text-sm font-600">
              <Avatar name={episodio.podcast_name} photo={episodio.podcast_photo} className="w-7 h-7 text-xs" />
              <span className="truncate">{episodio.podcast_name}</span>
            </span>
          )}
        </div>
      </button>
      <Player ep={episodio} open={aberto} onOpenChange={setAberto} />
    </>
  );
}

export default function EpisodioCard(props) {
  return (
    <ComCurtir tipo="episodio" id={props.episodio?.id}>
      <EpisodioCardBase {...props} />
    </ComCurtir>
  );
}
