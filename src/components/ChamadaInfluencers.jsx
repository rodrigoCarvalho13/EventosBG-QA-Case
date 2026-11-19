import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import PlataformaIcon from "@/components/PlataformaIcon";
import { Avatar, VideoPlayer } from "@/components/VideoCard";
import { PLATAFORMAS, thumbUrl, criadorPath, videoCriadorPath } from "@/lib/videos";
import { ArrowRight, Clapperboard, Play } from "lucide-react";

const LEQUE = [-12, -6, 0, 6, 12];

function PolaroideVideo({ video }) {
  const [aberto, setAberto] = useState(false);
  const thumb = thumbUrl(video);
  return (
    <div className="w-32 sm:w-36 rounded-2xl bg-white p-1.5 text-zinc-900 shadow-[0_24px_50px_-14px_rgba(0,0,0,0.7)]">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`group relative block w-full aspect-[9/14] rounded-xl overflow-hidden bg-gradient-to-br ${PLATAFORMAS[video.platform]?.cor}`}
        aria-label={`Assistir ${video.title || `vídeo de ${video.criador_name}`}`}
      >
        {(thumb || video.criador_photo) && (
          <img src={thumb || video.criador_photo} alt={video.title || video.criador_name || "Vídeo"} loading="lazy" decoding="async" className={`absolute inset-0 w-full h-full object-cover ${thumb ? "" : "opacity-40 mix-blend-luminosity"}`} />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-1.5 left-1.5 grid place-items-center w-6 h-6 rounded-full bg-black/60 text-white">
          <PlataformaIcon platform={video.platform} className="w-3.5 h-3.5" />
        </span>
        <span className="absolute inset-0 m-auto grid place-items-center w-11 h-11 rounded-full bg-white/90 text-black shadow-lg transition-transform group-hover:scale-110">
          <Play className="w-5 h-5 ml-0.5 fill-current" aria-hidden="true" />
        </span>
        {video.title && <span className="absolute bottom-1.5 inset-x-1.5 text-left text-xs font-700 leading-tight text-white line-clamp-2">{video.title}</span>}
      </button>
      <Link to={videoCriadorPath(video)} className="flex items-center gap-1.5 px-1 pt-1.5 pb-1 hover:underline">
        <Avatar name={video.criador_name} photo={video.criador_photo} className="w-6 h-6 text-xs !ring-0" />
        <span className="truncate text-xs font-700">{video.criador_name}</span>
      </Link>
      <VideoPlayer video={video} open={aberto} onOpenChange={setAberto} />
    </div>
  );
}

// Chamada da Home para a área de Influencers, com os vídeos mais novos.
export default function ChamadaInfluencers() {
  const [videos, setVideos] = useState([]);
  const [influencers, setInfluencers] = useState([]);

  const raiz = useRef(null);
  const [visivel, setVisivel] = useState(false);

  // A seção fica abaixo da dobra: só busca quando está perto de aparecer,
  // para não disputar banda com o topo da Home.
  useEffect(() => {
    const el = raiz.current;
    if (!el || typeof IntersectionObserver === "undefined") return setVisivel(true);
    const io = new IntersectionObserver(([x]) => x.isIntersecting && (setVisivel(true), io.disconnect()), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visivel) return;
    Promise.all([
      base44.entities.Video.filter({}, { sort: "-created_date", limit: 50 }),
      base44.entities.Criador.filter({}, { sort: "-ultimo_video_em", limit: 200, fields: ["name", "photo_url", "influencer"] }),
    ])
      .then(([vPage, cPage]) => {
        const cs = cPage.items || [];
        const ids = new Set(cs.map((c) => c.id));
        setVideos((vPage.items || []).filter((v) => ids.has(v.criador_id)).slice(0, 5));
        setInfluencers(cs.filter((c) => c.influencer).slice(0, 8));
      })
      .catch(() => {});
  }, [visivel]);

  return (
    <section ref={raiz} className="max-w-6xl mx-auto px-4 pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-board text-white px-6 py-8 sm:p-10">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="absolute left-1/3 -bottom-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-8 grid-cols-[minmax(0,1fr)] lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-700 uppercase tracking-[0.2em]">
              <Clapperboard className="w-3.5 h-3.5 text-accent" aria-hidden="true" /> Influenciadores</span>
            <h2 className="mt-4 font-display font-700 text-3xl sm:text-4xl tracking-tight">
              Conheça os <span className="text-accent">influenciadores</span>
            </h2>
            <p className="mt-3 text-white/75 max-w-md">
              Quem faz conteúdo de board game, no YouTube, TikTok e Instagram. Assista aqui e poste os seus vídeos.
            </p>
            {influencers.length > 0 && (
              <div className="mt-5 flex items-center">
                <div className="flex -space-x-3">
                  {influencers.map((c) => (
                    <Link key={c.id} to={criadorPath(c)} title={c.name} className="rounded-full hover:-translate-y-1 hover:z-10 transition-transform">
                      <Avatar name={c.name} photo={c.photo_url} className="w-11 h-11 text-sm !ring-zinc-900" />
                    </Link>
                  ))}
                </div>
                <span className="ml-3 text-sm text-white/70">{influencers.length} influenciador{influencers.length === 1 ? "" : "es"}</span>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-600">
                <Link to="/influencers">Conhecer os influenciadores <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" /></Link>
              </Button>
              <span className="flex gap-2 text-white/70">
                {["youtube", "tiktok", "instagram"].map((r) => <PlataformaIcon key={r} platform={r} className="w-5 h-5" />)}
              </span>
            </div>
          </div>
          {videos.length > 0 && (
            <div className="min-w-0">
              <p className="text-xs font-700 uppercase tracking-[0.2em] text-white/60 mb-2 lg:text-center">Últimos vídeos</p>
              {/* Leque de "polaroides" inclinadas; o nome de quem postou fica sempre embaixo do vídeo */}
              <ul className="flex lg:justify-center overflow-x-auto lg:overflow-visible -mx-6 px-6 pt-6 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Últimos vídeos">
                {videos.map((v, i) => (
                  <li
                    key={v.id}
                    style={{ "--r": `${LEQUE[i % LEQUE.length]}deg`, "--y": `${Math.abs(i - (videos.length - 1) / 2) * 10}px` }}
                    className="shrink-0 -ml-3 first:ml-0 [transform:translateY(var(--y))_rotate(var(--r))] hover:[transform:translateY(-10px)_rotate(0deg)] hover:z-10 transition-transform duration-300"
                  >
                    <PolaroideVideo video={v} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
