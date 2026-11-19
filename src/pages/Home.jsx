import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LojaCard from "@/components/LojaCard";
import EventoCard from "@/components/EventoCard";
import EstadoSkyline from "@/components/EstadoSkyline";
import EventosDeck from "@/components/EventosDeck";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CidadeFilter from "@/components/CidadeFilter";
import HomeSecoes from "@/components/HomeSecoes";
import useAreasHome from "@/lib/useAreasHome";
import DadoEvento from "@/components/DadoEvento";
import { vagasLink } from "@/lib/vagas";
import {
  Store,
  CalendarDays,
  ArrowRight,
  Locate,
  GraduationCap,
  Search,
  Newspaper,
  Users,
  BookOpen,
  Clapperboard,
  Briefcase,
  Mic,
  Map as MapIcon,
  BellRing,
  PackageOpen,
  Megaphone,
  FlaskConical,
} from "lucide-react";
import { abrirBusca } from "@/lib/busca";
import { ordenarPorProximaData, proximaOcorrencia } from "@/lib/eventStatus";
import { comFotoDaLoja } from "@/components/ArteEvento";
import { haversine } from "@/lib/geo";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { fetchParceriaIds, parceirasPrimeiro } from "@/lib/parcerias";
import { fetchDestaqueEventoIds, marcarDestaques, destacadosPrimeiro } from "@/lib/destaques";

const PERIODOS = [
  { id: "proximos", label: "Próximos", dias: null, vazio: "Nenhum evento marcado por enquanto." },
  { id: "hoje", label: "Hoje", dias: 1, vazio: "Nada marcado para hoje." },
  { id: "semana", label: "7 dias", dias: 7, vazio: "Nada marcado para os próximos 7 dias." },
  { id: "mes", label: "30 dias", dias: 30, vazio: "Nada marcado para os próximos 30 dias." },
];

