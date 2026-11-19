import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LojaCard from "@/components/LojaCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Search, Star, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import CidadeFilter from "@/components/CidadeFilter";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { fetchParceriaIds } from "@/lib/parcerias";
import { SUGGESTED_TAGS } from "@/lib/tags";

const typeFilters = [
  { value: "all", label: "Todos os tipos" },
  { value: "luderia", label: "Espaços de jogos" },
  { value: "loja", label: "Lojas" },
  { value: "cafe", label: "Cafés" },
  { value: "bar", label: "Bares" },
  { value: "espaco", label: "Outros espaços" },
  { value: "organizador", label: "Grupos" },
  { value: "editora", label: "Editoras" },
];

// Lista compacta no celular, grade de até 4 colunas no desktop.
const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5";

const ORDEM_TIPOS = typeFilters.filter((f) => f.value !== "all").map((f) => f.value);

function agruparPorTipo(lista) {
  const grupos = ORDEM_TIPOS.map((tipo) => ({
    tipo,
    titulo: typeFilters.find((f) => f.value === tipo)?.label || "Outros",
    itens: lista.filter((l) => l.type === tipo),
  })).filter((g) => g.itens.length > 0);
  const conhecidos = new Set(ORDEM_TIPOS);
  const resto = lista.filter((l) => !conhecidos.has(l.type));
  if (resto.length) grupos.push({ tipo: "outros", titulo: "Outros", itens: resto });
  return grupos;
}

// Só o que o card usa: evita trazer produtos, galeria etc. de cada loja.
const LOJA_CARD_FIELDS = ["name", "slug", "type", "photo_url", "neighborhood", "description", "tags", "estado", "cidade"];

