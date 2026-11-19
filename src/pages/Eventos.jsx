import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import CalendarioMensal from "@/components/CalendarioMensal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Search, MapPin, Locate, History, SlidersHorizontal, X } from "lucide-react";
import EventoCard from "@/components/EventoCard";
import { fetchDestaqueEventoIds, marcarDestaques } from "@/lib/destaques";
import { comFotoDaLoja } from "@/components/ArteEvento";
import { isEventoPassado, ordenarPorProximaData, proximaOcorrencia } from "@/lib/eventStatus";
import CidadeFilter from "@/components/CidadeFilter";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { SUGGESTED_TAGS } from "@/lib/tags";
import { haversine } from "@/lib/geo";
import { casa } from "@/lib/busca";

const RADIUS_KM = 20;

function BuscaVazia({ termo, temFiltro, onLimpar, passado = false }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <Search className="w-8 h-8 mx-auto mb-3 text-accent-ink" aria-hidden="true" />
      <p className="font-display font-700 text-lg">
        {termo
          ? `Nenhuma programação encontrada para “${termo}”.`
          : passado
            ? "Nenhum evento passado encontrado com esses filtros."
            : "Nenhuma programação encontrada com esses filtros."}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {termo ? "Tente outro nome ou limpe a busca e os filtros." : "Ajuste ou limpe os filtros para ver a programação."}
      </p>
      {temFiltro && (
        <Button type="button" variant="outline" onClick={onLimpar} className="mt-5">
          <X className="w-4 h-4 mr-1.5" aria-hidden="true" /> Limpar filtros
        </Button>
      )}
    </div>
  );
}

