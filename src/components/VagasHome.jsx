import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import VagaCard from "@/components/VagaCard";
import CidadeFilter from "@/components/CidadeFilter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, PlusCircle } from "lucide-react";
import { useEstado, filtroEstado, cidadeDe, cidadesDe } from "@/lib/regiao";
import { vagasLink } from "@/lib/vagas";

const DESTAQUE_VAGAS = 4;

// Vagas abertas do estado escolhido no topo do site, com filtro de cidade.
export default function VagasHome({ ocultarSeVazio = false }) {
  const { sigla, info } = useEstado();
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cidade, setCidade] = useState("all");

  useEffect(() => {
    let ativo = true;
    setCidade("all");
    setLoading(true);
    base44.entities.Vaga.filter({ status: "aberta", ...filtroEstado(sigla) }, { sort: "-created_date", limit: 50 })
      .then((page) => { if (ativo) setVagas(page.items || []); })
      .catch(() => { if (ativo) setVagas([]); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [sigla]);

  const cidades = useMemo(() => cidadesDe(vagas), [vagas]);
  const daCidade = useMemo(() => (cidade === "all" ? vagas : vagas.filter((v) => cidadeDe(v) === cidade)), [vagas, cidade]);
  const linkTodas = vagasLink(sigla, cidade === "all" ? "" : cidade);

  // Na home, a área só existe quando o estado tem vaga aberta.
  if (ocultarSeVazio && !loading && vagas.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pt-16 pb-4" aria-labelledby="home-vagas">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent-ink mb-2">Vagas</p>
          <h2 id="home-vagas" className="font-display font-700 text-3xl sm:text-4xl tracking-tight">Estamos contratando</h2>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Lojas, espaços de jogos e grupos {info.em} procurando gente que ama board game. Escolha a cidade e mande seu currículo direto por e-mail.
          </p>
        </div>
        <Link
          to={linkTodas}
          className="shrink-0 inline-flex items-center gap-1.5 min-h-11 py-2 text-sm font-600 text-primary dark:text-accent hover:underline"
        >
          Ver todas as vagas <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mb-5">
        <CidadeFilter cidades={cidades} value={cidade} onChange={setCidade} className="h-11 lg:h-11" />
      </div>
      {loading ? (
        <ul aria-hidden="true" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <li key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </ul>
      ) : daCidade.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Briefcase className="mx-auto mb-3 h-8 w-8 text-accent-ink" aria-hidden="true" />
          <p className="mx-auto max-w-md text-muted-foreground">
            Nenhuma vaga aberta {cidade === "all" ? info.em : `em ${cidade}`} ainda. Sua loja ou espaço está contratando? Anuncie aqui de graça.
          </p>
          <Button asChild className="mt-4 h-11 min-h-11 font-600">
            <Link to="/painel/vagas/nova"><PlusCircle className="w-4 h-4 mr-1.5" aria-hidden="true" /> Anunciar uma vaga</Link>
          </Button>
        </div>
      ) : (
        <ul aria-label="Vagas abertas" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {daCidade.slice(0, DESTAQUE_VAGAS).map((v) => (
            <li key={v.id} className="min-w-0"><VagaCard vaga={v} /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
