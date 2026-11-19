import React, { useEffect, useState } from "react";
import { slugDoRegistro } from "@/lib/slug";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import ImageUpload from "@/components/ImageUpload";
import EpisodioCard from "@/components/EpisodioCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { lerLinkEpisodio, PODCAST_PLATAFORMAS, ROTULO_REDE, podcastPath } from "@/lib/podcasts";
import { Mic, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";

const VAZIO = { name: "", bio: "", photo_url: "", spotify: "", apple: "", youtube: "", instagram: "", site: "" };
const CAMPOS_LINK = [
  ["spotify", "https://open.spotify.com/show/…"],
  ["apple", "https://podcasts.apple.com/…"],
  ["youtube", "@seucanal ou link"],
  ["instagram", "@seuperfil"],
  ["site", "https://…"],
];

// Área da pessoa: cadastro do podcast e dos episódios (por link).
export default function MeusPodcasts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [podcast, setPodcast] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [episodios, setEpisodios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [fotoOcupada, setFotoOcupada] = useState(false);
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [capa, setCapa] = useState("");
  const [capaOcupada, setCapaOcupada] = useState(false);
  const [postando, setPostando] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const pPage = await base44.entities.Podcast.filter({ created_by_id: user.id }, { limit: 1 });
        const p = (pPage.items || [])[0] || null;
        setPodcast(p);
        setForm(p ? { ...VAZIO, ...p } : VAZIO);
        if (p) {
          const ePage = await base44.entities.Episodio.filter({ podcast_id: p.id }, { sort: "-created_date", limit: 200 });
          setEpisodios(ePage.items || []);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSalvando(true);
    const dados = { name: form.name.trim(), bio: form.bio, photo_url: form.photo_url };
    CAMPOS_LINK.forEach(([k]) => { dados[k] = (form[k] || "").trim(); });
    try {
      // O endereço amigável nasce com o podcast e não muda se o nome mudar (os links não quebram).
      dados.slug = await slugDoRegistro(base44.entities.Podcast, dados.name, podcast, "podcast");
      const salvo = podcast
        ? await base44.entities.Podcast.update(podcast.id, dados)
        : await base44.entities.Podcast.create(dados);
      setPodcast({ ...podcast, ...salvo });
      await Promise.all(
        episodios.map((ep) => base44.entities.Episodio.update(ep.id, { podcast_name: dados.name, podcast_photo: dados.photo_url, podcast_slug: dados.slug }))
      );
      setEpisodios((list) => list.map((ep) => ({ ...ep, podcast_name: dados.name, podcast_photo: dados.photo_url, podcast_slug: dados.slug })));
      toast({ title: "Podcast salvo" });
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const lido = link.trim() ? lerLinkEpisodio(link) : null;

  const postar = async (e) => {
    e.preventDefault();
    if (!podcast || !lido || lido.erro) return;
    setPostando(true);
    try {
      const novo = await base44.entities.Episodio.create({
        podcast_id: podcast.id,
        podcast_name: podcast.name,
        podcast_slug: podcast.slug || "",
        podcast_photo: podcast.photo_url || "",
        url: lido.url,
        platform: lido.platform,
        episodio_id: lido.episodio_id,
        title: titulo.trim(),
        thumb_url: capa,
      });
      await base44.entities.Podcast.update(podcast.id, { ultimo_episodio_em: new Date().toISOString() });
      setEpisodios((list) => [novo, ...list]);
      setLink("");
      setTitulo("");
      setCapa("");
      toast({ title: "Episódio publicado!", description: "Já aparece na página de Podcasts." });
    } catch (err) {
      toast({ title: "Erro ao publicar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setPostando(false);
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir este episódio?")) return;
    await base44.entities.Episodio.delete(id);
    setEpisodios((list) => list.filter((e) => e.id !== id));
  };

  if (loading) {
    return <Layout><LogoSpinner className="py-28" /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        <div>
          <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Podcasts BSB</p>
          <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight flex items-center gap-2">
            <Mic className="w-8 h-8 text-accent-ink" aria-hidden="true" /> Meus podcasts
          </h1>
          <p className="text-muted-foreground mt-2">
            Cadastre seu podcast com os links do Spotify, Apple Podcasts e YouTube, e poste os episódios colando o link.
            {podcast && (
              <> {" "}<Link to={podcastPath(podcast)} className="font-600 text-primary dark:text-accent hover:underline">Ver página pública</Link></>
            )}
          </p>
        </div>

        <form onSubmit={salvar} className="rounded-3xl bg-card border border-border p-5 sm:p-6 card-shadow space-y-5">
          <h2 className="font-display font-700 text-xl">{podcast ? "Seu podcast" : "1. Cadastre seu podcast"}</h2>
          <ImageUpload value={form.photo_url} onChange={set("photo_url")} label="Capa / logo" onBusyChange={setFotoOcupada} />
          <div>
            <label htmlFor="pd-nome" className="block text-sm font-600 mb-1.5">Nome do podcast *</label>
            <Input id="pd-nome" value={form.name} onChange={set("name")} required maxLength={80} />
          </div>
          <div>
            <label htmlFor="pd-bio" className="block text-sm font-600 mb-1.5">Sobre</label>
            <Textarea id="pd-bio" value={form.bio} onChange={set("bio")} rows={3} maxLength={400} placeholder="Do que fala o seu podcast?" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CAMPOS_LINK.map(([k, ph]) => (
              <div key={k}>
                <label htmlFor={`pd-${k}`} className="block text-sm font-600 mb-1.5">{ROTULO_REDE[k]}</label>
                <Input id={`pd-${k}`} value={form[k]} onChange={set(k)} placeholder={ph} />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={salvando || fotoOcupada} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {salvando && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />}
            {podcast ? "Salvar podcast" : "Criar podcast"}
          </Button>
        </form>

        <form onSubmit={postar} className={`rounded-3xl bg-card border border-border p-5 sm:p-6 card-shadow space-y-4 ${podcast ? "" : "opacity-60 pointer-events-none"}`} aria-disabled={!podcast}>
          <h2 className="font-display font-700 text-xl">{podcast ? "Postar episódio" : "2. Poste seus episódios (cadastre o podcast primeiro)"}</h2>
          <div>
            <label htmlFor="ep-link" className="block text-sm font-600 mb-1.5">Link do episódio *</label>
            <Input id="ep-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://open.spotify.com/episode/… · youtube.com/watch?v=… · podcasts.apple.com/…" />
            {lido?.erro && <p className="mt-1.5 text-sm text-destructive">{lido.erro}</p>}
            {lido && !lido.erro && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Episódio do {PODCAST_PLATAFORMAS[lido.platform].label === "Ouvir" ? "link informado" : PODCAST_PLATAFORMAS[lido.platform].label} reconhecido.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="ep-titulo" className="block text-sm font-600 mb-1.5">Título (opcional)</label>
            <Input id="ep-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} />
          </div>
          {lido && !lido.erro && lido.platform !== "youtube" && (
            <ImageUpload value={capa} onChange={setCapa} label="Capa do episódio (opcional)" onBusyChange={setCapaOcupada} />
          )}
          <Button type="submit" disabled={!podcast || !lido || !!lido.erro || postando || capaOcupada} className="bg-accent text-accent-foreground hover:bg-accent/90 font-600">
            {postando ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />}
            Publicar episódio
          </Button>
        </form>

        {episodios.length > 0 && (
          <section>
            <h2 className="font-display font-700 text-xl mb-4">Seus episódios ({episodios.length})</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {episodios.map((ep) => (
                <div key={ep.id} className="space-y-2">
                  <EpisodioCard episodio={ep} mostrarPodcast={false} />
                  <div className="flex justify-between items-center">
                    <Button asChild variant="ghost" size="sm">
                      <a href={ep.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-1" aria-hidden="true" /> Abrir</a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => excluir(ep.id)} aria-label="Excluir episódio">
                      <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
