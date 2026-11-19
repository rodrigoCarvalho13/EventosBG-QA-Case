import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import VagaCard from "@/components/VagaCard";
import CidadeFilter from "@/components/CidadeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Search, PlusCircle } from "lucide-react";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { CONTRATACOES } from "@/lib/vagas";

const selectClass = "h-11 rounded-md border border-input bg-background px-3 text-base lg:text-sm";

export default function Vagas() {
  const { sigla, info, setEstado } = useEstado();
  const [params, setParams] = useSearchParams();
  const cidadeUrl = params.get("cidade") || "all";
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [contratacao, setContratacao] = useState("all");

  // O link /vagas?estado=SP&cidade=Campinas abre a página já no estado e na cidade.
  useEffect(() => {
    const estadoUrl = (params.get("estado") || "").toUpperCase();
    if (estadoUrl) setEstado(estadoUrl);
  }, [params, setEstado]);

  const mudarCidade = (c) => {
    const novo = new URLSearchParams(params);
    novo.set("estado", sigla);
    if (c === "all") novo.delete("cidade"); else novo.set("cidade", c);
    setParams(novo, { replace: true });
  };

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    (async () => {
      try {
        const page = await base44.entities.Vaga.filter(
          { status: "aberta", ...filtroEstado(sigla) },
          { sort: "-created_date", limit: 200 }
        );
        if (ativo) setVagas(page.items || []);
      } catch (e) {
        if (ativo) setVagas([]);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [sigla]);

  const cidades = useMemo(() => cidadesDe(vagas), [vagas]);
  // Cidade de outro estado (trocado no topo do site) não filtra nada.
  const cidade = cidades.includes(cidadeUrl) ? cidadeUrl : "all";
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return vagas.filter((v) => {
      if (cidade !== "all" && cidadeDe(v) !== cidade) return false;
      if (contratacao !== "all" && v.contratacao !== contratacao) return false;
      if (!q) return true;
      return [v.titulo, v.empresa, v.descricao, v.cidade].some((t) => (t || "").toLowerCase().includes(q));
    });
  }, [vagas, busca, contratacao, cidade]);

  return (
    <Layout>
      <header className="max-w-6xl mx-auto px-4 pt-10 sm:pt-14">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2.5 mb-2">
          <Briefcase className="w-8 h-8 text-primary" aria-hidden="true" /> Estamos contratando
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Lojas, espaços de jogos e grupos {info.em} procurando gente que ama board game. Veja o perfil buscado e mande seu currículo direto por e-mail.
        </p>
        <Button asChild className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 font-700">
          <Link to="/painel/vagas/nova"><PlusCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> Anunciar uma vaga</Link>
        </Button>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cargo, loja ou cidade"
              aria-label="Buscar vagas"
              className="pl-9 h-11"
            />
          </div>
          <CidadeFilter cidades={cidades} value={cidade} onChange={mudarCidade} className="h-11 lg:h-11" />
          <select value={contratacao} onChange={(e) => setContratacao(e.target.value)} aria-label="Tipo de contratação" className={selectClass}>
            <option value="all">Todas as contratações</option>
            {CONTRATACOES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            {vagas.length === 0 ? "Nenhuma vaga aberta por aqui ainda." : "Nenhuma vaga com esses filtros."}{" "}
            <Link to="/painel/vagas/nova" className="font-600 text-primary dark:text-accent hover:underline">Anuncie a sua</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map((v) => <VagaCard key={v.id} vaga={v} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
