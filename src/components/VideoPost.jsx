import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import PlataformaIcon from "@/components/PlataformaIcon";
import { Avatar, VideoPlayer } from "@/components/VideoCard";
import { CurtirBotao } from "@/components/CurtirBotao";
import { PLATAFORMAS, dataDoVideo, thumbUrl, videoCriadorPath } from "@/lib/videos";

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

// "há 3 dias", "ontem"; passa de um mês, vira a data.
function haQuanto(iso) {
  const t = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(t)) return "";
  const min = Math.round((t - Date.now()) / 60000);
  if (Math.abs(min) < 60) return rtf.format(Math.min(min, 0), "minute");
  if (Math.abs(min) < 60 * 24) return rtf.format(Math.round(min / 60), "hour");
  const dias = Math.round(min / (60 * 24));
  if (Math.abs(dias) < 30) return rtf.format(dias, "day");
  return new Date(t).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

// Publicação no formato de feed: cabeçalho com o criador, mídia grande e legenda.
export default function VideoPost({ video }) {
  const [aberto, setAberto] = useState(false);
  const p = PLATAFORMAS[video.platform] || PLATAFORMAS.youtube;
  const thumb = thumbUrl(video);
  const titulo = video.title || `Vídeo de ${video.criador_name}`;
  const quando = haQuanto(dataDoVideo(video));
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card card-shadow">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={videoCriadorPath(video)} className="flex min-w-0 flex-1 items-center gap-3 min-h-11">
          <Avatar name={video.criador_name} photo={video.criador_photo} className="w-10 h-10 text-base !ring-0" />
          <span className="min-w-0">
            <span className="flex items-center gap-1 font-display font-700 leading-tight">
              <span className="truncate">{video.criador_name}</span>
              {video.criador_influencer && <Sparkles className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-label="Influenciador" />}
            </span>
            {quando && <span className="block text-xs text-muted-foreground">{quando}</span>}
          </span>
        </Link>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-600 text-muted-foreground">
          <PlataformaIcon platform={video.platform} className="w-3.5 h-3.5" /> {p.label}
        </span>
      </header>
      <div className="relative">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label={`Assistir ${titulo} (${p.label})`}
          className={`group relative block w-full overflow-hidden bg-gradient-to-br ${p.cor} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent ${video.vertical ? "aspect-[4/5]" : "aspect-video"}`}
        >
          {thumb ? (
            <img src={thumb} alt={titulo} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <>
              <span className="absolute inset-0 dice-pattern opacity-25" aria-hidden="true" />
              <PlataformaIcon platform={video.platform} className="absolute inset-0 m-auto w-24 h-24 text-white/25" />
            </>
          )}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid place-items-center w-16 h-16 rounded-full bg-white/90 text-black shadow-xl transition-transform group-hover:scale-110">
              <Play className="w-7 h-7 ml-1 fill-current" aria-hidden="true" />
            </span>
          </span>
        </button>
        <CurtirBotao tipo="video" id={video.id} className="absolute top-2 right-2 z-10" />
      </div>
      <p className="px-4 py-3 text-sm">
        <Link to={videoCriadorPath(video)} className="font-700 hover:underline">{video.criador_name}</Link>{" "}
        {video.title && <span className="text-foreground/90">{video.title}</span>}
      </p>
      <VideoPlayer video={video} open={aberto} onOpenChange={setAberto} />
    </article>
  );
}
