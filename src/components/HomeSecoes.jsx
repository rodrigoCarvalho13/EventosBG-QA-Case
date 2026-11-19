import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, GraduationCap, BookOpen, Users, PackageOpen, Clapperboard, Mic, Briefcase, Megaphone, FlaskConical, Newspaper, PlusCircle,
} from "lucide-react";
import Carrossel from "@/components/Carrossel";
import LojaCard from "@/components/LojaCard";
import MonitorCard from "@/components/MonitorCard";
import CriadorCard from "@/components/CriadorCard";
import PodcastCard from "@/components/PodcastCard";
import LancamentoCard from "@/components/LancamentoCard";
import ProcuraCard from "@/components/ProcuraCard";
import TestadorCard from "@/components/TestadorCard";
import VagaCard from "@/components/VagaCard";
import MateriaCard from "@/components/MateriaCard";
import { Button } from "@/components/ui/button";
import { useEstado } from "@/lib/regiao";
import { vagasLink } from "@/lib/vagas";
import { lojaPath } from "@/lib/slug";

const MAX_VISIVEIS = 6;
const GRADE = "grid gap-3 md:grid-cols-2";

// Monta a lista de áreas: o que está cadastrado em cada uma e para onde ir.
export function montarAreas({ sigla, info, areas, editoras, grupos, parceriaIds }) {
  const cards = (lista, render, lado = "carrossel", largura = "w-[75%] sm:w-[300px]") => ({ lista, render, lado, largura });
  return [
    {
      id: "monitores", rotulo: "Monitores", icon: GraduationCap, titulo: "Quem ensina a jogar",
      texto: "O valor é combinado direto com a pessoa; o contato só aparece depois da reserva confirmada.",
      ver: "/monitores", verLabel: "Ver todos os monitores", cadastrar: "/painel/monitor", cadastrarLabel: "Quero ser monitor",
      vazio: "Ainda não há monitores aqui. Você ensina jogos de tabuleiro?",
      ...cards(areas.monitores, (m) => <MonitorCard monitor={m} />, "grade3"),
    },
    {
      id: "editoras", rotulo: "Editoras", icon: BookOpen, titulo: `Jogos feitos ${info.em}`,
      texto: "Editoras e criadores de jogos, com os produtos que estão à venda.",
      ver: "/lojas?tipo=editora", verLabel: "Ver todas as editoras", cadastrar: "/painel/lojas/nova?tipo=editora", cadastrarLabel: "Cadastrar minha editora",
      vazio: "Nenhuma editora cadastrada ainda. Você cria jogos?",
      ...cards(editoras, (l) => <LojaCard loja={l} parceira={parceriaIds.has(l.id)} />),
    },
    {
      id: "grupos", rotulo: "Grupos", icon: Users, titulo: "Quem organiza os encontros",
      texto: "Grupos que promovem encontros, acampamentos e campeonatos.",
      ver: "/lojas?tipo=organizador", verLabel: "Ver todos os grupos", cadastrar: "/painel/lojas/nova?tipo=organizador", cadastrarLabel: "Cadastrar meu grupo",
      vazio: "Nenhum grupo cadastrado ainda. Você organiza encontros?",
      ...cards(grupos, (l) => <LojaCard loja={l} parceira={parceriaIds.has(l.id)} />),
    },
    {
      id: "lancamentos", rotulo: "Lançamentos", icon: PackageOpen, titulo: "Pré-vendas e jogos novos",
      texto: "Campanhas e lançamentos das editoras, abertos agora ou em breve.",
      ver: "/lancamentos", verLabel: "Ver todos os lançamentos", cadastrar: "/painel/lancamentos/novo", cadastrarLabel: "Divulgar um lançamento",
      vazio: "Nenhum lançamento aberto agora. É editora?",
      ...cards(areas.lancamentos, (l) => <LancamentoCard lancamento={l} editoraPath={areas.editorasLanc.get(l.editora_id) ? lojaPath(areas.editorasLanc.get(l.editora_id)) : ""} />, "grade"),
    },
    {
      id: "influencers", rotulo: "Influenciadores", icon: Clapperboard, titulo: "Board game em vídeo",
      texto: "Canais e perfis que falam de jogos de tabuleiro.",
      ver: "/influencers", verLabel: "Ver todos os influenciadores", cadastrar: "/painel/videos", cadastrarLabel: "Postar meus vídeos",
      vazio: "Nenhum influenciador ainda. Você faz vídeos sobre jogos?",
      ...cards(areas.influencers, (c) => <CriadorCard criador={c} />, "carrossel", "w-[60%] sm:w-[220px]"),
    },
    {
      id: "podcasts", rotulo: "Podcasts", icon: Mic, titulo: "Board game em áudio",
      texto: "Conversas, reviews e bastidores da comunidade.",
      ver: "/podcasts", verLabel: "Ver todos os podcasts", cadastrar: "/painel/podcasts", cadastrarLabel: "Cadastrar meu podcast",
      vazio: "Nenhum podcast ainda. Você tem um?",
      ...cards(areas.podcasts, (p) => <PodcastCard podcast={p} />, "carrossel", "w-[60%] sm:w-[220px]"),
    },
    {
      id: "vagas", rotulo: "Vagas", icon: Briefcase, titulo: "Estamos contratando",
      texto: "Lojas, espaços e grupos procurando gente que ama board game. Mande seu currículo direto por e-mail.",
      ver: vagasLink(sigla, ""), verLabel: "Ver todas as vagas", cadastrar: "/painel/vagas/nova", cadastrarLabel: "Anunciar uma vaga",
      vazio: "Nenhuma vaga aberta agora. Sua loja ou espaço está contratando?",
      ...cards(areas.vagas, (v) => <VagaCard vaga={v} />, "grade"),
    },
    {
      id: "procuro", rotulo: "Procuro", icon: Megaphone, titulo: "Gente para jogar, testar e criar",
      texto: "Anúncios de quem procura grupo, parceria ou jogadores.",
      ver: "/procuro", verLabel: "Ver todos os anúncios", cadastrar: "/painel/procuro/novo", cadastrarLabel: "Anunciar o que procuro",
      vazio: "Nenhum anúncio ainda. Procura grupo ou jogadores?",
      ...cards(areas.procuras, (p) => <ProcuraCard procura={p} />, "grade"),
    },
    {
      id: "testadores", rotulo: "Testadores", icon: FlaskConical, titulo: "Quem testa jogos",
      texto: "Pessoas disponíveis para playtest de jogos em criação.",
      ver: "/testadores", verLabel: "Ver todos os testadores", cadastrar: "/painel/testador", cadastrarLabel: "Quero ser testador",
      vazio: "Nenhum testador ainda. Quer testar jogos?",
      ...cards(areas.testadores, (t) => <TestadorCard testador={t} />, "grade"),
    },
    {
      id: "materias", rotulo: "Matérias", icon: Newspaper, titulo: "O que rolou",
      texto: "Notícias e fotos dos encontros que já passaram.",
      ver: "/materias", verLabel: "Ver todas as matérias", cadastrar: "/materias/nova", cadastrarLabel: "Escrever uma matéria",
      vazio: "Nenhuma matéria publicada ainda. Quando um encontro termina, o relato e as fotos aparecem aqui.",
      ...cards(areas.materias, (m) => <MateriaCard materia={m} />, "grade3"),
    },
  ];
}

