import React, { useState } from "react";
import { Play, Mic } from "lucide-react";
import { Player } from "@/components/EpisodioCard";
import { PODCAST_PLATAFORMAS, embedEpisodio, thumbEpisodio } from "@/lib/podcasts";

const dataCurta = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "";

// Episódio em lista: imagem pequena à esquerda, título e plataforma ao lado.
export default function EpisodioItem({ episodio }) {
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
        className="group flex w-full items-center gap-4 rounded-2xl bg-card border border-border p-3 text-left card-shadow transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent"
        aria-label={`Ouvir ${episodio.title || "episódio"} (${p.label})`}
      >
        <span className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl bg-gradient-to-br ${p.cor}`}>
          {thumb ? (
            <img src={thumb} alt={episodio.title || `Episódio de ${episodio.podcast_name || "podcast"}`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Mic className="absolute inset-0 m-auto w-7 h-7 text-white/80" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-700 leading-tight line-clamp-2">{episodio.title || "Episódio"}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {p.label}
            {episodio.created_date && ` · ${dataCurta(episodio.created_date)}`}
          </span>
        </span>
        <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-110">
          <Play className="w-5 h-5 ml-0.5 fill-current" aria-hidden="true" />
        </span>
      </button>
      <Player ep={episodio} open={aberto} onOpenChange={setAberto} />
    </>
  );
}
