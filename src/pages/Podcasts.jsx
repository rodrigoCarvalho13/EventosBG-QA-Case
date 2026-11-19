import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { EpisodioRecente } from "@/components/RecenteCard";
import Carrossel from "@/components/Carrossel";
import PodcastCard from "@/components/PodcastCard";
import { Button } from "@/components/ui/button";
import { Mic, Headphones, Upload } from "lucide-react";

export default function Podcasts() {
  const [episodios, setEpisodios] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ePage, pPage] = await Promise.all([
          base44.entities.Episodio.filter({}, { sort: "-created_date", limit: 12 }),
          base44.entities.Podcast.filter({}, { sort: "-created_date", limit: 200, fields: ["name", "slug", "photo_url", "bio"] }),
        ]);
        setEpisodios(ePage.items || []);
        setPodcasts(pPage.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  
  return (
    <Layout>
      <header className="max-w-6xl mx-auto px-4 pt-10 sm:pt-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <Mic className="w-8 h-8 text-primary" aria-hidden="true" /> Podcasts
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Conversas, reviews e bastidores da comunidade. Ouça aqui ou abra no Spotify, YouTube e Apple Podcasts.
        </p>
        <Button asChild className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 font-700">
          <Link to="/painel/podcasts"><Upload className="w-4 h-4 mr-1.5" aria-hidden="true" /> Cadastrar meu podcast</Link>
        </Button>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Acabou de sair</p>
        <h2 className="font-display font-700 text-3xl sm:text-4xl tracking-tight mb-5">Episódios mais recentes</h2>
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => <div key={i} className="shrink-0 w-[15.5rem] sm:w-[17rem]"><div className="aspect-video rounded-2xl bg-muted animate-pulse" /><div className="mt-3 h-4 w-3/4 rounded bg-muted animate-pulse" /></div>)}
          </div>
        ) : episodios.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Headphones className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            Nenhum episódio ainda.{" "}
            <Link to="/painel/podcasts" className="font-600 text-primary dark:text-accent hover:underline">Seja o primeiro a postar</Link>
          </div>
        ) : (
          <Carrossel label="Episódios mais recentes" itemClassName="w-[15.5rem] sm:w-[17rem]">
            {episodios.map((e) => <EpisodioRecente key={e.id} episodio={e} />)}
          </Carrossel>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-accent/20 text-accent-ink"><Mic className="w-5 h-5" aria-hidden="true" /></span>
          <h2 className="font-display font-700 text-2xl sm:text-3xl">Podcasts</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Toque num podcast para ver todos os episódios.</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />)}
          </div>
        ) : podcasts.length === 0 ? (
          <p className="text-muted-foreground">Nenhum podcast ainda. Cadastre o seu em <Link to="/painel/podcasts" className="font-600 text-primary dark:text-accent hover:underline">Meus podcasts</Link>.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {podcasts.map((p) => <PodcastCard key={p.id} podcast={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
