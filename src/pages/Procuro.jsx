import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import ProcuraCard from "@/components/ProcuraCard";
import ComoFuncionaProcuro from "@/components/ComoFuncionaProcuro";
import CidadeFilter from "@/components/CidadeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Megaphone } from "lucide-react";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { CANAIS, canal as infoCanal, vencido } from "@/lib/procuro";
import { casa } from "@/lib/busca";

// Classificados "Procuro": gente para jogar, grupo, playtest, parceria para criar jogo, um jogo…
export default function Procuro() {
  const { sigla, info } = useEstado();
  const [params, setParams] = useSearchParams();
  const canal = params.get("canal") || "todos";
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("all");

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setCidade("all");
    // Os do estado escolhido e os online de qualquer lugar.
    Promise.all([
      base44.entities.Procura.filter({ status: "ativo", ...filtroEstado(sigla) }, { sort: "-created_date", limit: 200 }),
      base44.entities.Procura.filter({ status: "ativo", modalidade: "online" }, { sort: "-created_date", limit: 100 }),
    ])
      .then(([a, b]) => {
        if (!ativo) return;
        const porId = new Map([...(a.items || []), ...(b.items || [])].map((p) => [p.id, p]));
        setItens([...porId.values()].filter((p) => !vencido(p)).sort((x, y) => (y.renovado_em || y.created_date || "").localeCompare(x.renovado_em || x.created_date || "")));
      })
      .catch(() => ativo && setItens([]))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [sigla]);

  const mudarCanal = (c) => {
    const novo = new URLSearchParams(params);
    if (c === "todos") novo.delete("canal"); else novo.set("canal", c);
    setParams(novo, { replace: true });
  };

  const contagem = useMemo(() => {
    const m = new Map();
    for (const p of itens) m.set(p.canal, (m.get(p.canal) || 0) + 1);
    return m;
  }, [itens]);
  const presenciais = useMemo(() => itens.filter((p) => p.modalidade !== "online"), [itens]);
  const cidades = useMemo(() => cidadesDe(presenciais), [presenciais]);
  const filtrados = useMemo(
    () =>
      itens.filter((p) => {
        if (canal !== "todos" && p.canal !== canal) return false;
        if (cidade !== "all" && p.modalidade !== "online" && cidadeDe(p) !== cidade) return false;
        return casa(busca, p.titulo, p.descricao, p.jogo, p.bairro, p.cidade, p.autor_nome);
      }),
    [itens, canal, cidade, busca]
  );
  const canalAtual = canal === "todos" ? null : infoCanal(canal);

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Classificados</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Procuro</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Falta gente na mesa? Quer testar seu protótipo, achar um grupo ou aquele jogo esgotado? Anuncie o que você procura {info.em || `em ${info.nome}`} e online.
        </p>
        <Button asChild size="lg" className="mt-5 h-12 font-700">
          <Link to={`/painel/procuro/novo${canal !== "todos" ? `?canal=${canal}` : ""}`}>
            <PlusCircle className="w-5 h-5 mr-1.5" aria-hidden="true" /> Anunciar o que procuro
          </Link>
        </Button>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div role="group" aria-label="Canais" className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {[{ value: "todos", curto: "Todos" }, ...CANAIS].map((c) => {
            const n = c.value === "todos" ? itens.length : contagem.get(c.value) || 0;
            const ativo = canal === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => mudarCanal(c.value)}
                aria-pressed={ativo}
                className={`shrink-0 inline-flex items-center gap-1.5 min-h-11 rounded-full border px-4 text-sm font-600 transition-colors ${
                  ativo ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.icon && <c.icon className="w-4 h-4" aria-hidden="true" />}
                {c.curto}
                {!loading && <span className="opacity-70">{n}</span>}
              </button>
            );
          })}
        </div>
        {canalAtual && <p className="mt-2 text-sm text-muted-foreground">{canalAtual.texto}</p>}
        {canal === "playtest" && (
          <p className="mt-1 text-sm">
            <Link to="/testadores" className="font-600 text-primary dark:text-accent hover:underline">Veja também os testadores cadastrados</Link>
          </p>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por jogo, bairro ou palavra" aria-label="Buscar anúncios" className="pl-9 h-11" />
          </div>
          <CidadeFilter cidades={cidades} value={cidade} onChange={setCidade} className="h-11 lg:h-11" />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}</div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            {itens.length === 0 ? "Nenhum anúncio por aqui ainda. Seja a primeira pessoa a anunciar!" : "Nenhum anúncio com esses filtros."}
            <div className="mt-4">
              <Button asChild className="h-11 font-600">
                <Link to={`/painel/procuro/novo${canal !== "todos" ? `?canal=${canal}` : ""}`}>Anunciar o que procuro</Link>
              </Button>
            </div>
            {canalAtual && <p className="mt-3 text-xs">Exemplo: “{canalAtual.exemplo}”</p>}
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtrados.map((p) => <li key={p.id} className="min-w-0"><ProcuraCard procura={p} /></li>)}
          </ul>
        )}
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-6">
        <ComoFuncionaProcuro />
      </div>
    </Layout>
  );
}
