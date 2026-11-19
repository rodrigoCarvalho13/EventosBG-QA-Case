import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import VideoPost from "@/components/VideoPost";
import { Avatar } from "@/components/VideoCard";
import { criadorPath } from "@/lib/videos";
import CriadorCard from "@/components/CriadorCard";
import { Button } from "@/components/ui/button";
import { Clapperboard, Sparkles, Users, Upload } from "lucide-react";

const PAGINA_FEED = 6;

export default function Influencers() {
  const [videos, setVideos] = useState([]);
  const [criadores, setCriadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiveis, setVisiveis] = useState(PAGINA_FEED);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [vPage, cPage] = await Promise.all([
          base44.entities.Video.filter({}, { sort: "-created_date", limit: 100 }),
          base44.entities.Criador.filter({}, { sort: "-ultimo_video_em", limit: 200, fields: ["name", "slug", "photo_url", "bio", "influencer", "instagram", "youtube", "tiktok", "ultimo_video_em", "estado", "cidade"] }),
        ]);
        const cs = cPage.items || [];
        const ids = new Set(cs.map((c) => c.id));
        setVideos((vPage.items || []).filter((v) => ids.has(v.criador_id)).slice(0, 60));
        setCriadores(cs);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Influenciadores aparecem sempre; os demais, só quando já postaram vídeo.
  const influencers = criadores.filter((c) => c.influencer);
  const comunidade = criadores.filter((c) => !c.influencer && c.ultimo_video_em);
  
  return (
    <Layout>
      <header className="max-w-6xl mx-auto px-4 pt-10 sm:pt-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <Clapperboard className="w-8 h-8 text-primary" aria-hidden="true" /> Influenciadores
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Reviews, partidas, unboxings e os rolês da comunidade. Assista aqui ou abra no YouTube, TikTok e Instagram.
        </p>
        <Button asChild className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 font-700">
          <Link to="/painel/videos"><Upload className="w-4 h-4 mr-1.5" aria-hidden="true" /> Postar meus vídeos</Link>
        </Button>
      </header>

      {/* Influenciadores: faixa de perfis no alto, como os stories */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-2" aria-labelledby="influ-titulo">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-accent/20 text-accent-ink"><Sparkles className="w-5 h-5" aria-hidden="true" /></span>
          <h2 id="influ-titulo" className="font-display font-700 text-2xl sm:text-3xl">Perfis</h2>
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => <div key={i} className="shrink-0 w-20"><div className="w-[4.5rem] h-[4.5rem] mx-auto rounded-full bg-muted animate-pulse" /><div className="mt-2 h-3 rounded bg-muted animate-pulse" /></div>)}
          </div>
        ) : influencers.length === 0 ? (
          <p className="text-muted-foreground">Nenhum influenciador ainda. Crie seu perfil em <Link to="/painel/videos" className="font-600 text-primary dark:text-accent hover:underline">Meus vídeos</Link>.</p>
        ) : (
          <ul aria-label="Influenciadores" className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {influencers.map((c) => (
              <li key={c.id} className="shrink-0 snap-start">
                <Link to={criadorPath(c)} className="group flex w-20 flex-col items-center gap-1.5 text-center focus-visible:outline-none">
                  <span className="rounded-full bg-gradient-to-tr from-accent to-amber-300 p-[3px] group-focus-visible:ring-4 group-focus-visible:ring-accent/50">
                    <span className="block rounded-full bg-card p-[3px]">
                      <Avatar name={c.name} photo={c.photo_url} className="w-[4.5rem] h-[4.5rem] text-xl !ring-0" />
                    </span>
                  </span>
                  <span className="w-full truncate text-xs font-600 group-hover:underline">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Feed dos vídeos mais recentes */}
      <section className="max-w-xl mx-auto px-4 pt-6 pb-8" aria-labelledby="feed-titulo">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Acabou de sair</p>
        <h2 id="feed-titulo" className="font-display font-700 text-3xl tracking-tight mb-5">Vídeos mais recentes</h2>
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />)}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Clapperboard className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Nenhum vídeo ainda.{" "}
            <Link to="/painel/videos" className="font-600 text-primary dark:text-accent hover:underline">Seja o primeiro a postar</Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {videos.slice(0, visiveis).map((v) => <VideoPost key={v.id} video={v} />)}
            </div>
            {videos.length > visiveis && (
              <div className="mt-6 flex justify-center">
                <Button type="button" variant="outline" onClick={() => setVisiveis((n) => n + PAGINA_FEED)} className="w-full sm:w-auto font-600">
                  Ver mais vídeos
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Comunidade */}
      {comunidade.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary/10 text-primary dark:text-accent"><Users className="w-5 h-5" aria-hidden="true" /></span>
            <h2 className="font-display font-700 text-2xl sm:text-3xl">Da comunidade</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">Jogadores que também compartilham seus vídeos.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {comunidade.map((c) => <CriadorCard key={c.id} criador={c} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}
