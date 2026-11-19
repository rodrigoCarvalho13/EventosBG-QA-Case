import { imagemOtimizada } from "@/lib/imagemOtimizada";
import React, { useEffect, useMemo, useState } from "react";
import { lojaPath, eventoPath, slugDoRegistro } from "@/lib/slug";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { formatarPeriodo, ordenarPorProximaData } from "@/lib/eventStatus";
import CodigosConvite from "@/components/CodigosConvite";
import ArteEvento, { comFotoDaLoja } from "@/components/ArteEvento";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LayoutDashboard,
  Users,
  Star,
  ChevronDown,
  UserCheck,
  Clapperboard,
  Mic,
  LifeBuoy,
  GraduationCap,
  CalendarCheck,
  Newspaper,
  Ticket,
  Briefcase,
  BellRing,
  UserRound,
  PackageOpen,
  Megaphone,
  FlaskConical,
} from "lucide-react";

const dayLabels = {
  domingo: "Dom", segunda: "Seg", terca: "Ter", quarta: "Qua", quinta: "Qui", sexta: "Sex", sabado: "Sáb",
};

export default function Painel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lojas, setLojas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [todasLojas, setTodasLojas] = useState([]);
  const [parcerias, setParcerias] = useState([]);
  const [salvandoParceria, setSalvandoParceria] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [codigosAberto, setCodigosAberto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suporte, setSuporte] = useState([]);
  const [tab, setTab] = useState("lojas");

  const fotosLoja = useMemo(() => {
    const fotos = new Map();
    for (const loja of [...lojas, ...todasLojas]) if (loja?.photo_url) fotos.set(loja.id, loja.photo_url);
    return fotos;
  }, [lojas, todasLojas]);
  const eventosOrdenados = useMemo(
    () => ordenarPorProximaData(eventos.map((e) => comFotoDaLoja(e, fotosLoja))),
    [eventos, fotosLoja]
  );
  const pendentesOrdenados = useMemo(
    () => ordenarPorProximaData(pendentes.map((e) => comFotoDaLoja(e, fotosLoja))),
    [pendentes, fotosLoja]
  );

  const load = async () => {
    setLoading(true);
    try {
      // Admin vê e edita tudo; os demais só o que cadastraram.
      const dono = user.role === "admin" ? {} : { created_by_id: user.id };
      const [lPage, ePage] = await Promise.all([
        base44.entities.Loja.filter(dono, { sort: "-created_date", limit: 500 }),
        base44.entities.Programacao.filter(dono, { sort: "-created_date", limit: 500 }),
      ]);
      setLojas(lPage.items || []);
      setEventos(ePage.items || []);
      const inscPage = await base44.entities.Inscricao.filter(
        user.role === "admin" ? {} : { evento_owner_id: user.id },
        { sort: "-created_date", limit: 500 }
      );
      setInscricoes(inscPage.items || []);
      if (user.role === "admin") {
        const pPage = await base44.entities.Programacao.filter({ status: "pending" }, { sort: "-created_date", limit: 100 });
        setPendentes(pPage.items || []);
        const [todas, parc] = await Promise.all([
          base44.entities.Loja.filter({ status: "approved" }, { sort: "name", limit: 500, fields: ["name", "type", "neighborhood", "photo_url"] }),
          base44.entities.Parceria.filter({}, { limit: 500 }),
        ]);
        setTodasLojas(todas.items || []);
        setParcerias(parc.items || []);
        const sPage = await base44.entities.Suporte.filter({}, { sort: "-created_date", limit: 200 });
        setSuporte(sPage.items || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const deleteLoja = async (id) => {
    if (!confirm("Excluir esta loja?")) return;
    await base44.entities.Loja.delete(id);
    setLojas((l) => l.filter((x) => x.id !== id));
  };

  const deleteEvento = async (id) => {
    if (!confirm("Excluir este evento?")) return;
    await base44.entities.Programacao.delete(id);
    setEventos((e) => e.filter((x) => x.id !== id));
  };

  const deleteInscricao = async (id) => {
    if (!confirm("Remover esta inscrição?")) return;
    await base44.entities.Inscricao.delete(id);
    setInscricoes((list) => list.filter((x) => x.id !== id));
  };

  const toggleCheckIn = async (insc) => {
    const novo = !insc.checked_in;
    setInscricoes((list) => list.map((x) => (x.id === insc.id ? { ...x, checked_in: novo } : x)));
    try {
      await base44.entities.Inscricao.update(insc.id, { checked_in: novo });
    } catch (err) {
      setInscricoes((list) => list.map((x) => (x.id === insc.id ? { ...x, checked_in: insc.checked_in } : x)));
      toast({ title: "Erro ao fazer check-in", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const review = async (id, status) => {
    try {
      const payload = { status };
      if (status === "approved") {
        // Garante o endereço amigável do evento aprovado (sugestões antigas nascem sem slug).
        const sugestao = pendentes.find((x) => x.id === id);
        if (sugestao && !sugestao.slug) payload.slug = await slugDoRegistro(base44.entities.Programacao, sugestao.title, sugestao, "evento");
      }
      await base44.entities.Programacao.update(id, payload);
      setPendentes((p) => p.filter((x) => x.id !== id));
      toast({
        title: status === "approved" ? "Sugestão aprovada" : "Sugestão rejeitada",
        description:
          status === "approved"
            ? "O evento agora aparece no hub."
            : "A sugestão foi rejeitada.",
      });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const toggleResolvido = async (m) => {
    const novo = !m.resolvido;
    setSuporte((l) => l.map((x) => (x.id === m.id ? { ...x, resolvido: novo } : x)));
    try {
      await base44.entities.Suporte.update(m.id, { resolvido: novo });
    } catch (err) {
      setSuporte((l) => l.map((x) => (x.id === m.id ? { ...x, resolvido: m.resolvido } : x)));
      toast({ title: "Erro ao atualizar", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const deleteSuporte = async (id) => {
    if (!confirm("Excluir esta mensagem?")) return;
    await base44.entities.Suporte.delete(id);
    setSuporte((l) => l.filter((x) => x.id !== id));
  };

  const toggleParceria = async (loja, ativo) => {
    setSalvandoParceria(loja.id);
    try {
      if (ativo) {
        const nova = await base44.entities.Parceria.create({ loja_id: loja.id });
        setParcerias((list) => [...list, nova]);
      } else {
        const existentes = parcerias.filter((p) => p.loja_id === loja.id);
        await Promise.all(existentes.map((p) => base44.entities.Parceria.delete(p.id)));
        setParcerias((list) => list.filter((p) => p.loja_id !== loja.id));
      }
      toast({
        title: ativo ? "Marcada como parceira" : "Parceria removida",
        description: ativo
          ? `${loja.name} agora aparece em destaque na listagem.`
          : `${loja.name} voltou para a listagem normal.`,
      });
    } catch (err) {
      toast({ title: "Erro ao atualizar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSalvandoParceria(null);
    }
  };

  const isAdmin = user?.role === "admin";
  const parceriaIds = new Set(parcerias.map((p) => p.loja_id));
  const inscByEvento = {};
  inscricoes.forEach((i) => {
    (inscByEvento[i.evento_id] ||= []).push(i);
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <LayoutDashboard className="w-8 h-8 text-primary" /> Meu Painel
        </h1>
        <p className="text-muted-foreground mb-4">
          {isAdmin
            ? "Você é admin: vê e edita todas as lojas, espaços e programações do site."
            : "Gerencie suas lojas, espaços, programações e reservas."}
        </p>
        <Link
          to="/materias/minhas"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <Newspaper className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Minhas matérias</span>
            <span className="block text-sm text-white/70">Escreva, edite e exclua os seus relatos.</span>
          </span>
        </Link>
        {isAdmin && (
          <Link
            to="/painel/materias"
            className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
          >
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
              <Newspaper className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-600">Matérias</span>
              <span className="block text-sm text-white/70">Todas as matérias e as denúncias.</span>
            </span>
          </Link>
        )}
        <Link
          to="/painel/videos"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <Clapperboard className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meus vídeos</span>
            <span className="block text-sm text-white/70">Perfil de influenciador e vídeos do YouTube, TikTok e Instagram.</span>
          </span>
        </Link>
        <Link
          to="/painel/podcasts"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <Mic className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meus podcasts</span>
            <span className="block text-sm text-white/70">Cadastre seu podcast e poste episódios do Spotify, YouTube e Apple Podcasts.</span>
          </span>
        </Link>
        <Link
          to="/painel/monitor"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meu perfil de monitor</span>
            <span className="block text-sm text-white/70">Ensine jogos, publique sua agenda e receba reservas.</span>
          </span>
        </Link>
        <Link
          to="/painel/vagas"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <Briefcase className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Minhas vagas</span>
            <span className="block text-sm text-white/70">Estamos contratando: anuncie o perfil que procura e receba currículos.</span>
          </span>
        </Link>
        <Link
          to="/painel/procuro"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <Megaphone className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meus anúncios “Procuro”</span>
            <span className="block text-sm text-white/70">Gente para jogar, testadores, parceria para criar jogo ou um jogo.</span>
          </span>
        </Link>
        <Link
          to="/painel/testador"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <FlaskConical className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meu perfil de testador</span>
            <span className="block text-sm text-white/70">Jogos que já testou e os tipos de jogo que gosta de testar.</span>
          </span>
        </Link>
        <Link
          to="/perfil"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <UserRound className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meu perfil</span>
            <span className="block text-sm text-white/70">Jogos favoritos, eventos de que participou e monitores avaliados.</span>
          </span>
        </Link>
        <Link
          to="/painel/lancamentos"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <PackageOpen className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Meus lançamentos</span>
            <span className="block text-sm text-white/70">Divulgue pré-vendas, campanhas e jogos novos da sua editora.</span>
          </span>
        </Link>
        <Link
          to="/seguindo"
          className="mb-3 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <BellRing className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Seguindo</span>
            <span className="block text-sm text-white/70">Os próximos eventos dos lugares e grupos que você segue.</span>
          </span>
        </Link>
        <Link
          to="/painel/reservas"
          className="mb-8 flex items-center gap-3 rounded-2xl bg-board text-white p-4 hover:opacity-95"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent text-accent-foreground shrink-0">
            <CalendarCheck className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-600">Minhas reservas</span>
            <span className="block text-sm text-white/70">Confirme horários, marque o pagamento e avalie atendimentos.</span>
          </span>
        </Link>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setTab("lojas")}
            className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-600 ${tab === "lojas" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            {isAdmin ? "Todas as lojas" : "Minhas lojas"} ({lojas.length})
          </button>
          <button
            onClick={() => setTab("eventos")}
            className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-600 ${tab === "eventos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            {isAdmin ? "Todos os eventos" : "Meus eventos"} ({eventos.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setTab("pendentes")}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-600 ${tab === "pendentes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              Sugestões pendentes ({pendentes.length})
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setTab("parceiras")}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-600 ${tab === "parceiras" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              Lojas parceiras ({parceriaIds.size})
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setTab("suporte")}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-600 ${tab === "suporte" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              Suporte ({suporte.filter((m) => !m.resolvido).length})
            </button>
          )}
        </div>

        {loading ? (
          <LogoSpinner />
        ) : tab === "lojas" ? (
          <div>
            <Button asChild className="mb-5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/painel/lojas/nova"><Plus className="w-4 h-4 mr-1.5" /> Cadastrar loja</Link>
            </Button>
            {lojas.length === 0 ? (
              <p className="text-muted-foreground">{isAdmin ? "Nenhuma loja cadastrada." : "Você ainda não cadastrou lojas."}</p>
            ) : (
              <div className="space-y-3">
                {lojas.map((l) => (
                  <div key={l.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-shadow">
                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                      {l.photo_url ? <img {...imagemOtimizada(l.photo_url, { width: 160, crop: true })} loading="lazy" decoding="async" alt={l.name} className="w-full h-full object-cover" /> : <div className="w-full h-full dice-pattern" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={lojaPath(l)} className="inline-block py-1.5 font-600 hover:underline">{l.name}</Link>
                      <div className="mt-1"><StatusBadge status={l.status} /></div>
                    </div>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon"><Link to={`/painel/lojas/${l.id}`} aria-label={`Editar ${l.name}`}><Pencil className="w-4 h-4" aria-hidden="true" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteLoja(l.id)} aria-label={`Excluir ${l.name}`}><Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "eventos" ? (
          <div>
            <Button asChild className="mb-5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/painel/eventos/novo"><Plus className="w-4 h-4 mr-1.5" /> Cadastrar evento</Link>
            </Button>
            {eventos.length === 0 ? (
              <p className="text-muted-foreground">{isAdmin ? "Nenhum evento cadastrado." : "Você ainda não cadastrou eventos."}</p>
            ) : (
              <div className="space-y-3">
                {eventosOrdenados.map((e) => {
                  const lista = inscByEvento[e.id] || [];
                  const isOpen = expanded === e.id;
                  // A lista de inscritos só existe quando a inscrição é pelo site.
                  const modoInscricao = e.tem_inscricao === false ? "nenhuma" : e.inscricao_tipo === "link" ? "link" : "site";
                  const mostraInscritos = modoInscricao === "site" || lista.length > 0;
                  return (
                    <div key={e.id} className="rounded-xl bg-card border border-border card-shadow overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <ArteEvento evento={e} className="w-16 h-20 shrink-0 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <Link to={eventoPath(e)} className="font-600 hover:underline">{e.title}</Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {e.recurrence_type === "fixa" ? `${dayLabels[e.day_of_week] || ""} ${e.start_time || ""}` : `${formatarPeriodo(e)} ${e.start_time || ""}`}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <StatusBadge status={e.status} />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {mostraInscritos
                                ? `${lista.length} inscrição${lista.length === 1 ? "" : "ões"}`
                                : modoInscricao === "link" ? "Inscrição por link externo" : "Sem inscrição"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {mostraInscritos && <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(isOpen ? null : e.id)}
                            aria-expanded={isOpen}
                            aria-label={`Ver inscritos de ${e.title}`}
                            data-testid={`expand-inscritos-${e.id}`}
                          >
                            <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                            {isOpen ? "Ocultar" : "Ver inscritos"}
                          </Button>}
                          {e.convite_obrigatorio && modoInscricao === "site" && <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCodigosAberto(codigosAberto === e.id ? null : e.id)}
                            aria-expanded={codigosAberto === e.id}
                            data-testid={`expand-codigos-${e.id}`}
                          >
                            <Ticket className="w-4 h-4 mr-1" aria-hidden="true" /> Códigos
                          </Button>}
                          <Button asChild variant="ghost" size="icon"><Link to={`/painel/eventos/${e.id}`} aria-label={`Editar ${e.title}`}><Pencil className="w-4 h-4" aria-hidden="true" /></Link></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteEvento(e.id)} aria-label={`Excluir ${e.title}`}><Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" /></Button>
                        </div>
                      </div>
                      {codigosAberto === e.id && e.convite_obrigatorio && <CodigosConvite evento={e} />}
                      {isOpen && mostraInscritos && (
                        <div
                          className="border-t border-border bg-muted/30 p-4"
                          aria-label={`Inscritos de ${e.title}`}
                          data-testid={`inscritos-list-${e.id}`}
                        >
                          {lista.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">Nenhuma inscrição ainda.</p>
                          ) : (
                            <>
                              <p className="text-xs font-600 text-muted-foreground mb-3 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5" />
                                {lista.filter((i) => i.checked_in).length} de {lista.length} presentes
                              </p>
                              <div className="space-y-2">
                                {lista.map((i) => (
                                  <div key={i.id} className="flex items-center justify-between gap-3 text-sm" data-testid={`inscrito-${i.id}`}>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-600 truncate">
                                        {i.checked_in && <UserCheck className="inline w-4 h-4 text-primary mr-1 -mt-0.5" aria-label="Presente" />}
                                        <span className="sr-only">Nome: </span>{i.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        <span className="sr-only">E-mail: </span>{i.email}
                                        {i.phone ? <><span className="sr-only"> · Telefone: </span><span aria-hidden="true"> · {i.phone}</span></> : null}
                                      </p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <Button
                                        variant={i.checked_in ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleCheckIn(i)}
                                        aria-label={i.checked_in ? `Desfazer check-in de ${i.name}` : `Fazer check-in de ${i.name}`}
                                        aria-pressed={i.checked_in}
                                        data-testid={`checkin-${i.id}`}
                                        className={i.checked_in ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                                      >
                                        <UserCheck className="w-4 h-4" aria-hidden="true" />
                                        {i.checked_in ? "Presente" : "Check-in"}
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => deleteInscricao(i.id)} aria-label={`Remover inscrição de ${i.name}`} data-testid={`remover-inscricao-${i.id}`}>
                                        <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : tab === "suporte" ? (
          <div>
            {suporte.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma mensagem de suporte.</p>
            ) : (
              <div className="space-y-3">
                {suporte.map((m) => (
                  <div key={m.id} className={`p-4 rounded-xl bg-card border card-shadow ${m.resolvido ? "border-border opacity-70" : "border-accent"}`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="font-600 flex items-center gap-1.5">
                          <LifeBuoy className="w-4 h-4 text-primary" aria-hidden="true" /> {m.assunto || "Sem assunto"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.nome} · <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a> · {new Date(m.created_date).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={m.resolvido ? "outline" : "default"} onClick={() => toggleResolvido(m)}>
                          <Check className="w-4 h-4 mr-1" /> {m.resolvido ? "Reabrir" : "Resolvido"}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSuporte(m.id)} aria-label="Excluir mensagem"><Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" /></Button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{m.mensagem}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "parceiras" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-5">
              Lojas parceiras aparecem em destaque fixo no topo da listagem de Lugares e
              primeiro na Home.
            </p>
            {todasLojas.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma loja publicada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {todasLojas.map((l) => {
                  const ativa = parceriaIds.has(l.id);
                  return (
                    <li
                      key={l.id}
                      className={`flex items-center gap-4 p-3 rounded-xl bg-card border card-shadow ${ativa ? "border-accent" : "border-border"}`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                        {l.photo_url ? <img {...imagemOtimizada(l.photo_url, { width: 160, crop: true })} loading="lazy" decoding="async" alt={l.name || "Logo"} className="w-full h-full object-cover" /> : <div className="w-full h-full dice-pattern" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={lojaPath(l)} className="inline-block py-1.5 font-600 hover:underline">{l.name}</Link>
                        {l.neighborhood && <p className="text-xs text-muted-foreground">{l.neighborhood}</p>}
                      </div>
                      {ativa && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-700 text-primary dark:text-accent">
                          <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> Parceira
                        </span>
                      )}
                      <Switch
                        checked={ativa}
                        disabled={salvandoParceria === l.id}
                        onCheckedChange={(v) => toggleParceria(l, v)}
                        aria-label={`Marcar ${l.name} como parceira`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div>
            {pendentes.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma sugestão pendente.</p>
            ) : (
              <div className="space-y-3">
                {pendentesOrdenados.map((e) => (
                  <div key={e.id} className="p-4 rounded-xl bg-card border border-border card-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <ArteEvento evento={e} className="w-16 h-20 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="font-600">{e.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.recurrence_type === "fixa" ? `Toda ${dayLabels[e.day_of_week]}` : formatarPeriodo(e)} · {e.start_time}
                        </p>
                        {e.suggested_by_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Sugerido por {e.suggested_by_name} {e.suggested_by_email ? `· ${e.suggested_by_email}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm"><Link to={eventoPath(e)} aria-label={`Ver detalhes da sugestão ${e.title}`}>Ver</Link></Button>
                        <Button size="sm" onClick={() => review(e.id, "approved")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Check className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => review(e.id, "rejected")} className="text-destructive border-destructive/40 hover:bg-destructive/10">
                          <X className="w-4 h-4 mr-1" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                    {e.description && <p className="text-sm text-muted-foreground mt-2">{e.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}