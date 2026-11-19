import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import ImageUpload from "@/components/ImageUpload";
import VideoCard from "@/components/VideoCard";
import PlataformaIcon from "@/components/PlataformaIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import RegiaoFields from "@/components/RegiaoFields";
import { estadoDe, cidadeDe, getEstadoAtual, getEstadoInfo } from "@/lib/regiao";
import { lerLinkVideo, PLATAFORMAS, criadorPath, maisRecentesPrimeiro } from "@/lib/videos";
import { slugDoRegistro } from "@/lib/slug";
import { Clapperboard, Loader2, Plus, Sparkles, Trash2, ExternalLink, ImagePlus } from "lucide-react";
import { enviarImagem } from "@/lib/uploadImagem";

const VAZIO = { name: "", bio: "", photo_url: "", influencer: false, estado: "DF", cidade: "Brasília", instagram: "", youtube: "", tiktok: "" };

// Área da pessoa: perfil de criador (ou influenciador) e os vídeos que ela postou.
export default function MeusVideos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [criador, setCriador] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [fotoOcupada, setFotoOcupada] = useState(false);
  const [link, setLink] = useState("");
  const [titulo, setTitulo] = useState("");
  const [capa, setCapa] = useState("");
  const [capaOcupada, setCapaOcupada] = useState(false);
  const [trocandoCapa, setTrocandoCapa] = useState(null);
  const [postando, setPostando] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const cPage = await base44.entities.Criador.filter({ created_by_id: user.id }, { limit: 1 });
        const c = (cPage.items || [])[0] || null;
        setCriador(c);
        // Perfil novo nasce no estado escolhido no topo; os antigos, sem estado, são do DF.
        const novo = getEstadoAtual();
        setForm(c
          ? { ...VAZIO, ...c, estado: estadoDe(c), cidade: cidadeDe(c) }
          : { ...VAZIO, name: user.full_name || "", estado: novo, cidade: getEstadoInfo(novo).cidadePadrao });
        if (c) {
          const vPage = await base44.entities.Video.filter({ criador_id: c.id }, { sort: "-created_date", limit: 200 });
          setVideos(vPage.items || []);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const salvarPerfil = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSalvando(true);
    const dados = {
      name: form.name.trim(),
      bio: form.bio,
      photo_url: form.photo_url,
      influencer: !!form.influencer,
      estado: form.estado,
      cidade: form.cidade.trim() || getEstadoInfo(form.estado).cidadePadrao,
      instagram: form.instagram.trim(),
      youtube: form.youtube.trim(),
      tiktok: form.tiktok.trim(),
    };
    try {
      // O endereço amigável nasce com o perfil e não muda se o nome mudar (os links não quebram).
      dados.slug = await slugDoRegistro(base44.entities.Criador, dados.name, criador, "perfil");
      const salvo = criador
        ? await base44.entities.Criador.update(criador.id, dados)
        : await base44.entities.Criador.create(dados);
      setCriador({ ...criador, ...salvo });
      // Mantém nome e foto dos vídeos já postados em dia com o perfil.
      await Promise.all(
        videos.map((v) =>
          base44.entities.Video.update(v.id, {
            criador_name: dados.name,
            criador_slug: dados.slug,
            criador_photo: dados.photo_url,
            criador_influencer: dados.influencer,
          })
        )
      );
      setVideos((list) => list.map((v) => ({ ...v, criador_name: dados.name, criador_slug: dados.slug, criador_photo: dados.photo_url, criador_influencer: dados.influencer })));
      let importados = 0;
      if (dados.youtube) {
        const r = await base44.functions.invoke("sincronizarVideosYoutube", { criador_id: salvo.id || criador?.id, force: true }).catch(() => null);
        importados = r?.data?.novos || 0;
        if (importados > 0) {
          const vPage = await base44.entities.Video.filter({ criador_id: salvo.id || criador.id }, { sort: "-created_date", limit: 200 });
          setVideos(vPage.items || []);
        }
      }
      toast({
        title: "Perfil salvo",
        description: importados > 0 ? `${importados} vídeo${importados > 1 ? "s" : ""} do YouTube ${importados > 1 ? "entraram" : "entrou"} na sua página.` : undefined,
      });
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const lido = link.trim() ? lerLinkVideo(link) : null;

  // TikTok: preenche título e capa sozinho a partir do link (a pessoa pode trocar os dois).
  const urlTiktok = lido && !lido.erro && lido.platform === "tiktok" ? lido.url : null;
  useEffect(() => {
    if (!urlTiktok) return undefined;
    let cancelado = false;
    (async () => {
      try {
        const r = await base44.functions.invoke("previaVideo", { url: urlTiktok });
        const d = r?.data;
        if (cancelado || !d) return;
        if (d.title) setTitulo((t) => t || d.title);
        if (d.thumb_data) {
          setCapaOcupada(true);
          try {
            const blob = await (await fetch(d.thumb_data)).blob();
            const url = await enviarImagem(new File([blob], "capa-tiktok.jpg", { type: blob.type || "image/jpeg" }));
            if (!cancelado) setCapa((c) => c || url);
          } finally {
            setCapaOcupada(false);
          }
        }
      } catch {
        // sem prévia: segue manual
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [urlTiktok]);

  const postar = async (e) => {
    e.preventDefault();
    if (!criador || !lido || lido.erro) return;
    setPostando(true);
    try {
      const novo = await base44.entities.Video.create({
        criador_id: criador.id,
        criador_name: criador.name,
        criador_slug: criador.slug || "",
        criador_photo: criador.photo_url || "",
        criador_influencer: !!criador.influencer,
        url: lido.url,
        platform: lido.platform,
        video_id: lido.video_id,
        vertical: lido.vertical,
        title: titulo.trim(),
        thumb_url: lido.platform === "youtube" ? "" : capa,
        publicado_em: new Date().toISOString(),
        origem: "manual",
      });
      await base44.entities.Criador.update(criador.id, { ultimo_video_em: new Date().toISOString() });
      setVideos((list) => [novo, ...list]);
      setLink("");
      setTitulo("");
      setCapa("");
      toast({ title: "Vídeo publicado!", description: "Já aparece no feed de Influenciadores." });
    } catch (err) {
      toast({ title: "Erro ao publicar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setPostando(false);
    }
  };

  // Troca a capa de um vídeo já postado (TikTok e Instagram não têm miniatura pública).
  const trocarCapa = async (video, file) => {
    if (!file) return;
    setTrocandoCapa(video.id);
    try {
      const url = await enviarImagem(file);
      await base44.entities.Video.update(video.id, { thumb_url: url });
      setVideos((list) => list.map((v) => (v.id === video.id ? { ...v, thumb_url: url } : v)));
    } catch (err) {
      toast({ title: "Erro ao enviar a capa", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setTrocandoCapa(null);
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir este vídeo?")) return;
    await base44.entities.Video.delete(id);
    setVideos((list) => list.filter((v) => v.id !== id));
  };

  if (loading) {
    return <Layout><LogoSpinner className="py-28" /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        <div>
          <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Influenciadores</p>
          <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight flex items-center gap-2">
            <Clapperboard className="w-8 h-8 text-accent-ink" aria-hidden="true" /> Meus vídeos
          </h1>
          <p className="text-muted-foreground mt-2">
            Crie seu perfil com a mesma conta e poste links dos seus vídeos do YouTube, TikTok ou Instagram.
            {criador && (
              <> {" "}<Link to={criadorPath(criador)} className="font-600 text-primary dark:text-accent hover:underline">Ver meu perfil público</Link></>
            )}
          </p>
        </div>

        <form onSubmit={salvarPerfil} className="rounded-3xl bg-card border border-border p-5 sm:p-6 card-shadow space-y-5">
          <h2 className="font-display font-700 text-xl">{criador ? "Seu perfil" : "1. Crie seu perfil"}</h2>
          <ImageUpload value={form.photo_url} onChange={set("photo_url")} label="Foto do perfil" onBusyChange={setFotoOcupada} />
          <div>
            <label htmlFor="cr-nome" className="block text-sm font-600 mb-1.5">Nome de exibição *</label>
            <Input id="cr-nome" value={form.name} onChange={set("name")} required maxLength={60} />
          </div>
          <div>
            <label htmlFor="cr-bio" className="block text-sm font-600 mb-1.5">Bio</label>
            <Textarea id="cr-bio" value={form.bio} onChange={set("bio")} rows={3} maxLength={280} placeholder="Do que são seus vídeos?" />
          </div>
          <RegiaoFields idPrefix="cr" estado={form.estado} cidade={form.cidade} onChange={(v) => setForm((f) => ({ ...f, ...v }))} />
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-accent/10 to-accent/10 p-4 cursor-pointer">
            <span>
              <span className="flex items-center gap-1.5 font-600"><Sparkles className="w-4 h-4 text-accent-ink" aria-hidden="true" /> Sou influenciador</span>
              <span className="block text-sm text-muted-foreground">Seu perfil aparece na vitrine de influenciadores do seu estado.</span>
            </span>
            <Switch checked={!!form.influencer} onCheckedChange={set("influencer")} aria-label="Perfil de influenciador" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {["instagram", "youtube", "tiktok"].map((r) => (
              <div key={r}>
                <label htmlFor={`cr-${r}`} className="flex items-center gap-1.5 text-sm font-600 mb-1.5">
                  <PlataformaIcon platform={r} className={`w-4 h-4 ${PLATAFORMAS[r].texto}`} /> {PLATAFORMAS[r].label}
                </label>
                <Input id={`cr-${r}`} value={form[r]} onChange={set(r)} placeholder="@seuperfil" />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground -mt-1">
            Com o YouTube preenchido, os vídeos do seu canal entram sozinhos na sua página, do mais novo para o mais antigo. Instagram e TikTok não liberam isso: poste esses links aqui embaixo.
          </p>
          <Button type="submit" disabled={salvando || fotoOcupada} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {salvando && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />}
            {criador ? "Salvar perfil" : "Criar perfil"}
          </Button>
        </form>

        <form onSubmit={postar} className={`rounded-3xl bg-card border border-border p-5 sm:p-6 card-shadow space-y-4 ${criador ? "" : "opacity-60 pointer-events-none"}`} aria-disabled={!criador}>
          <h2 className="font-display font-700 text-xl">{criador ? "Postar vídeo" : "2. Poste seus vídeos (crie o perfil primeiro)"}</h2>
          <div>
            <label htmlFor="v-link" className="block text-sm font-600 mb-1.5">Link do vídeo *</label>
            <Input id="v-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.youtube.com/watch?v=… · tiktok.com/@…/video/… · instagram.com/reel/…" />
            {lido?.erro && <p className="mt-1.5 text-sm text-destructive">{lido.erro}</p>}
            {lido && !lido.erro && (
              <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
                <PlataformaIcon platform={lido.platform} className={`w-4 h-4 ${PLATAFORMAS[lido.platform].texto}`} />
                Vídeo do {PLATAFORMAS[lido.platform].label} reconhecido{lido.vertical ? " (vertical)" : ""}.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="v-titulo" className="block text-sm font-600 mb-1.5">Título (opcional)</label>
            <Input id="v-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} />
          </div>
          {lido && !lido.erro && lido.platform !== "youtube" && (
            <div>
              <ImageUpload value={capa} onChange={setCapa} label="Capa do vídeo (opcional)" onBusyChange={setCapaOcupada} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {lido.platform === "tiktok" ? "Buscamos a capa do TikTok sozinhos; se não vier, ou se preferir outra, envie um print ou uma arte." : "O Instagram não libera a miniatura do vídeo. Envie um print ou uma arte para a capa."}
              </p>
            </div>
          )}
          <Button type="submit" disabled={!criador || !lido || !!lido.erro || postando || capaOcupada} className="bg-accent text-accent-foreground hover:bg-accent/90 font-600">
            {postando ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />}
            Publicar vídeo
          </Button>
        </form>

        {videos.length > 0 && (
          <section>
            <h2 className="font-display font-700 text-xl mb-4">Seus vídeos ({videos.length})</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {maisRecentesPrimeiro(videos).map((v) => (
                <div key={v.id} className="space-y-2">
                  <VideoCard video={v} mostrarCriador={false} />
                  <div className="flex justify-between items-center">
                    <Button asChild variant="ghost" size="sm">
                      <a href={v.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-1" aria-hidden="true" /> Abrir</a>
                    </Button>
                    {v.platform !== "youtube" && (
                      <label className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-500 hover:bg-muted cursor-pointer" title="Trocar capa">
                        {trocandoCapa === v.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="w-4 h-4" aria-hidden="true" />}
                        <span className="sr-only sm:not-sr-only">Capa</span>
                        <input type="file" accept="image/*" className="sr-only" disabled={trocandoCapa === v.id} onChange={(e) => { trocarCapa(v, e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => excluir(v.id)} aria-label="Excluir vídeo">
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
