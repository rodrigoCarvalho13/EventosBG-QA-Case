import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import AgendaReserva from "@/components/AgendaReserva";
import FormAvaliar from "@/components/FormAvaliar";
import EstrelasNota, { NotaResumo } from "@/components/EstrelasNota";
import CurtirMonitor from "@/components/CurtirMonitor";
import CompartilharMenu from "@/components/CompartilharMenu";
import TagBadges from "@/components/TagBadges";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSeo, seoMonitor } from "@/lib/seo";
import { buscarPorSlugOuId } from "@/lib/slug";
import { invocar } from "@/lib/monitoresApi";
import { listarPorIds } from "@/lib/paginar";
import {
  CRITERIOS_AVALIACAO,
  DIAS,
  dadosPessoaisVisiveis,
  distribuicaoNotas,
  fimDoHorario,
  formatarData,
  formatarPreco,
  generoVisivel,
  idadeVisivel,
  monitorPath,
  primeiroNome,
  rotuloLocal,
  textoPreco,
} from "@/lib/monitores";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import { ArrowLeft, CalendarClock, MapPin, Pencil } from "lucide-react";

const LIMITE_JOGOS = 40;

export default function MonitorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [monitor, setMonitor] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [agendaPronta, setAgendaPronta] = useState(false);
  const [pendentes, setPendentes] = useState([]);
  const [cursorAvaliacoes, setCursorAvaliacoes] = useState(null);
  const [temMaisAvaliacoes, setTemMaisAvaliacoes] = useState(false);
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [todosJogos, setTodosJogos] = useState(false);

  useSeo(loading ? null : monitor ? seoMonitor(monitor) : { title: "Página não encontrada", noindex: true });

  const carregar = async () => {
    setLoading(true);
    setNotFound(false);
    setAgendaPronta(false);
    try {
      const m = await buscarPorSlugOuId(base44.entities.Monitor, id);
      if (!m) throw new Error("ausente");
      if (m.slug && m.slug !== id) navigate(monitorPath(m), { replace: true });
      setMonitor(m);
      const av = await base44.entities.AvaliacaoMonitor.filter(
        { monitor_id: m.id },
        { sort: "-created_date", limit: 10, fields: ["reserva_id", "cliente_nome", "nota", "criterios", "comentario", "created_date"] }
      );
      setAvaliacoes(av.items || []);
      setCursorAvaliacoes(av.next_cursor || null);
      setTemMaisAvaliacoes(!!av.has_more && !!av.next_cursor);
      if (user) {
        const reservas = await base44.entities.ReservaMonitor.filter(
          { monitor_id: m.id, cliente_id: user.id, status: "finalizada" },
          { limit: 50, fields: ["jogo", "data", "status"] }
        );
        const ids = (reservas.items || []).map((r) => r.id);
        const minhas = ids.length
          ? await listarPorIds(base44.entities.AvaliacaoMonitor, "reserva_id", ids, { limit: 50, fields: ["reserva_id"] })
          : [];
        const feitas = new Set(minhas.map((a) => a.reserva_id));
        setPendentes((reservas.items || []).filter((r) => !feitas.has(r.id)));
      } else {
        setPendentes([]);
      }
      setLoading(false);
      try {
        const agenda = await invocar("agendaMonitor", { monitor_id: m.id });
        setOcupados(agenda.ocupados || []);
      } catch {
        setOcupados([]);
      } finally {
        setAgendaPronta(true);
      }
    } catch {
      setMonitor(null);
      setNotFound(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [id, user?.id]);

  const solicitar = async (payload) => {
    setEnviando(true);
    try {
      await invocar("solicitarReserva", payload);
      toast({ title: "Reserva solicitada", description: "O monitor precisa confirmar. Acompanhe em Minhas reservas." });
      try {
        const agenda = await invocar("agendaMonitor", { monitor_id: monitor.id });
        setOcupados(agenda.ocupados || []);
      } catch {
        setOcupados((lista) => [...lista, { data: payload.data, inicio: payload.inicio, duracao_horas: payload.duracao_horas }]);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <Layout><LogoSpinner className="py-28" /></Layout>;

  if (notFound || !monitor) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Monitor não encontrado.</p>
          <Link to="/monitores" className="inline-flex mt-3 min-h-11 items-center font-600 text-primary dark:text-accent hover:underline">Voltar ao catálogo</Link>
        </div>
      </Layout>
    );
  }

  const dono = user && (user.id === monitor.owner_id || user.id === monitor.created_by_id || user.role === "admin");
  const preco = textoPreco(monitor);
  const pessoal = dadosPessoaisVisiveis(monitor);
  const meta = [idadeVisivel(pessoal.idade), generoVisivel(pessoal.genero)].filter(Boolean);
  const contagem = distribuicaoNotas(avaliacoes);
  const total = Number(monitor.total_avaliacoes) || avaliacoes.length;

  const carregarMaisAvaliacoes = async () => {
    if (!cursorAvaliacoes || carregandoAvaliacoes) return;
    setCarregandoAvaliacoes(true);
    try {
      const av = await base44.entities.AvaliacaoMonitor.filter(
        { monitor_id: monitor.id },
        { sort: "-created_date", limit: 10, cursor: cursorAvaliacoes, fields: ["reserva_id", "cliente_nome", "nota", "criterios", "comentario", "created_date"] }
      );
      setAvaliacoes((lista) => [...lista, ...(av.items || [])]);
      setCursorAvaliacoes(av.next_cursor || null);
      setTemMaisAvaliacoes(!!av.has_more && !!av.next_cursor);
    } finally {
      setCarregandoAvaliacoes(false);
    }
  };

  return (
    <Layout>
      <article className="w-full overflow-x-clip max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <Link to="/monitores" className="inline-flex items-center gap-1.5 min-h-11 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Monitores
        </Link>

        <header className="mt-1 flex gap-4 sm:gap-6 items-start sm:items-center">
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border">
            {monitor.photo_url ? (
              <img
                {...imagemOtimizada(monitor.photo_url, { width: 320, height: 320, crop: true })}
                alt={monitor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full dice-pattern grid place-items-center font-display text-4xl text-primary/40" aria-hidden="true">
                {monitor.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-700 text-2xl sm:text-4xl leading-tight break-words">{monitor.name}</h1>
            {meta.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{meta.join(" · ")}</p>}
            <div className="mt-1.5">
              <NotaResumo nota={monitor.nota_media} total={monitor.total_avaliacoes} />
            </div>
            {(monitor.servicos || []).length > 0 && (
              <div className="mt-2"><TagBadges tags={monitor.servicos} limit={3} /></div>
            )}
          </div>
        </header>

        {monitor.publicado === false && (
          <p className="mt-3 text-sm text-accent-ink">Este perfil está oculto do catálogo.</p>
        )}

        <section aria-label="Valores e reserva" className="mt-5 rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-shadow">
          <div className="min-w-0">
            {preco ? (
              <>
                <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground">A partir de</p>
                <p className="font-display font-700 text-xl leading-snug">
                  {formatarPreco(monitor.preco_hora)}/hora
                </p>
              </>
            ) : (
              <p className="font-600">Valor a combinar</p>
            )}
          </div>
          <Button asChild className="w-full sm:w-auto">
            <a href="#agenda"><CalendarClock className="w-4 h-4 mr-1.5" aria-hidden="true" /> Solicitar reserva</a>
          </Button>
        </section>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CurtirMonitor monitorId={monitor.id} souDono={!!user && (user.id === monitor.owner_id || user.id === monitor.created_by_id)} />
          <CompartilharMenu title={`${monitor.name} — monitor de board game`} />
          {dono && (
            <Button asChild variant="ghost">
              <Link to="/painel/monitor"><Pencil className="w-4 h-4 mr-1.5" aria-hidden="true" /> Editar perfil</Link>
            </Button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-8 items-start">
          <div className="space-y-8 min-w-0 lg:col-start-1 lg:row-start-1">
            {monitor.bio && (
              <section aria-labelledby="bio-titulo">
                <h2 id="bio-titulo" className="font-display font-700 text-xl mb-2">Sobre</h2>
                <p className="whitespace-pre-line text-muted-foreground break-words">{monitor.bio}</p>
              </section>
            )}

            {((monitor.servicos || []).length > 0 || (monitor.tipos_evento || []).length > 0 || (monitor.estilos || []).length > 0) && (
              <section aria-labelledby="especialidades-titulo">
                <h2 id="especialidades-titulo" className="font-display font-700 text-xl mb-3">Especialidades</h2>
                <dl className="space-y-3">
                  {[
                    ["Serviços", monitor.servicos],
                    ["Tipos de evento", monitor.tipos_evento],
                    ["Estilos de jogo", monitor.estilos],
                  ].filter(([, lista]) => (lista || []).length > 0).map(([rotulo, lista]) => (
                    <div key={rotulo}>
                      <dt className="text-xs font-600 uppercase tracking-wide text-muted-foreground mb-1">{rotulo}</dt>
                      <dd><TagBadges tags={lista} /></dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section aria-labelledby="jogos-titulo">
              <h2 id="jogos-titulo" className="font-display font-700 text-xl mb-1">Jogos que ensina</h2>
              {Number(monitor.acervo_qtd) > 0 && (
                <p className="mb-3 text-sm text-muted-foreground">Conhece mais de {Number(monitor.acervo_qtd).toLocaleString("pt-BR")} jogos de tabuleiro</p>
              )}
              <TagBadges tags={todosJogos ? monitor.jogos : (monitor.jogos || []).slice(0, LIMITE_JOGOS)} className={Number(monitor.acervo_qtd) > 0 ? "" : "mt-2"} />
              {(monitor.jogos || []).length > LIMITE_JOGOS && (
                <Button type="button" variant="ghost" className="mt-2 -ml-3" aria-expanded={todosJogos} onClick={() => setTodosJogos((v) => !v)}>
                  {todosJogos ? "Mostrar menos" : `Ver todos os ${monitor.jogos.length} jogos`}
                </Button>
              )}
              {monitor.jogos_obs && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line break-words">{monitor.jogos_obs}</p>}
            </section>

            <section aria-labelledby="locais-titulo">
              <h2 id="locais-titulo" className="font-display font-700 text-xl mb-3">Onde atende</h2>
              <ul className="space-y-2">
                {(monitor.locais || []).map((l) => (
                  <li key={rotuloLocal(l)} className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
                    <span className="break-words">{rotuloLocal(l)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {(monitor.disponibilidade || []).length > 0 && (
              <section aria-labelledby="semana-titulo">
                <h2 id="semana-titulo" className="font-display font-700 text-xl mb-3">Disponibilidade semanal</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {monitor.disponibilidade.map((b, i) => (
                    <li key={`${b.dia}-${b.inicio}-${i}`} className="rounded-xl border border-border bg-card px-3 py-2">
                      <p className="text-sm font-600">{DIAS.find((d) => d.id === b.dia)?.label || b.dia}</p>
                      <p className="text-sm text-muted-foreground">{b.inicio} às {fimDoHorario(b.inicio, b.horas) || "—"}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div id="agenda" className="min-w-0 scroll-mt-20 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
            <AgendaReserva
              monitor={monitor}
              ocupados={ocupados}
              carregando={!agendaPronta}
              usuario={user}
              enviando={enviando}
              onSolicitar={solicitar}
            />
            <Button asChild variant="ghost" className="w-full mt-3">
              <Link to="/painel/reservas">Minhas reservas</Link>
            </Button>
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <section aria-labelledby="avaliacoes-titulo">
              <h2 id="avaliacoes-titulo" className="font-display font-700 text-xl mb-3">Avaliações</h2>
              {total === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não há avaliações. Elas aparecem depois de um atendimento finalizado.</p>
              ) : (
                <div className="grid sm:grid-cols-[auto_minmax(0,1fr)] gap-4 mb-6 items-center">
                  <div>
                    <p className="font-display font-700 text-4xl">{Number(monitor.nota_media || 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
                    <EstrelasNota value={Math.round(Number(monitor.nota_media) || 0)} />
                    <p className="text-sm text-muted-foreground mt-1">{total} {total === 1 ? "avaliação" : "avaliações"}</p>
                  </div>
                  {!temMaisAvaliacoes && (
                    <ul className="space-y-1.5" aria-label="Distribuição das notas">
                      {[5, 4, 3, 2, 1].map((n) => {
                        const qtd = contagem[n] || 0;
                        const base = avaliacoes.length || total;
                        const pct = base ? Math.round((qtd / base) * 100) : 0;
                        return (
                          <li key={n} className="flex items-center gap-2 text-sm">
                            <span className="w-4 text-right">{n}</span>
                            <span className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                              <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="w-6 text-right text-muted-foreground">{qtd}</span>
                            <span className="sr-only">{qtd} avaliações com {n} estrelas</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
              {total > 0 && Object.keys(monitor.criterios_media || {}).length > 0 && (
                <ul className="mb-6 grid sm:grid-cols-2 gap-x-6 gap-y-1.5" aria-label="Média por critério">
                  {CRITERIOS_AVALIACAO.filter((c) => monitor.criterios_media?.[c.id]).map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{c.label}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <EstrelasNota value={Math.round(monitor.criterios_media[c.id])} size={14} />
                        <span className="w-7 text-right font-600">{Number(monitor.criterios_media[c.id]).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {pendentes.length > 0 && (
                <div className="space-y-3 mb-6">
                  {pendentes.map((r) => (
                    <div key={r.id}>
                      <p className="text-sm font-600 mb-2">Avalie o atendimento de {formatarData(r.data)} ({r.jogo})</p>
                      <FormAvaliar
                        reservaId={r.id}
                        onFeito={async () => {
                          toast({ title: "Avaliação publicada" });
                          const av = await base44.entities.AvaliacaoMonitor.filter(
                            { monitor_id: monitor.id },
                            { sort: "-created_date", limit: 10, fields: ["reserva_id", "cliente_nome", "nota", "criterios", "comentario", "created_date"] }
                          );
                          setAvaliacoes(av.items || []);
                          setCursorAvaliacoes(av.next_cursor || null);
                          setTemMaisAvaliacoes(!!av.has_more && !!av.next_cursor);
                          setPendentes((lista) => lista.filter((item) => item.id !== r.id));
                          const atualizado = await buscarPorSlugOuId(base44.entities.Monitor, monitor.slug || monitor.id);
                          if (atualizado) setMonitor(atualizado);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <ul className="space-y-4">
                {avaliacoes.map((a) => (
                  <li key={a.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-600 break-words">{primeiroNome(a.cliente_nome)}</p>
                      <EstrelasNota value={Number(a.nota) || 0} size={16} />
                    </div>
                    {a.comentario && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line break-words">{a.comentario}</p>}
                  </li>
                ))}
              </ul>
              {temMaisAvaliacoes && (
                <Button type="button" variant="outline" className="mt-4" disabled={carregandoAvaliacoes} onClick={carregarMaisAvaliacoes}>
                  {carregandoAvaliacoes ? "Carregando…" : "Carregar mais avaliações"}
                </Button>
              )}
            </section>
          </div>
        </div>
      </article>
    </Layout>
  );
}