export default function Eventos() {
  const { sigla, info } = useEstado();
  const [cidade, setCidade] = useState("all");
  const [items, setItems] = useState([]);
  const [fotosLoja, setFotosLoja] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [recurrence, setRecurrence] = useState("all");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhood, setNeighborhood] = useState("all");
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [period, setPeriod] = useState("ativos");
  const [tag, setTag] = useState("all");
  const [showFiltros, setShowFiltros] = useState(false);
  // Em "Próximos": calendário ou lista do que ainda vem no mês / no ano.
  // No celular o calendário só mostra pontinhos; abre em lista e o calendário fica como opção.
  const [visao, setVisao] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches ? "ano" : "calendario"
  );

  useEffect(() => {
    (async () => {
      try {
        const [d, lojasPage] = await Promise.all([
          base44.entities.Programacao.filter({ status: "approved", ...filtroEstado(sigla) }, { distinct: "neighborhood" }),
          base44.entities.Loja.filter({ status: "approved", ...filtroEstado(sigla) }, { limit: 200, fields: ["photo_url"] }),
        ]);
        setNeighborhoods((d.items || []).filter(Boolean));
        const fotos = new Map();
        for (const loja of lojasPage.items || []) if (loja.photo_url) fotos.set(loja.id, loja.photo_url);
        setFotosLoja(fotos);
      } catch (e) {}
    })();
    setNeighborhood("all");
    setCidade("all");
  }, [sigla]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const query = { status: "approved", ...filtroEstado(sigla) };
        if (recurrence !== "all") query.recurrence_type = recurrence;
        if (neighborhood !== "all") query.neighborhood = neighborhood;
        if (tag !== "all") query.tags = tag;
        if (period === "passados") {
          query.recurrence_type = "unica";
          const d = new Date();
          query.event_date = {
            $lte: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
          };
        }
        const sort = period === "passados" ? "-event_date" : "event_date";
        const [page, destaqueIds] = await Promise.all([
          base44.entities.Programacao.filter(query, { sort, limit: 200 }),
          fetchDestaqueEventoIds(),
        ]);
        setItems(marcarDestaques(page.items || [], destaqueIds));
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [recurrence, neighborhood, period, tag, sigla]);

  const filtrosAtivos = [recurrence, neighborhood, tag].filter((v) => v !== "all").length + (userLoc ? 1 : 0) + (cidade !== "all" ? 1 : 0);
  const termoBusca = search.trim();
  const temFiltro = Boolean(termoBusca) || filtrosAtivos > 0;

  const limparFiltros = () => {
    setSearch("");
    setRecurrence("all");
    setNeighborhood("all");
    setTag("all");
    setCidade("all");
    setUserLoc(null);
    setGeoError("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalização não suportada neste navegador.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError("Não foi possível obter sua localização.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const cidades = useMemo(() => cidadesDe(items), [items]);
  // A busca olha o título, o espaço, o local, o bairro, a cidade, as tags e o dia (sem acento); "grátis" acha os gratuitos.
  const itemsBusca = useMemo(() => {
    const termo = search.trim();
    if (!termo) return items;
    return items.filter((e) =>
      casa(termo, e.title, e.loja_name, e.location_name, e.neighborhood, e.cidade, e.tags, e.recurrence_type === "fixa" ? e.day_of_week : "", e.entrada === "gratuito" ? "gratis gratuito" : "")
    );
  }, [items, search]);
  const itemsCidade = useMemo(() => (cidade === "all" ? itemsBusca : itemsBusca.filter((e) => cidadeDe(e) === cidade)), [itemsBusca, cidade]);

  const visibleItems = useMemo(() => {
    const base = period === "passados"
      ? itemsCidade.filter((e) => isEventoPassado(e))
      : itemsCidade.filter((e) => !isEventoPassado(e));
    const list = ordenarPorProximaData(base.map((e) => comFotoDaLoja(e, fotosLoja)));
    if (!userLoc) return list;
    return list
      .map((e) => {
        const dist =
          typeof e.latitude === "number" && typeof e.longitude === "number"
            ? haversine(userLoc.lat, userLoc.lng, e.latitude, e.longitude)
            : null;
        return { ...e, _dist: dist };
      })
      .filter((e) => e._dist != null && e._dist <= RADIUS_KM);
  }, [itemsCidade, userLoc, period, fotosLoja]);

  const VISOES = [
    { id: "calendario", label: "Calendário" },
    { id: "mes", label: "Este mês" },
    { id: "ano", label: "Todos os próximos" },
  ];
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const lista = useMemo(() => {
    if (period !== "ativos" || visao === "calendario") return null;
    const hoje = new Date();
    const fim = visao === "mes"
      ? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
      : new Date(hoje.getFullYear() + 1, 0, 1);
    const comData = ordenarPorProximaData(
      visibleItems
        .map((e) => ({ ...e, _prox: proximaOcorrencia(e) }))
        .filter((e) => e._prox && e._prox < fim)
    );
    const grupos = [];
    for (const e of comData) {
      const chave = `${e._prox.getFullYear()}-${e._prox.getMonth()}`;
      let g = grupos.find((x) => x.chave === chave);
      if (!g) grupos.push((g = { chave, titulo: `${MESES[e._prox.getMonth()]} ${e._prox.getFullYear()}`, itens: [] }));
      g.itens.push(e);
    }
    return { grupos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleItems, period, visao]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <CalendarDays className="w-8 h-8 text-primary" /> Agenda
        </h1>
        <p className="text-muted-foreground mb-6">Encontros fixos, feiras, feirões e eventos especiais {info.em}, organizados por mês.</p>

        <div className="inline-flex rounded-xl bg-muted p-1 mb-6">
          <button
            onClick={() => setPeriod("ativos")}
            className={`min-h-11 lg:min-h-0 px-4 py-2.5 lg:py-1.5 rounded-md text-sm font-600 transition-colors ${
              period === "ativos" ? "bg-accent text-accent-foreground font-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setPeriod("passados")}
            className={`min-h-11 lg:min-h-0 px-4 py-2.5 lg:py-1.5 rounded-md text-sm font-600 transition-colors inline-flex items-center ${
              period === "passados" ? "bg-accent text-accent-foreground font-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4 mr-1.5" /> Passados
          </button>
        </div>

        {period === "ativos" && (
          <div role="group" aria-label="Como ver" className="flex flex-wrap gap-2 mb-6 -mt-2">
            {VISOES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisao(v.id)}
                aria-pressed={visao === v.id}
                className={`min-h-11 lg:min-h-0 px-3.5 py-2 rounded-full text-sm font-600 border transition-colors ${
                  visao === v.id ? "bg-accent text-accent-foreground font-700 border-transparent shadow-sm" : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-8">
          <div className="flex gap-2 flex-1">
          <div className="relative flex-1 sm:min-w-[15rem]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar evento ou local…"
              aria-label="Buscar evento por nome, local, bairro, tag ou grátis"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="sm:hidden shrink-0"
            onClick={() => setShowFiltros((v) => !v)}
            aria-expanded={showFiltros}
            aria-controls="filtros-eventos"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filtros{filtrosAtivos > 0 ? ` (${filtrosAtivos})` : ""}
          </Button>
          </div>
          <div id="filtros-eventos" className={`${showFiltros ? "flex" : "hidden"} sm:contents flex-col gap-3`}>
          <Select value={recurrence} onValueChange={setRecurrence}>
            <SelectTrigger className="sm:w-48" aria-label="Tipo de recorrência"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="todoseventos">Todos os eventos</SelectItem>
              <SelectItem value="fixa" data-testid="todasemana">Toda semana</SelectItem>
              <SelectItem value="unica" data-testid="eventosespeciais">Eventos especiais</SelectItem>
            </SelectContent>
          </Select>
          <CidadeFilter cidades={cidades} value={cidade} onChange={setCidade} />
          <Select value={neighborhood} onValueChange={setNeighborhood}>
            <SelectTrigger className="sm:w-48" aria-label="Bairro"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="sm:w-44" aria-label="Tema"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os temas</SelectItem>
              {SUGGESTED_TAGS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={useMyLocation} disabled={locating} className="sm:w-auto justify-start">
            <Locate className="w-4 h-4 mr-1.5" />
            {locating ? "Localizando…" : "Próximos de mim"}
          </Button>
          </div>
        </div>

        {geoError && <p className="mb-3 text-sm text-destructive">{geoError}</p>}
        {userLoc && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-accent/10 border border-accent/30 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-accent-ink" aria-hidden="true" /> Mostrando eventos próximos (raio de {RADIUS_KM} km)
            </span>
            <button onClick={() => setUserLoc(null)} className="inline-flex items-center min-h-11 px-3 text-sm font-600 text-muted-foreground hover:text-foreground">
              Limpar
            </button>
          </div>
        )}

        {period === "passados" ? (
          loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <BuscaVazia termo={termoBusca} temFiltro={temFiltro} onLimpar={limparFiltros} passado />
          ) : (
            <div className="space-y-3">
              {visibleItems.map((e) => (
                <EventoCard key={e.id} evento={e} largo />
              ))}
            </div>
          )
        ) : lista ? (
          loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : lista.grupos.length === 0 ? (
            temFiltro ? (
              <BuscaVazia termo={termoBusca} temFiltro={temFiltro} onLimpar={limparFiltros} />
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center bg-card rounded-xl border border-border">
                {visao === "mes" ? "Nada mais marcado para este mês." : "Nada mais marcado para este ano."}
              </p>
            )
          ) : (
            <div className="space-y-10">
              {lista.grupos.map((g) => (
                <section key={g.chave}>
                  <h2 className="font-display font-700 text-2xl mb-3">
                    {g.titulo} <span className="text-muted-foreground font-500 text-base">· {g.itens.length} {g.itens.length === 1 ? "evento" : "eventos"}</span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {g.itens.map((e) => (
                      <EventoCard key={e.id} evento={e} largo />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : !loading && visibleItems.length === 0 && temFiltro ? (
          <BuscaVazia termo={termoBusca} temFiltro={temFiltro} onLimpar={limparFiltros} />
        ) : (
          <CalendarioMensal eventos={visibleItems} loading={loading} />
        )}
      </div>
    </Layout>
  );
}