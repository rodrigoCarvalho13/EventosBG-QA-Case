import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import MonitorCard from "@/components/MonitorCard";
import BuscaOpcao from "@/components/BuscaOpcao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Search, SlidersHorizontal } from "lucide-react";
import { ESTADOS, useEstado } from "@/lib/regiao";
import { listarTudo } from "@/lib/paginar";
import {
  bairrosDosMonitores,
  cidadesDosMonitores,
  estilosDosMonitores,
  filtrarMonitores,
  jogosDosMonitores,
  ordenarMonitores,
  servicosDosMonitores,
  tiposEventoDosMonitores,
} from "@/lib/monitores";

const POR_PAGINA = 12;

const CAMPOS = [
  "name", "slug", "photo_url", "bio", "jogos", "estilos", "servicos", "tipos_evento", "idade", "genero",
  "preco_hora",
  "locais", "estados", "cidades", "bairros", "nota_media", "total_avaliacoes", "publicado",
];

export default function Monitores() {
  const { sigla } = useEstado();
  const [brutos, setBrutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [debounced, setDebounced] = useState("");
  const [estado, setEstado] = useState(sigla);
  const [cidade, setCidade] = useState("all");
  const [bairro, setBairro] = useState("all");
  const [jogo, setJogo] = useState("all");
  const [estilo, setEstilo] = useState("all");
  const [servico, setServico] = useState("all");
  const [tipoEvento, setTipoEvento] = useState("all");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [notaMin, setNotaMin] = useState("all");
  const [ordem, setOrdem] = useState("nota");
  const [showFiltros, setShowFiltros] = useState(false);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setEstado(sigla);
    setCidade("all");
    setBairro("all");
  }, [sigla]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      setLoading(true);
      try {
        const itens = await listarTudo(
          base44.entities.Monitor,
          { publicado: true },
          { sort: "-created_date", limit: 100, fields: CAMPOS }
        );
        if (vivo) setBrutos(itens);
      } catch {
        if (vivo) setBrutos([]);
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  const daRegiao = useMemo(
    () => brutos.filter((m) => estado === "all" || (m.estados || []).includes(estado)),
    [brutos, estado]
  );
  const cidades = useMemo(() => cidadesDosMonitores(brutos, estado), [brutos, estado]);
  const bairros = useMemo(() => bairrosDosMonitores(brutos, estado, cidade), [brutos, estado, cidade]);
  const jogos = useMemo(() => jogosDosMonitores(daRegiao), [daRegiao]);
  const estilos = useMemo(() => estilosDosMonitores(daRegiao), [daRegiao]);
  const servicos = useMemo(() => servicosDosMonitores(daRegiao), [daRegiao]);
  const tiposEvento = useMemo(() => tiposEventoDosMonitores(daRegiao), [daRegiao]);
  const lista = useMemo(() => ordenarMonitores(filtrarMonitores(brutos, {
    busca: debounced,
    estado,
    cidade,
    bairro,
    jogo,
    estilo,
    servico,
    tipoEvento,
    precoMin,
    precoMax,
    notaMin: notaMin === "all" ? "" : notaMin,
  }), ordem), [brutos, debounced, estado, cidade, bairro, jogo, estilo, servico, tipoEvento, precoMin, precoMax, notaMin, ordem]);

  useEffect(() => {
    setPagina(1);
  }, [debounced, estado, cidade, bairro, jogo, estilo, servico, tipoEvento, precoMin, precoMax, notaMin, ordem]);

  const visiveis = lista.slice(0, pagina * POR_PAGINA);

  const filtrosAtivos = [estado !== sigla ? estado : "all", cidade, bairro, jogo, estilo, servico, tipoEvento, precoMin, precoMax, notaMin].filter((v) => v && v !== "all").length;

  const limpar = () => {
    setBusca("");
    setDebounced("");
    setEstado(sigla);
    setCidade("all");
    setBairro("all");
    setJogo("all");
    setEstilo("all");
    setServico("all");
    setTipoEvento("all");
    setPrecoMin("");
    setPrecoMax("");
    setNotaMin("all");
    setOrdem("nota");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5">
              <GraduationCap className="w-8 h-8 text-primary" aria-hidden="true" /> Monitores
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Pessoas que ensinam e conduzem jogos de tabuleiro. Veja a agenda, peça um horário e combine o valor direto com quem vai facilitar a mesa.
            </p>
          </div>
          <Button asChild className="shrink-0 max-lg:mr-20">
            <Link to="/painel/monitor">Quero ser monitor</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-2 max-lg:pr-20">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar monitor ou jogo…"
                aria-label="Buscar monitor"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="sm:hidden shrink-0"
              onClick={() => setShowFiltros((v) => !v)}
              aria-expanded={showFiltros}
              aria-controls="filtros-monitores"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filtros{filtrosAtivos > 0 ? ` (${filtrosAtivos})` : ""}
            </Button>
          </div>
          <div id="filtros-monitores" className={`${showFiltros ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`}>
            <Select value={estado} onValueChange={(v) => { setEstado(v); setCidade("all"); setBairro("all"); }}>
              <SelectTrigger aria-label="Estado"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {ESTADOS.map((e) => <SelectItem key={e.sigla} value={e.sigla}>{e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={cidades.includes(cidade) || cidade === "all" ? cidade : "all"} onValueChange={(v) => { setCidade(v); setBairro("all"); }}>
              <SelectTrigger aria-label="Cidade"><SelectValue placeholder="Cidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cidades.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={bairros.includes(bairro) || bairro === "all" ? bairro : "all"} onValueChange={setBairro}>
              <SelectTrigger aria-label="Bairro"><SelectValue placeholder="Bairro" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bairros</SelectItem>
                {bairros.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={servicos.includes(servico) || servico === "all" ? servico : "all"} onValueChange={setServico}>
              <SelectTrigger aria-label="Tipo de serviço"><SelectValue placeholder="Serviço" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {servicos.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={estilos.includes(estilo) || estilo === "all" ? estilo : "all"} onValueChange={setEstilo}>
              <SelectTrigger aria-label="Estilo de jogo"><SelectValue placeholder="Estilo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estilos</SelectItem>
                {estilos.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <BuscaOpcao
              id="filtro-jogo"
              rotulo="Jogo que ensina"
              value={jogos.includes(jogo) || jogo === "all" ? jogo : "all"}
              onChange={setJogo}
              opcoes={jogos}
              vazio="Todos os jogos"
              placeholder="Buscar jogo…"
            />
            <Select value={tiposEvento.includes(tipoEvento) || tipoEvento === "all" ? tipoEvento : "all"} onValueChange={setTipoEvento}>
              <SelectTrigger aria-label="Tipo de evento"><SelectValue placeholder="Evento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {tiposEvento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger aria-label="Ordenação"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nota">Melhor avaliados</SelectItem>
                <SelectItem value="preco">Menor preço</SelectItem>
                <SelectItem value="avaliacoes">Mais avaliações</SelectItem>
              </SelectContent>
            </Select>
            <Select value={notaMin} onValueChange={setNotaMin}>
              <SelectTrigger aria-label="Nota mínima"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer nota</SelectItem>
                <SelectItem value="3">Nota 3 ou mais</SelectItem>
                <SelectItem value="4">Nota 4 ou mais</SelectItem>
                <SelectItem value="5">Nota 5</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={precoMin}
                onChange={(e) => setPrecoMin(e.target.value)}
                placeholder="Preço mín."
                aria-label="Preço mínimo"
              />
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={precoMax}
                onChange={(e) => setPrecoMax(e.target.value)}
                placeholder="Preço máx."
                aria-label="Preço máximo"
              />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
              A faixa de preço usa o valor mínimo por hora.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border px-4">
            <GraduationCap className="w-8 h-8 mx-auto mb-3 text-accent-ink" aria-hidden="true" />
            <p className="text-muted-foreground">
              {brutos.length === 0
                ? "Ainda não há monitores publicados."
                : "Nenhum monitor encontrado com esses filtros."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {brutos.length > 0 && (
                <Button type="button" variant="outline" onClick={limpar}>Limpar filtros</Button>
              )}
              <Button asChild>
                <Link to="/painel/monitor">Cadastrar meu perfil</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{lista.length} {lista.length === 1 ? "monitor" : "monitores"}</p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visiveis.map((m) => (
                <li key={m.id} className="min-w-0">
                  <MonitorCard monitor={m} />
                </li>
              ))}
            </ul>
            {visiveis.length < lista.length && (
              <div className="mt-6 flex justify-center">
                <Button type="button" variant="outline" onClick={() => setPagina((p) => p + 1)}>
                  Mostrar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