// Um bloco só para as outras áreas do site: abas com a quantidade de cadastros e o conteúdo logo abaixo.
export default function HomeSecoes({ areas, editoras, grupos, parceriaIds }) {
  const { sigla, info } = useEstado();
  const lista = useMemo(
    () => montarAreas({ sigla, info, areas, editoras, grupos, parceriaIds }),
    [sigla, info, areas, editoras, grupos, parceriaIds]
  );
  // Quem tem cadastro vem primeiro; a ordem original se mantém dentro de cada grupo.
  const ordenadas = useMemo(() => [...lista.filter((a) => a.lista.length > 0), ...lista.filter((a) => a.lista.length === 0)], [lista]);
  const [aba, setAba] = useState("");
  useEffect(() => {
    if (!aba || !ordenadas.some((a) => a.id === aba)) setAba(ordenadas[0]?.id || "");
  }, [ordenadas, aba]);
  const atual = ordenadas.find((a) => a.id === aba) || ordenadas[0];
  if (!atual || areas.carregando) return null;

  const itens = atual.lista.slice(0, MAX_VISIVEIS);
  return (
    <section className="max-w-6xl mx-auto px-4 pt-16" aria-labelledby="home-descubra">
      <p className="mb-2 text-xs font-700 uppercase tracking-[0.2em] text-accent-ink">Descubra</p>
      <h2 id="home-descubra" className="font-display font-700 text-3xl tracking-tight sm:text-4xl">Tem muito mais por aqui</h2>
      <p className="mt-2 max-w-xl text-muted-foreground">Veja o que a comunidade já cadastrou {info.em}. Toque numa área para ver quem está nela.</p>

      <div role="tablist" aria-label="Áreas do site" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {ordenadas.map((a) => {
          const Icon = a.icon;
          const n = a.lista.length;
          const ativa = a.id === atual.id;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              id={`aba-${a.id}`}
              aria-selected={ativa}
              aria-controls="painel-descubra"
              onClick={() => setAba(a.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-600 transition-colors ${
                ativa ? "bg-accent text-accent-foreground font-700 shadow-sm" : n > 0 ? "bg-card text-foreground shadow-sm ring-1 ring-border/25 hover:bg-accent/20" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {a.rotulo}
              <span className={`rounded-full px-2 py-0.5 text-xs font-700 tabular-nums ${ativa ? "bg-foreground/10" : n > 0 ? "bg-accent/30 text-foreground" : "bg-background/70"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div id="painel-descubra" role="tabpanel" aria-labelledby={`aba-${atual.id}`} className="mt-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h3 className="font-display font-700 text-2xl tracking-tight">{atual.titulo}</h3>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">{atual.texto}</p>
          </div>
          <Link to={atual.ver} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 py-2 text-sm font-600 text-primary hover:underline dark:text-accent">
            {atual.lista.length > MAX_VISIVEIS ? `${atual.verLabel} (${atual.lista.length})` : atual.verLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {itens.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <atual.icon className="mx-auto mb-3 h-8 w-8 text-accent-ink" aria-hidden="true" />
            <p className="mx-auto max-w-md text-muted-foreground">{atual.vazio}</p>
            <Button asChild className="mt-4 h-11 min-h-11 font-600">
              <Link to={atual.cadastrar}><PlusCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> {atual.cadastrarLabel}</Link>
            </Button>
          </div>
        ) : atual.lado === "carrossel" ? (
          <Carrossel label={atual.rotulo} itemClassName={atual.largura}>
            {itens.map((x) => <div key={x.id} className="h-full">{atual.render(x)}</div>)}
          </Carrossel>
        ) : (
          <ul className={atual.lado === "grade3" ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" : GRADE}>
            {itens.map((x) => <li key={x.id || x.slug} className="min-w-0">{atual.render(x)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
