import React, { useEffect, useState } from "react";
import { useSeo, seoCriador } from "@/lib/seo";
import { buscarPorSlugOuId } from "@/lib/slug";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import VideoCard, { Avatar } from "@/components/VideoCard";
import PlataformaIcon from "@/components/PlataformaIcon";
import { PLATAFORMAS, linkPerfil, videosPorPlataforma } from "@/lib/videos";
import { ArrowLeft, Clapperboard, Sparkles } from "lucide-react";

export default function CriadorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [criador, setCriador] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useSeo(loading ? null : criador ? seoCriador(criador, videos) : { title: "Página não encontrada", noindex: true });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // O endereço pode ser o slug (/influencers/uehrodrigo) ou, nos links antigos, o id.
        const c = await buscarPorSlugOuId(base44.entities.Criador, id);
        const buscar = async () => (await base44.entities.Video.filter({ criador_id: c.id }, { sort: "-created_date", limit: 200 })).items || [];
        if (c.slug && c.slug !== id) navigate(`/influencers/${c.slug}`, { replace: true });
        setCriador(c);
        setVideos(await buscar());
        setLoading(false);
        // Com YouTube no perfil, busca os vídeos novos do canal (no máximo a cada 3 horas) e atualiza a lista.
        if (c.youtube) {
          const r = await base44.functions.invoke("sincronizarVideosYoutube", { criador_id: c.id }).catch(() => null);
          if ((r?.data?.novos || 0) > 0) setVideos(await buscar());
        }
      } catch (e) {
        setCriador(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) {
    return <Layout><LogoSpinner className="py-28" /></Layout>;
  }
  if (!criador) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Perfil não encontrado. <Link to="/influencers" className="font-600 text-primary dark:text-accent hover:underline">Voltar</Link>
        </div>
      </Layout>
    );
  }

  const redes = ["instagram", "youtube", "tiktok"].filter((r) => criador[r]);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-board text-white">
        <div className="absolute inset-0 dice-pattern opacity-20" aria-hidden="true" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-10 bottom-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <Link to="/influencers" className="inline-flex items-center gap-1.5 py-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Influenciadores
          </Link>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-5">
            <span className={`self-start rounded-full p-1 ${criador.influencer ? "bg-accent" : "bg-white/20"}`}>
              <Avatar name={criador.name} photo={criador.photo_url} className="w-28 h-28 text-4xl !ring-0" />
            </span>
            <div className="min-w-0">
              {criador.influencer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Influenciador
                </span>
              )}
              <h1 className="font-display font-900 text-3xl sm:text-5xl tracking-tight">{criador.name}</h1>
              {criador.bio && <p className="mt-2 text-white/75 max-w-xl whitespace-pre-line">{criador.bio}</p>}
              {redes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {redes.map((r) => (
                    <a
                      key={r}
                      href={linkPerfil(r, criador[r])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${PLATAFORMAS[r].cor} px-3.5 py-2 text-sm font-600`}
                    >
                      <PlataformaIcon platform={r} className="w-4 h-4" /> {PLATAFORMAS[r].label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="font-display font-700 text-2xl sm:text-3xl mb-6">
          Vídeos <span className="text-muted-foreground font-500 text-lg">({videos.length})</span>
        </h2>
        {videos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Clapperboard className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Nenhum vídeo postado ainda.
          </div>
        ) : (
          <div className="space-y-10">
            {videosPorPlataforma(videos).map(({ platform, videos: lista }) => (
              <div key={platform} aria-labelledby={`videos-${platform}`}>
                <h3 id={`videos-${platform}`} className="flex items-center gap-2 font-display font-700 text-xl mb-4">
                  <PlataformaIcon platform={platform} className={`w-5 h-5 ${PLATAFORMAS[platform].texto}`} />
                  {PLATAFORMAS[platform].label}
                  <span className="text-muted-foreground font-500 text-base">({lista.length})</span>
                </h3>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {lista.map((v) => <VideoCard key={v.id} video={v} mostrarCriador={false} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
