import React, { useEffect, useState } from "react";
import { useSeo, seoPodcast } from "@/lib/seo";
import { buscarPorSlugOuId } from "@/lib/slug";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import EpisodioItem from "@/components/EpisodioItem";
import { Avatar } from "@/components/VideoCard";
import PlataformaIcon from "@/components/PlataformaIcon";
import { REDES_PODCAST, ROTULO_REDE, linkPrograma } from "@/lib/podcasts";
import { ArrowLeft, Headphones, Globe, Mic } from "lucide-react";
import { imagemOtimizada } from "@/lib/imagemOtimizada";

export default function PodcastDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [episodios, setEpisodios] = useState([]);
  const [loading, setLoading] = useState(true);

  useSeo(loading ? null : podcast ? seoPodcast(podcast, episodios) : { title: "Página não encontrada", noindex: true });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // O endereço pode ser o slug (/podcasts/podcastbg) ou, nos links antigos, o id.
        const p = await buscarPorSlugOuId(base44.entities.Podcast, id);
        const ePage = await base44.entities.Episodio.filter({ podcast_id: p.id }, { sort: "-created_date", limit: 200 });
        if (p.slug && p.slug !== id) navigate(`/podcasts/${p.slug}`, { replace: true });
        setPodcast(p);
        setEpisodios(ePage.items || []);
      } catch (e) {
        setPodcast(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) {
    return <Layout><LogoSpinner className="py-28" /></Layout>;
  }
  if (!podcast) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Podcast não encontrado. <Link to="/podcasts" className="font-600 text-primary dark:text-accent hover:underline">Voltar</Link>
        </div>
      </Layout>
    );
  }

  const redes = REDES_PODCAST.filter((r) => podcast[r]);
  const iconeRede = (r) => (r === "youtube" || r === "instagram" ? <PlataformaIcon platform={r} className="w-4 h-4" /> : r === "site" ? <Globe className="w-4 h-4" aria-hidden="true" /> : <Headphones className="w-4 h-4" aria-hidden="true" />);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-board text-white">
        <div className="absolute inset-0 dice-pattern opacity-20" aria-hidden="true" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <Link to="/podcasts" className="inline-flex items-center gap-1.5 py-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Podcasts
          </Link>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-5">
            <span className="self-start rounded-3xl p-1 bg-accent">
              {podcast.photo_url ? (
                <img {...imagemOtimizada(podcast.photo_url, { width: 128, crop: true })} alt={podcast.name || "Capa do podcast"} className="w-32 h-32 rounded-[1.25rem] object-cover" />
              ) : (
                <Avatar name={podcast.name} className="w-32 h-32 !rounded-[1.25rem] text-5xl !ring-0" />
              )}
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-700 mb-2">
                <Mic className="w-3.5 h-3.5" aria-hidden="true" /> Podcast
              </span>
              <h1 className="font-display font-900 text-3xl sm:text-5xl tracking-tight">{podcast.name}</h1>
              {podcast.bio && <p className="mt-2 text-white/75 max-w-xl whitespace-pre-line">{podcast.bio}</p>}
              {redes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {redes.map((r) => (
                    <a
                      key={r}
                      href={linkPrograma(r, podcast[r])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3.5 py-2 text-sm font-600"
                    >
                      {iconeRede(r)} {ROTULO_REDE[r]}
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
          Episódios <span className="text-muted-foreground font-500 text-lg">({episodios.length})</span>
        </h2>
        {episodios.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Headphones className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Nenhum episódio postado ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl">
            {episodios.map((e) => <EpisodioItem key={e.id} episodio={e} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