export default function Lojas() {
  const { sigla, info } = useEstado();
  const [cidade, setCidade] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  // Aceita ?tipo=organizador (ex.: "Ver todos os grupos" na página inicial).
  const { search: queryString } = useLocation();
  const tipoDaUrl = () => {
    const t = new URLSearchParams(queryString).get("tipo");
    return typeFilters.some((o) => o.value === t) ? t : "all";
  };
  const [type, setType] = useState(tipoDaUrl);
  // Clicar em "Editoras" no menu só muda a URL (a página é a mesma): acompanha o ?tipo=.
  useEffect(() => {
    setType(tipoDaUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhood, setNeighborhood] = useState("all");
  const [tag, setTag] = useState("all");
  const [showFiltros, setShowFiltros] = useState(false);
  const filtrosAtivos = [neighborhood, tag].filter((v) => v !== "all").length;
  const [parceriaIds, setParceriaIds] = useState(() => new Set());
  const loadedOnce = useRef(false);
  const [contagem, setContagem] = useState({});

  useEffect(() => {
    fetchParceriaIds().then(setParceriaIds);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        const d = await base44.entities.Loja.filter({ status: "approved", ...filtroEstado(sigla) }, { distinct: "neighborhood" });
        setNeighborhoods((d.items || []).filter(Boolean));
      } catch (e) {}
    })();
    (async () => {
      try {
        const d = await base44.entities.Loja.filter({ status: "approved", ...filtroEstado(sigla) }, { fields: ["type"], limit: 500 });
        const c = {};
        (d.items || []).forEach((l) => { c[l.type] = (c[l.type] || 0) + 1; });
        setContagem(c);
      } catch (e) {}
    })();
    setNeighborhood("all");
    setCidade("all");
  }, [sigla]);

  useEffect(() => {
    let stale = false;
    (async () => {
      if (loadedOnce.current) {
        setFilterLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const query = { status: "approved", ...filtroEstado(sigla) };
        if (type !== "all") query.type = type;
        if (neighborhood !== "all") query.neighborhood = neighborhood;
        if (tag !== "all") query.tags = tag;
        if (debouncedSearch.trim()) query.name = { $regex: debouncedSearch.trim(), $options: "i" };
        const page = await base44.entities.Loja.filter(query, { sort: "-created_date", limit: 50, fields: LOJA_CARD_FIELDS });
        if (!stale) setItems(page.items || []);
      } catch (e) {
        if (!stale) setItems([]);
      } finally {
        if (!stale) {
          loadedOnce.current = true;
          setLoading(false);
          setFilterLoading(false);
        }
      }
    })();
    return () => { stale = true; };
  }, [type, neighborhood, debouncedSearch, tag, sigla]);

  const cidades = useMemo(() => cidadesDe(items), [items]);
  const itemsCidade = cidade === "all" ? items : items.filter((l) => cidadeDe(l) === cidade);
  const parceiras = itemsCidade.filter((l) => parceriaIds.has(l.id));
  const outras = itemsCidade.filter((l) => !parceriaIds.has(l.id));
  const agrupar = type === "all";
  const gruposParceiras = agrupar ? agruparPorTipo(parceiras) : [];
  const gruposOutras = agrupar ? agruparPorTipo(outras) : [];
  const tituloPagina = type === "all" ? "Lugares" : (typeFilters.find((f) => f.value === type)?.label || "Lugares");

  return (
    <Layout>
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <Store className="w-8 h-8 text-primary" /> {tituloPagina}
        </h1>
        <p className="text-muted-foreground mb-6">Encontre espaços para jogar e comprar jogos {info.em}.</p>

        <div role="tablist" aria-label="Tipo de espaço" className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 mb-4 [scrollbar-width:none]">
          {typeFilters.map((f) => {
            const n = f.value === "all" ? Object.values(contagem).reduce((a, b) => a + b, 0) : contagem[f.value] || 0;
            if (f.value !== "all" && n === 0 && type !== f.value) return null;
            const ativo = type === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setType(f.value)}
                className={`shrink-0 whitespace-nowrap min-h-10 px-3.5 rounded-full border text-sm font-600 transition-colors ${
                  ativo
                    ? "bg-accent text-accent-foreground border-transparent font-700 shadow-sm"
                    : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {f.value === "all" ? "Todos" : f.label}
                {n > 0 && <span className="ml-1.5 opacity-70 font-500">{n}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome…"
              aria-label="Buscar loja por nome"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="sm:hidden shrink-0"
            onClick={() => setShowFiltros((v) => !v)}
            aria-expanded={showFiltros}
            aria-controls="filtros-lojas"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filtros{filtrosAtivos > 0 ? ` (${filtrosAtivos})` : ""}
          </Button>
          </div>
          <div id="filtros-lojas" className={`${showFiltros ? "flex" : "hidden"} sm:contents flex-col gap-3`}>
          <CidadeFilter cidades={cidades} value={cidade} onChange={setCidade} />
          <Select value={neighborhood} onValueChange={setNeighborhood}>
            <SelectTrigger className="sm:w-52" aria-label="Bairro"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="bairroDropdown">Todos os bairros</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="sm:w-48" aria-label="Tema"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="temaDropdown">Todos os temas</SelectItem>
              {SUGGESTED_TAGS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>

        {loading ? (
          <div className={GRID}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 sm:h-auto sm:aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : itemsCidade.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhuma loja encontrada.</p>
          </div>
        ) : (
          <div className={filterLoading ? "opacity-60 transition-opacity duration-150" : "transition-opacity duration-150"}>
            {parceiras.length > 0 && (
              <section aria-labelledby="parceiras-titulo" className="mb-10 rounded-3xl bg-accent/10 border border-accent/30 p-5 sm:p-6">
                <h2 id="parceiras-titulo" className="font-display font-700 text-xl sm:text-2xl flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-primary dark:text-accent fill-current" aria-hidden="true" /> Parceiras do hub
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Quem apoia o eventosboardgame.com.</p>
                {agrupar ? (
                  <div className="space-y-8">
                    {gruposParceiras.map((g) => (
                      <div key={g.tipo}>
                        {gruposParceiras.length > 1 && (
                          <h3 className="font-display font-700 text-lg mb-3">{g.titulo}</h3>
                        )}
                        <div className={GRID}>
                          {g.itens.map((l) => (
                            <LojaCard key={l.id} loja={l} parceira />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={GRID}>
                    {parceiras.map((l) => (
                      <LojaCard key={l.id} loja={l} parceira />
                    ))}
                  </div>
                )}
              </section>
            )}
            {outras.length > 0 && (
              <div className={parceiras.length > 0 ? "mt-2 space-y-10" : "space-y-10"}>
                {agrupar ? (
                  gruposOutras.map((g) => (
                    <section key={g.tipo} aria-labelledby={`tipo-${g.tipo}`}>
                      <h2 id={`tipo-${g.tipo}`} className="font-display font-700 text-xl sm:text-2xl mb-5">{g.titulo}</h2>
                      <div className={GRID}>
                        {g.itens.map((l) => (
                          <LojaCard key={l.id} loja={l} />
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <section aria-label={tituloPagina}>
                    <div className={GRID}>
                      {outras.map((l) => (
                        <LojaCard key={l.id} loja={l} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}