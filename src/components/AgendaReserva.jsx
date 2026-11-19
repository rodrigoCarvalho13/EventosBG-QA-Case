import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Loader2 } from "lucide-react";
import BuscaOpcao from "@/components/BuscaOpcao";
import CalendarioMes from "@/components/CalendarioMes";
import {
  duracoesDisponiveis,
  listaJogosEvento,
  MAX_JOGOS_EVENTO,
  estadoDiaCalendario,
  fimDoHorario,
  horariosLivres,
  rotuloLocal,
} from "@/lib/monitores";

function chaveLocal(local) {
  return `${local.estado}|${local.cidade}|${local.bairro || ""}|${local.local || ""}`;
}

export default function AgendaReserva({ monitor, ocupados, carregando, usuario, enviando, onSolicitar }) {
  const dono = !!usuario && (usuario.id === monitor.owner_id || usuario.id === monitor.created_by_id);
  const duracoes = useMemo(() => duracoesDisponiveis(monitor), [monitor]);
  const [duracao, setDuracao] = useState(() => (duracoesDisponiveis(monitor).includes(2) ? 2 : duracoesDisponiveis(monitor)[0]));
  const [data, setData] = useState("");
  const [inicio, setInicio] = useState("");
  const [jogo, setJogo] = useState("");
  const [jogosEvento, setJogosEvento] = useState("");
  const [localChave, setLocalChave] = useState((monitor.locais || []).length === 1 ? chaveLocal(monitor.locais[0]) : "");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  const locais = monitor.locais || [];
  const temAgenda = (monitor.disponibilidade || []).length > 0 || (monitor.dias_extras || []).length > 0;

  const slots = useMemo(() => {
    if (!data) return [];
    return horariosLivres({
      disponibilidade: monitor.disponibilidade,
      data,
      duracaoHoras: duracao,
      ocupados,
      dias_bloqueados: monitor.dias_bloqueados,
      dias_extras: monitor.dias_extras,
    });
  }, [monitor.disponibilidade, monitor.dias_bloqueados, monitor.dias_extras, data, duracao, ocupados]);

  useEffect(() => {
    if (!data) return;
    const estado = estadoDiaCalendario(monitor, data, { ocupados, duracaoHoras: duracao });
    if (estado !== "disponivel" && estado !== "parcial") setData("");
  }, [data, duracao, ocupados, monitor]);

  useEffect(() => {
    if (inicio && !slots.includes(inicio)) setInicio("");
  }, [slots, inicio]);

  const escolherDuracao = (horas) => {
    setDuracao(horas);
    setInicio("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    if (!listaJogosEvento(jogosEvento).length) return setErro("Informe os jogos que vão estar no evento.");
    if (!localChave) return setErro("Escolha onde quer jogar.");
    if (!data || !inicio) return setErro("Escolha o dia e o horário.");
    const local = locais.find((l) => chaveLocal(l) === localChave);
    try {
      await onSolicitar({
        monitor_id: monitor.id,
        jogo,
        jogos_evento: listaJogosEvento(jogosEvento),
        data,
        inicio,
        duracao_horas: duracao,
        local_estado: local?.estado,
        local_cidade: local?.cidade,
        local_bairro: local?.bairro || "",
        local_nome: local?.local || "",
        observacao,
      });
      setInicio("");
      setObservacao("");
    } catch (err) {
      setErro(err?.message || "Não foi possível solicitar a reserva.");
    }
  };

  return (
    <section aria-labelledby="agenda-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-shadow">
      <h2 id="agenda-titulo" className="font-display font-700 text-xl flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-accent-ink" aria-hidden="true" /> Agenda
      </h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Escolha o dia e o horário. O valor é combinado direto com o monitor; não há pagamento pelo site.
      </p>

      {carregando ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-11 rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
          </div>
        </div>
      ) : !temAgenda ? (
        <p className="text-sm text-muted-foreground">Este monitor ainda não publicou horários.</p>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reserva-jogos-evento">Jogos que vão estar no evento</Label>
            <Textarea
              id="reserva-jogos-evento"
              value={jogosEvento}
              onChange={(e) => setJogosEvento(e.target.value)}
              rows={5}
              maxLength={MAX_JOGOS_EVENTO * 40}
              placeholder={"Um jogo por linha (ou separados por vírgula). Pode colar a lista inteira."}
            />
            <p className="text-xs text-muted-foreground">
              {listaJogosEvento(jogosEvento).length} {listaJogosEvento(jogosEvento).length === 1 ? "jogo" : "jogos"} na lista (máx. {MAX_JOGOS_EVENTO}).
              O monitor lê os manuais e estuda os jogos que ainda não conhece antes do evento. Quanto mais cedo e completa a lista, melhor a mesa.
            </p>
          </div>

          {(monitor.jogos || []).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-600" id="reserva-jogo-rotulo">Jogo que mais quer aprender (opcional)</p>
              <BuscaOpcao
                id="reserva-jogo"
                rotulo="Jogo que mais quer aprender"
                value={jogo}
                onChange={setJogo}
                opcoes={monitor.jogos || []}
                placeholder="Buscar jogo…"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reserva-local">Onde</Label>
            <Select value={localChave} onValueChange={setLocalChave}>
              <SelectTrigger id="reserva-local" aria-label="Local"><SelectValue placeholder="Escolha o local" /></SelectTrigger>
              <SelectContent>
                {locais.map((l) => (
                  <SelectItem key={chaveLocal(l)} value={chaveLocal(l)}>{rotuloLocal(l)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset>
            <legend className="text-sm font-600 mb-1">Quantas horas de atendimento</legend>
            <p className="text-xs text-muted-foreground mb-2">Você escolhe o horário de início no passo seguinte, dentro do período em que o monitor atende.</p>
            <div className="flex flex-wrap gap-2">
              {duracoes.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={duracao === h}
                  onClick={() => escolherDuracao(h)}
                  className={`min-h-11 min-w-11 px-3 rounded-lg text-sm font-600 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    duracao === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-600 mb-2">Dia</legend>
            <CalendarioMes
              modo="escolher"
              monitor={monitor}
              ocupados={ocupados}
              duracaoHoras={duracao}
              selecionada={data}
              onSelecionar={(iso) => { setData(iso); setInicio(""); }}
            />
          </fieldset>

          {data && (
            <fieldset>
              <legend className="text-sm font-600 mb-2">Horário de início</legend>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum horário livre para {duracao}h nesse dia. Tente uma duração menor.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={inicio === h}
                      onClick={() => setInicio(h)}
                      className={`min-h-11 rounded-lg border text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        inicio === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
              {inicio && (
                <p className="text-sm text-muted-foreground mt-2">
                  Das {inicio} às {fimDoHorario(inicio, duracao)}.
                </p>
              )}
            </fieldset>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reserva-obs">Recado (opcional)</Label>
            <Textarea
              id="reserva-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={500}
              placeholder="Quantas pessoas, nível do grupo, o que você quer aprender."
            />
          </div>

          {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
          <p className="text-sm text-muted-foreground">O contato aparece após a confirmação da reserva.</p>

          {dono ? (
            <p className="text-sm text-muted-foreground">Este é o seu perfil. As solicitações aparecem em Minhas reservas.</p>
          ) : usuario ? (
            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              Solicitar reserva
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to={`/login?returnTo=${encodeURIComponent(`/monitores/${monitor.slug || monitor.id}`)}`}>
                Entrar para reservar
              </Link>
            </Button>
          )}
        </form>
      )}
    </section>
  );
}
