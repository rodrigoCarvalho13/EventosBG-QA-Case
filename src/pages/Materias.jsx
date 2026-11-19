import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import MateriaCard from "@/components/MateriaCard";
import LogoSpinner from "@/components/LogoSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper } from "lucide-react";
import { listarTudo } from "@/lib/paginar";
import { useEstado, filtroEstado } from "@/lib/regiao";
import { CAMPOS_MATERIA_LISTA, materiaPublicada, ordenarMaterias } from "@/lib/materias";

const POR_PAGINA = 9;

const campo = "flex h-11 lg:h-9 w-full rounded-md border border-input bg-transparent px-3 text-base lg:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Materias() {
  const { isAuthenticated } = useAuth();
  const escrever = isAuthenticated ? "/materias/nova" : `/login?returnTo=${encodeURIComponent("/materias/nova")}`;
  const { sigla } = useEstado();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [tag, setTag] = useState("all");
  const [cidade, setCidade] = useState("all");
  const [limite, setLimite] = useState(POR_PAGINA);

  useEffect(() => {
    let ativo = true;
    listarTudo(
      base44.entities.Materia,
      { publicada: true, ...filtroEstado(sigla) },
      { sort: "-publicada_em", limit: 50, fields: CAMPOS_MATERIA_LISTA }
    )
      .then((itens) => { if (ativo) setMaterias(ordenarMaterias(itens.filter(materiaPublicada))); })
      .catch(() => { if (ativo) setMaterias([]); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, [sigla]);

  const tags = useMemo(() => {
    const nomes = new Set();
    materias.forEach((materia) => (materia.tags || []).forEach((nome) => nomes.add(nome)));
    return [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [materias]);

  const cidades = useMemo(() => {
    const nomes = new Set(materias.map((materia) => materia.cidade).filter(Boolean));
    return [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [materias]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return materias.filter((materia) => {
      if (tag !== "all" && !(materia.tags || []).includes(tag)) return false;
      if (cidade !== "all" && materia.cidade !== cidade) return false;
      if (!termo) return true;
      const texto = [materia.titulo, materia.subtitulo, materia.cidade, ...(materia.tags || [])].join(" ").toLocaleLowerCase("pt-BR");
      return texto.includes(termo);
    });
  }, [materias, busca, tag, cidade]);

  useEffect(() => {
    setLimite(POR_PAGINA);
  }, [busca, tag, cidade]);

  const visiveis = filtradas.slice(0, limite);
  const restam = filtradas.length - visiveis.length;
  const semNenhuma = !loading && materias.length === 0;
  const semFiltro = !loading && materias.length > 0 && filtradas.length === 0;

  return (
    <Layout>
      <section className="relative overflow-hidden bg-board text-white">
        <div className="absolute inset-0 dice-pattern opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-xs font-700 uppercase tracking-[0.2em] text-accent">Depois do evento</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-700 leading-[1.05] tracking-tight sm:text-5xl">
            Matérias
          </h1>
          <p className="mt-4 max-w-xl text-white/75">
            Fotos e relatos dos eventos de board game que já aconteceram.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="min-h-11 bg-accent font-600 text-accent-foreground hover:bg-accent/90">
              <Link to={escrever}>Escrever matéria</Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" className="min-h-11 border-white/30 bg-transparent font-600 text-white hover:bg-white/10">
                <Link to="/materias/minhas">Minhas matérias</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {!semNenhuma && (
          <form className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="busca-materias" className="mb-1.5 block text-sm font-600">Busca</label>
              <Input
                id="busca-materias"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Título, cidade ou tag"
              />
            </div>
            <div>
              <label htmlFor="filtro-tag" className="mb-1.5 block text-sm font-600">Tag</label>
              <select id="filtro-tag" value={tag} onChange={(event) => setTag(event.target.value)} className={campo}>
                <option value="all">Todas as tags</option>
                {tags.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filtro-cidade" className="mb-1.5 block text-sm font-600">Cidade</label>
              <select id="filtro-cidade" value={cidade} onChange={(event) => setCidade(event.target.value)} className={campo}>
                <option value="all">Todas as cidades</option>
                {cidades.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
              </select>
            </div>
          </form>
        )}

        {loading ? (
          <LogoSpinner label="Carregando matérias…" className="py-16" />
        ) : semNenhuma ? (
          <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
            <Newspaper className="mx-auto mb-3 h-10 w-10 text-accent-ink" aria-hidden="true" />
            <h2 className="font-display text-2xl font-700">As histórias ainda vão aparecer</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Quando um evento termina, a matéria dele — com fotos e o relato da mesa — fica aqui.
            </p>
          </div>
        ) : semFiltro ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">Nenhuma matéria com esses filtros.</p>
            <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={() => { setBusca(""); setTag("all"); setCidade("all"); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <ul aria-label="Matérias" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((materia) => (
                <li key={materia.id || materia.slug} className="min-w-0">
                  <MateriaCard materia={materia} />
                </li>
              ))}
            </ul>
            {restam > 0 && (
              <div className="mt-6 flex justify-center">
                <Button type="button" className="min-h-11 font-600" onClick={() => setLimite((n) => n + POR_PAGINA)}>
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}
