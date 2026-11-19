import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import LancamentoCard from "@/components/LancamentoCard";
import { Button } from "@/components/ui/button";
import { PackageOpen, PlusCircle } from "lucide-react";
import { listarTudo, listarPorIds } from "@/lib/paginar";
import { lojaPath } from "@/lib/slug";
import { TIPOS_LANCAMENTO, situacao, ordenarLancamentos, mesAno } from "@/lib/lancamentos";

const ABAS = [
  { id: "aberto", label: "Abertos agora", vazio: "Nenhuma pré-venda ou campanha aberta agora." },
  { id: "em_breve", label: "Em breve", vazio: "Nenhum lançamento marcado ainda." },
  { id: "encerrado", label: "Já saíram", vazio: "Nada por aqui ainda." },
];

// Calendário nacional de pré-vendas, campanhas e lançamentos das editoras.
export default function Lancamentos() {
  const [itens, setItens] = useState([]);
  const [editoras, setEditoras] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState("aberto");
  const [tipo, setTipo] = useState("all");

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await listarTudo(base44.entities.Lancamento, { status: "publicado" }, { sort: "data_inicio", limit: 200 });
        if (!ativo) return;
        setItens(lista);
        // Começa na primeira aba com algo para ver.
        const primeira = ABAS.find((a) => lista.some((l) => situacao(l) === a.id));
        if (primeira) setAba(primeira.id);
        const ls = await listarPorIds(base44.entities.Loja, "id", lista.map((l) => l.editora_id), { fields: ["slug", "name"] }).catch(() => []);
        if (ativo) setEditoras(new Map(ls.map((l) => [l.id, l])));
      } catch (e) {
        if (ativo) setItens([]);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  const contagem = useMemo(() => {
    const c = { aberto: 0, em_breve: 0, encerrado: 0 };
    for (const l of itens) c[situacao(l)] += 1;
    return c;
  }, [itens]);

  const visiveis = useMemo(
    () => ordenarLancamentos(itens.filter((l) => situacao(l) === aba && (tipo === "all" || l.tipo === tipo))),
    [itens, aba, tipo]
  );
  // "Em breve" vira calendário por mês.
  const porMes = useMemo(() => {
    if (aba !== "em_breve") return null;
    const grupos = new Map();
    for (const l of visiveis) {
      const m = mesAno(l.data_inicio);
      if (!grupos.has(m)) grupos.set(m, []);
      grupos.get(m).push(l);
    }
    return [...grupos.entries()];
  }, [visiveis, aba]);

  const card = (l) => (
    <li key={l.id}>
      <LancamentoCard lancamento={l} editoraPath={editoras.get(l.editora_id) ? lojaPath(editoras.get(l.editora_id)) : ""} />
    </li>
  );
  const abaAtual = ABAS.find((a) => a.id === aba);

  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Lançamentos</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Pré-vendas e lançamentos</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          O calendário dos jogos novos das editoras do Brasil: pré-vendas abertas, campanhas de financiamento coletivo e o que chega às lojas.
        </p>
        <Button asChild className="mt-5 h-11 min-h-11 font-600">
          <Link to="/painel/lancamentos/novo"><PlusCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> É editora? Divulgue um lançamento</Link>
        </Button>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div role="group" aria-label="Quando" className="inline-flex max-w-full flex-wrap rounded-xl border border-border bg-card p-1">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAba(a.id)}
                aria-pressed={aba === a.id}
                className={`min-h-11 px-3.5 sm:px-4 rounded-lg text-sm font-600 transition-colors ${
                  aba === a.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.label}{!loading && ` (${contagem[a.id]})`}
              </button>
            ))}
          </div>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Tipo de lançamento"
            className="h-11 rounded-md border border-input bg-background px-3 text-base lg:text-sm"
          >
            <option value="all">Todos os tipos</option>
            {TIPOS_LANCAMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : visiveis.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <PackageOpen className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            {abaAtual.vazio}{" "}
            <Link to="/painel/lancamentos/novo" className="font-600 text-primary dark:text-accent hover:underline">Divulgue o seu</Link>
          </div>
        ) : porMes ? (
          porMes.map(([mes, lista]) => (
            <div key={mes} className="mb-8">
              <h2 className="font-display font-700 text-xl mb-3">{mes}</h2>
              <ul className="space-y-3">{lista.map(card)}</ul>
            </div>
          ))
        ) : (
          <ul className="space-y-3">{visiveis.map(card)}</ul>
        )}
      </section>
    </Layout>
  );
}