// "Onde jogar e comprar": o mesmo bloco separa quem quer um lugar para jogar de quem quer comprar.
const TIPOS_ESPACO = [
  { id: "todos", label: "Todos", tipos: null },
  { id: "jogar", label: "Jogar", tipos: ["luderia", "cafe", "bar", "espaco"] },
  { id: "comprar", label: "Comprar", tipos: ["loja"] },
];
const DESTAQUE_ESPACOS = 6;
const DESTAQUE_EVENTOS = 3;
const NOMES_DIA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const chaveDia = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function SectionHeader({ eyebrow, title, text, to, linkLabel, titleId }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
      <div>
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">{eyebrow}</p>
        <h2 id={titleId} className="font-display font-700 text-3xl sm:text-4xl tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-lg">{text}</p>
      </div>
      <Link
        to={to}
        className="shrink-0 inline-flex items-center gap-1.5 min-h-11 py-2 text-sm font-600 text-primary dark:text-accent hover:underline"
      >
        {linkLabel} <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function GradeEventos({ eventos, filtroKey, rotulo }) {
  const [todos, setTodos] = useState(false);
  useEffect(() => {
    setTodos(false);
  }, [filtroKey]);
  // Os primeiros já são os próximos: a lista chega ordenada pela próxima data.
  const visiveis = todos ? eventos : eventos.slice(0, DESTAQUE_EVENTOS);
  const restam = eventos.length - visiveis.length;
  return (
    <div>
      <ul aria-label={rotulo} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((e) => (
          <li key={e.id} className="min-w-0 [&>*]:h-full [&>*]:w-full [&>*]:min-w-0">
            <EventoCard evento={e} compacto />
          </li>
        ))}
      </ul>
      {restam > 0 && (
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            onClick={() => setTodos(true)}
            className="h-11 min-h-11 lg:h-11 w-full sm:w-auto rounded-xl px-6 font-700 bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label={`Ver todos os ${eventos.length} eventos`}
          >
            Ver todos ({eventos.length})
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { sigla, info } = useEstado();
  const [cidade, setCidade] = useState("all");
  const [lojasBrutas, setLojas] = useState([]);
  const [parceriaIds, setParceriaIds] = useState(() => new Set());
  const [destaqueIds, setDestaqueIds] = useState(() => new Set());
  const [eventos, setEventos] = useState([]);
  const [counts, setCounts] = useState({ lojas: 0, eventos: 0 });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("proximos");
  const [dia, setDia] = useState("");
  const [soGratis, setSoGratis] = useState(false);
  const [tipoEspaco, setTipoEspaco] = useState("todos");
  const [pertoDeMim, setPertoDeMim] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Eventos e lojas liberam a página assim que chegam; contagens e parcerias
  // (que só enfeitam) completam depois, sem segurar a tela.
  useEffect(() => {
    let ativo = true;
    setCidade("all");
    setLoading(true);
    setCounts({ lojas: 0, eventos: 0 });
    const filtro = { status: "approved", ...filtroEstado(sigla) };
    const lojasP = base44.entities.Loja.filter(filtro, { sort: "-created_date", limit: 50, fields: ["name", "slug", "type", "photo_url", "neighborhood", "description", "tags", "estado", "cidade"] });
    const eventosP = base44.entities.Programacao.filter(filtro, { sort: "-created_date", limit: 100, fields: ["title", "slug", "photo_url", "gallery", "recurrence_type", "day_of_week", "event_date", "event_end_date", "start_time", "end_time", "loja_id", "loja_name", "location_name", "latitude", "longitude", "entrada", "valor", "publico", "tags", "estado", "cidade"] });
    Promise.all([lojasP, eventosP])
      .then(([lojasPage, eventosPage]) => {
        if (!ativo) return;
        setLojas(lojasPage.items || []);
        const proximos = (eventosPage.items || [])
          .map((e) => ({ ...e, _prox: proximaOcorrencia(e) }))
          .filter((e) => e._prox)
          .sort((a, b) => a._prox - b._prox || (a.start_time || "").localeCompare(b.start_time || ""));
        setEventos(proximos);
      })
      .catch(() => {})
      .finally(() => ativo && setLoading(false));
    Promise.all([base44.entities.Loja.count(filtro), base44.entities.Programacao.count(filtro)])
      .then(([l, e]) => ativo && setCounts({ lojas: l, eventos: e }))
      .catch(() => {});
    fetchParceriaIds().then((ids) => ativo && setParceriaIds(ids));
    fetchDestaqueEventoIds().then((ids) => ativo && setDestaqueIds(ids));
    return () => { ativo = false; };
  }, [sigla]);

  const areas = useAreasHome(sigla);
  const lojas = useMemo(() => parceirasPrimeiro(lojasBrutas, parceriaIds), [lojasBrutas, parceriaIds]);

  const fotosLoja = useMemo(() => {
    const fotos = new Map();
    for (const loja of lojas) if (loja.photo_url) fotos.set(loja.id, loja.photo_url);
    return fotos;
  }, [lojas]);
  const eventosComArte = useMemo(
    () => marcarDestaques(ordenarPorProximaData(eventos.map((e) => comFotoDaLoja(e, fotosLoja))), destaqueIds),
    [eventos, fotosLoja, destaqueIds]
  );
  const cidades = useMemo(() => cidadesDe([...eventosComArte, ...lojas]), [eventosComArte, lojas]);
  const eventosCidade = useMemo(() => (cidade === "all" ? eventosComArte : eventosComArte.filter((e) => cidadeDe(e) === cidade)), [eventosComArte, cidade]);
  // Eventos do plano Destaque abrem o baralho do topo.
  const destaques = useMemo(() => destacadosPrimeiro(eventosCidade).slice(0, 6), [eventosCidade]);
  const lojasCidade = useMemo(() => (cidade === "all" ? lojas : lojas.filter((l) => cidadeDe(l) === cidade)), [lojas, cidade]);
  const espacosTodos = lojasCidade.filter((l) => l.type !== "organizador" && l.type !== "editora");
  const editorasHome = lojasCidade.filter((l) => l.type === "editora");
  const gruposHome = lojasCidade.filter((l) => l.type === "organizador");
  // Quantos cadastros cada área tem, para os atalhos do alto mostrarem que há vida nelas.
  const contagemChip = {
    Monitores: areas.monitores.length, Editoras: editorasHome.length, Grupos: gruposHome.length, Lançamentos: areas.lancamentos.length,
    Influenciadores: areas.influencers.length, Podcasts: areas.podcasts.length, Vagas: areas.vagas.length,
    Matérias: areas.materias.length, Procuro: areas.procuras.length, Testadores: areas.testadores.length, Lugares: espacosTodos.length,
  };
  const tiposEspaco = TIPOS_ESPACO.find((t) => t.id === tipoEspaco);
  const espacos = (tiposEspaco.tipos ? espacosTodos.filter((l) => tiposEspaco.tipos.includes(l.type)) : espacosTodos).slice(0, DESTAQUE_ESPACOS);

  const togglePertoDeMim = (ativo) => {
    setGeoError("");
    if (!ativo) {
      setPertoDeMim(false);
      return;
    }
    if (userLoc) {
      setPertoDeMim(true);
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("Geolocalização não suportada neste navegador.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPertoDeMim(true);
        setLocating(false);
      },
      () => {
        setGeoError("Não foi possível obter sua localização.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const periodoAtual = PERIODOS.find((p) => p.id === periodo);
  const escolherPeriodo = (id) => {
    setPeriodo(id);
    setDia("");
  };
  const eventosPeriodo = useMemo(() => {
    const hoje = new Date();
    const limite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + periodoAtual.dias);
    let list = periodoAtual.dias ? eventosCidade.filter((e) => e._prox < limite) : eventosCidade;
    if (soGratis) list = list.filter((e) => e.entrada === "gratuito");
    return list;
  }, [eventosCidade, periodoAtual, soGratis]);
  // Os próximos 7 dias, com a quantidade de eventos de cada um.
  const dias = useMemo(() => {
    const hoje = new Date();
    return [...Array(7)].map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
      const chave = chaveDia(d);
      return {
        chave,
        nome: i === 0 ? "Hoje" : NOMES_DIA[d.getDay()],
        numero: d.getDate(),
        total: eventosPeriodo.filter((e) => chaveDia(e._prox) === chave).length,
      };
    });
  }, [eventosPeriodo]);
  const eventosFiltrados = useMemo(() => {
    let list = dia ? eventosPeriodo.filter((e) => chaveDia(e._prox) === dia) : eventosPeriodo;
    if (pertoDeMim && userLoc) {
      list = list.map((e) => ({
        ...e,
        _dist:
          typeof e.latitude === "number" && typeof e.longitude === "number"
            ? haversine(userLoc.lat, userLoc.lng, e.latitude, e.longitude)
            : null,
      }));
    }
    return ordenarPorProximaData(list);
  }, [eventosPeriodo, dia, pertoDeMim, userLoc]);
  const filtroKey = `${periodo}|${cidade}|${pertoDeMim}|${dia}|${soGratis}`;

  const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const verHoje = () => {
    escolherPeriodo("hoje");
    irPara("agenda");
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-board text-white">
        <div className="absolute inset-0 dice-pattern opacity-30" aria-hidden="true" />
        <EstadoSkyline className="absolute -bottom-4 right-0 w-[520px] max-w-none" />
        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-14 sm:pt-12 sm:pb-16 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="font-display font-900 text-3xl sm:text-5xl leading-[1.05] tracking-tight text-balance">
              Eventos de board game <span className="text-accent">{info.em}</span>
            </h1>
            <p className="mt-3 text-white/75 max-w-xl">
              O que está rolando, onde jogar, quem organiza e quem cria conteúdo — tudo num só lugar.
            </p>
            {!loading && (counts.eventos > 0 || counts.lojas > 0) && (
              <p className="mt-4 text-sm text-white/60">
                <span className="font-700 text-accent">{counts.eventos}</span> programações ·{" "}
                <span className="font-700 text-accent">{counts.lojas}</span> espaços, lojas e grupos
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" onClick={verHoje} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-700">
                Ver o que tem hoje <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          {destaques.length > 0 && <EventosDeck eventos={destaques} />}
        </div>
      </section>

      {/* Busca */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 -mt-8" aria-label="Buscar no site">
        <button
          type="button"
          onClick={abrirBusca}
          className="press flex min-h-14 w-full items-center gap-3 rounded-2xl bg-card px-5 text-left shadow-xl ring-1 ring-border/25 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-base text-muted-foreground">
            Buscar evento, lugar, monitor ou matéria…
          </span>
          <kbd className="hidden shrink-0 rounded-md border border-border px-2 py-0.5 text-xs font-600 text-muted-foreground sm:inline">/</kbd>
        </button>
      </section>

      {/* Atalhos: uma faixa só, sempre à vista (a descrição aparece ao passar o mouse) */}
      <nav className="max-w-6xl mx-auto px-4 pt-5" aria-label="Explore o site">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {[
            { to: "/lojas", titulo: "Lugares", texto: "Onde jogar e comprar jogos", icon: Store },
            { to: "/mapa", titulo: "Mapa", texto: "Lugares e eventos perto de você", icon: MapIcon },
            { to: "/seguindo", titulo: "Seguindo", texto: "Os eventos de quem você segue", icon: BellRing },
            { to: "/monitores", titulo: "Monitores", texto: "Quem ensina a jogar", icon: GraduationCap },
            { to: "/lojas?tipo=editora", titulo: "Editoras", texto: "Quem faz os jogos", icon: BookOpen },
            { to: "/lojas?tipo=organizador", titulo: "Grupos", texto: "Quem organiza os encontros", icon: Users },
            { to: "/lancamentos", titulo: "Lançamentos", texto: "Pré-vendas e jogos novos", icon: PackageOpen },
            { to: "/influencers", titulo: "Influenciadores", texto: "Canais e perfis sobre jogos", icon: Clapperboard },
            { to: "/podcasts", titulo: "Podcasts", texto: "Para ouvir sobre jogos", icon: Mic },
            { to: vagasLink(sigla, ""), titulo: "Vagas", texto: "Trabalhe com board games", icon: Briefcase },
            { to: "/materias", titulo: "Matérias", texto: "Notícias e fotos dos encontros", icon: Newspaper },
            { to: "/procuro", titulo: "Procuro", texto: "Gente para jogar, testar e criar jogos", icon: Megaphone },
            { to: "/testadores", titulo: "Testadores", texto: "Quem testa jogos em criação", icon: FlaskConical },
          ].map(({ to, titulo, texto, icon: Icon }) => (
            <li key={titulo} className="shrink-0">
              <Link
                to={to}
                title={texto}
                className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-600 shadow-sm ring-1 ring-border/25 transition-colors hover:bg-accent/20"
              >
                <Icon className="h-4 w-4 text-accent-ink" aria-hidden="true" />
                {titulo}
                {contagemChip[titulo] > 0 && (
                  <span className="rounded-full bg-accent/30 px-1.5 text-xs font-700 tabular-nums" aria-label={`${contagemChip[titulo]} cadastrados`}>{contagemChip[titulo]}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 1. Agenda */}
      <section id="agenda" className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <SectionHeader
          eyebrow="Agenda"
          title="Próximos eventos"
          text={`Toque em um dia para ver o que tem ${sigla === "DF" ? "em todo o DF" : "em " + info.nome}.`}
          to="/eventos"
          linkLabel="Ver agenda completa"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 -mt-3">
          <CidadeFilter cidades={cidades} value={cidade} onChange={(c) => { setCidade(c); setDia(""); }} className="h-11 lg:h-11" />
          <div role="group" aria-label="Período" className="inline-flex max-w-full flex-wrap rounded-xl bg-muted p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => escolherPeriodo(p.id)}
                aria-pressed={periodo === p.id}
                className={`min-h-11 px-3.5 sm:px-4 rounded-lg text-sm font-600 transition-colors ${
                  periodo === p.id ? "bg-accent text-accent-foreground font-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setSoGratis((v) => !v); setDia(""); }}
            aria-pressed={soGratis}
            className={`inline-flex items-center min-h-11 rounded-xl border px-3.5 text-sm font-600 transition-colors ${
              soGratis ? "border-transparent bg-accent text-accent-foreground font-700 shadow-sm" : "border-transparent bg-muted"
            }`}
          >
            Entrada grátis
          </button>
          <label className="inline-flex items-center gap-2.5 min-h-11 rounded-xl bg-muted px-3.5 py-2 text-sm font-500 cursor-pointer">
            <Locate className="w-4 h-4 text-accent-ink" aria-hidden="true" />
            {locating ? "Localizando…" : "Perto de mim"}
            <Switch checked={pertoDeMim} onCheckedChange={togglePertoDeMim} disabled={locating} aria-label="Mostrar a distância de cada evento" />
          </label>
        </div>
        {geoError && <p className="-mt-2 mb-4 text-sm text-destructive">{geoError}</p>}
        <div role="group" aria-label="Dia da semana" className="-mt-2 mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-8 lg:overflow-visible lg:px-0">
          <button
            type="button"
            onClick={() => setDia("")}
            aria-pressed={dia === ""}
            className={`flex min-h-16 shrink-0 flex-col items-center justify-center rounded-2xl border px-4 text-sm font-600 transition-colors ${
              dia === "" ? "border-transparent bg-accent text-accent-foreground shadow-md" : "border-border/25 bg-card shadow-sm hover:bg-muted"
            }`}
          >
            Todos
            <span className="text-xs font-500 opacity-80">{eventosPeriodo.length}</span>
          </button>
          {dias.map((d) => (
            <button
              key={d.chave}
              type="button"
              onClick={() => setDia(d.chave)}
              aria-pressed={dia === d.chave}
              aria-label={`${d.nome} ${d.numero}, ${d.total} ${d.total === 1 ? "evento" : "eventos"}`}
              className={`relative flex min-h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors lg:w-auto ${
                dia === d.chave ? "border-transparent bg-accent text-accent-foreground shadow-md" : "border-border/25 bg-card shadow-sm hover:bg-muted"
              }`}
            >
              <span className="text-xs font-600 opacity-80">{d.nome}</span>
              <b className="font-display text-xl font-700 leading-none">{d.numero}</b>
              <span
                className={`mt-1 h-1 w-1 rounded-full ${d.total > 0 ? "bg-accent-ink" : "bg-transparent"}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {loading ? (
          <ul aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </ul>
        ) : eventosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            {eventos.length === 0
              ? "Nenhuma programação cadastrada ainda."
              : dia
                ? "Nada marcado para este dia."
                : soGratis
                  ? "Nenhum evento gratuito neste período."
                  : periodoAtual.vazio}
            {eventos.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button type="button" variant="outline" className="min-h-11 font-600" onClick={() => { escolherPeriodo("proximos"); setSoGratis(false); }}>
                  Ver todos os próximos
                </Button>
                <Button asChild variant="outline" className="min-h-11 font-600"><Link to="/sugerir">Cadastrar um evento</Link></Button>
              </div>
            )}
          </div>
        ) : (
          <GradeEventos eventos={eventosFiltrados} filtroKey={filtroKey} rotulo="Próximos eventos" />
        )}
      </section>

      {/* Todas as outras áreas num bloco só: abas com a quantidade de cadastros */}
      <HomeSecoes areas={areas} editoras={editorasHome} grupos={gruposHome} parceriaIds={parceriaIds} />

      {eventosCidade.length > 0 && (
        <DadoEvento eventos={eventosCidade} escopoPadrao={cidade === "all" ? (sigla === "DF" ? "em todo o DF" : `em ${info.nome}`) : `em ${cidade}`} />
      )}

      {/* 2. Lojas & espaços */}
      <section className="bg-muted/50 border-y border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeader
            eyebrow="Lugares"
            title="Onde jogar e comprar"
            text="Espaços de jogos, cafés e lojas especializadas."
            to="/lojas"
            linkLabel="Ver todos os lugares"
          />
          <div role="group" aria-label="Tipo de lugar" className="-mt-3 mb-5 inline-flex max-w-full flex-wrap rounded-xl bg-muted p-1">
            {TIPOS_ESPACO.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoEspaco(t.id)}
                aria-pressed={tipoEspaco === t.id}
                className={`min-h-11 px-4 rounded-lg text-sm font-600 transition-colors ${
                  tipoEspaco === t.id ? "bg-accent text-accent-foreground font-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {loading ? (
            <ul aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="h-28 sm:h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </ul>
          ) : espacos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <Store className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
              {espacosTodos.length === 0 ? "Nenhuma loja ou espaço cadastrado ainda." : "Nada nesta categoria por enquanto."}
            </div>
          ) : (
            <ul aria-label="Lojas e espaços" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {espacos.map((l) => (
                <li key={l.id} className="min-w-0 [&>*]:h-full">
                  <LojaCard loja={l} parceira={parceriaIds.has(l.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA organizadores */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-board text-white p-8 sm:p-12">
          <EstadoSkyline forte className="hidden sm:block absolute -bottom-2 right-0 w-[520px] max-w-none" />
          <div className="relative max-w-xl">
            <h2 className="font-display font-700 text-3xl sm:text-4xl tracking-tight mb-3 text-balance">
              Organiza eventos ou tem um espaço de jogos?
            </h2>
            <p className="text-white/75 mb-7">
              Cadastre grátis e apareça para quem quer jogar {info.em}.
              Sabe de um evento que não está aqui? Dá para cadastrar sem conta.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-600">
                <Link to="/cadastrar">
                  Cadastrar agora <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/sugerir">Cadastrar evento</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
