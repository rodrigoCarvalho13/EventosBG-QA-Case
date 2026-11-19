import React, { useState } from "react";
import { Play, Mic, Sparkles } from "lucide-react";
import PlataformaIcon from "@/components/PlataformaIcon";
import { Avatar, VideoPlayer } from "@/components/VideoCard";
import { Player } from "@/components/EpisodioCard";
import { PLATAFORMAS, dataDoVideo, thumbUrl } from "@/lib/videos";
import { PODCAST_PLATAFORMAS, embedEpisodio, thumbEpisodio } from "@/lib/podcasts";
import ComCurtir from "@/components/CurtirBotao";

const dataCurta = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "";

// Card compacto dos "mais recentes": capa 16:9 em cima, texto embaixo.
// Mesmo layout para vídeos e episódios, para as duas páginas ficarem iguais.
function Recente({ thumb, contain = false, cor, icone, plataforma, titulo, nome, foto, selo, data, rotulo, onClick, children }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={rotulo}
        className="group block w-full text-left focus-visible:outline-none"
      >
        <span className={`relative block aspect-video overflow-hidden rounded-2xl bg-gradient-to-br ${cor} shadow-md ring-1 ring-black/5 group-focus-visible:ring-4 group-focus-visible:ring-accent`}>
          {thumb ? (
            contain ? (
              <>
                <img src={thumb} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-70" />
                <img src={thumb} alt={titulo || "Miniatura"} loading="lazy" className="absolute inset-0 m-auto h-full w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
              </>
            ) : (
              <img src={thumb} alt={titulo || "Miniatura"} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            )
          ) : (
            <>
              <span className="absolute inset-0 dice-pattern opacity-25" aria-hidden="true" />
              <span className="absolute inset-0 grid place-items-center text-white/30">{icone}</span>
            </>
          )}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-xs font-700 text-white">
            {icone && <span className="[&>svg]:w-3 [&>svg]:h-3">{icone}</span>} {plataforma}
          </span>
          <span className="absolute bottom-2 right-2 grid place-items-center w-9 h-9 rounded-full bg-white/90 text-black shadow-lg transition-transform group-hover:scale-110">
            <Play className="w-4 h-4 ml-0.5 fill-current" aria-hidden="true" />
          </span>
        </span>
        <span className="mt-2.5 block font-display font-700 leading-snug line-clamp-2 min-h-[2.6em]">{titulo}</span>
        <span className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar name={nome} photo={foto} className="w-5 h-5 text-xs !ring-0" />
          <span className="truncate">{nome}</span>
          {selo && <Sparkles className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-label="Influenciador" />}
          {data && <span className="ml-auto shrink-0 text-xs">{dataCurta(data)}</span>}
        </span>
      </button>
      {children}
    </>
  );
}

function VideoRecenteBase({ video }) {
  const [aberto, setAberto] = useState(false);
  const p = PLATAFORMAS[video.platform] || PLATAFORMAS.youtube;
  return (
    <Recente
      thumb={thumbUrl(video) || video.criador_photo}
      cor={p.cor}
      icone={<PlataformaIcon platform={video.platform} className="w-12 h-12" />}
      plataforma={p.label}
      titulo={video.title || `Vídeo de ${video.criador_name}`}
      nome={video.criador_name}
      foto={video.criador_photo}
      selo={video.criador_influencer}
      data={dataDoVideo(video)}
      rotulo={`Assistir ${video.title || `vídeo de ${video.criador_name}`} (${p.label})`}
      onClick={() => setAberto(true)}
    >
      <VideoPlayer video={video} open={aberto} onOpenChange={setAberto} />
    </Recente>
  );
}

function EpisodioRecenteBase({ episodio }) {
  const [aberto, setAberto] = useState(false);
  const p = PODCAST_PLATAFORMAS[episodio.platform] || PODCAST_PLATAFORMAS.outro;
  const abrir = () => {
    if (embedEpisodio(episodio)) setAberto(true);
    else window.open(episodio.url, "_blank", "noopener,noreferrer");
  };
  return (
    <Recente
      thumb={thumbEpisodio(episodio)}
      contain={episodio.platform !== "youtube"}
      cor={p.cor}
      icone={<Mic className="w-12 h-12" aria-hidden="true" />}
      plataforma={p.label}
      titulo={episodio.title || `Episódio de ${episodio.podcast_name}`}
      nome={episodio.podcast_name}
      foto={episodio.podcast_photo}
      data={episodio.created_date}
      rotulo={`Ouvir ${episodio.title || `episódio de ${episodio.podcast_name}`} (${p.label})`}
      onClick={abrir}
    >
      <Player ep={episodio} open={aberto} onOpenChange={setAberto} />
    </Recente>
  );
}

export function VideoRecente(props) {
  return (
    <ComCurtir tipo="video" id={props.video?.id}>
      <VideoRecenteBase {...props} />
    </ComCurtir>
  );
}

export function EpisodioRecente(props) {
  return (
    <ComCurtir tipo="episodio" id={props.episodio?.id}>
      <EpisodioRecenteBase {...props} />
    </ComCurtir>
  );
}
