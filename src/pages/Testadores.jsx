import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import TestadorCard from "@/components/TestadorCard";
import CidadeFilter from "@/components/CidadeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlaskConical, Search } from "lucide-react";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { TIPOS_JOGO } from "@/lib/testadores";
import { casa } from "@/lib/busca";

// Testadores de protótipos: quem quer testar jogos em desenvolvimento.
export default function Testadores() {
  const { sigla, info } = useEstado();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("all");
  const [tipo, setTipo] = useState("todos");

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setCidade("all");
    // Os do estado escolhido e os que testam online de qualquer lugar.
    Promise.all([
      base44.entities.Testador.filter({ status: "ativo", ...filtroEstado(sigla) }, { sort: "-created_date", limit: 200 }),
      base44.entities.Testador.filter({ status: "ativo", modalidade: "online" }, { sort: "-created_date", limit: 100 }),
    ])
      .then(([a, b]) => {
        if (!ativo) return;
        const porId = new Map([...(a.items || []), ...(b.items || [])].map((t) => [t.id, t]));
        setItens([...porId.values()].sort((x, y) => (y.created_date || "").localeCompare(x.created_date || "")));
      })
      .catch(() => ativo && setItens([]))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [sigla]);

  const presenciais = useMemo(() => itens.filter((t) => t.modalidade !== "online"), [itens]);
  const cidades = useMemo(() => cidadesDe(presenciais), [presenciais]);
  const filtrados = useMemo(
    () =>
      itens.filter((t) => {
        if (tipo !== "todos" && !(t.tipos_jogo || []).includes(tipo)) return false;
        if (cidade !== "all" && t.modalidade !== "online" && cidadeDe(t) !== cidade) return false;
        return casa(busca, t.nome, t.bio, t.cidade, (t.jogos_testados || []).join(" "), (t.tipos_jogo || []).join(" "));
      }),
    [itens, tipo, cidade, busca]
  );

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Playtest</p>
        <h1 className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Testadores</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Quem gosta de testar jogos em desenvolvimento {info.em || `em ${info.nome}`} e online. Cadastre seu perfil com os jogos que já testou e os tipos de que mais gosta. Criadores acham você pelo perfil.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-12 font-700">
            <Link to="/painel/testador"><FlaskConical className="w-5 h-5 mr-1.5" aria-hidden="true" /> Quero ser testador</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 font-600">
            <Link to="/procuro?canal=playtest">Sou criador: procuro testadores</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-4">
        <div role="group" aria-label="Tipos de jogo" className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {["todos", ...TIPOS_JOGO].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={tipo === t}
              className={`shrink-0 min-h-11 rounded-full border px-4 text-sm font-600 transition-colors ${
                tipo === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : t}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, jogo testado ou cidade" aria-label="Buscar testadores" className="pl-9 h-11" />
          </div>
          <CidadeFilter cidades={cidades} value={cidade} onChange={setCidade} className="h-11 lg:h-11" />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-10">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}</div>
        ) : filtrados.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 text-accent-ink" aria-hidden="true" />
            {itens.length === 0 ? "Nenhum testador cadastrado ainda. Seja a primeira pessoa!" : "Nenhum testador com esses filtros."}
            <div className="mt-4">
              <Button asChild className="h-11 font-600"><Link to="/painel/testador">Quero ser testador</Link></Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtrados.map((t) => <li key={t.id} className="min-w-0"><TestadorCard testador={t} /></li>)}
          </ul>
        )}
      </section>
    </Layout>
  );
}
