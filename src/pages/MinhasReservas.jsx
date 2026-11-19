import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import LogoSpinner from "@/components/LogoSpinner";
import FormAvaliar from "@/components/FormAvaliar";
import BotoesContato from "@/components/BotoesContato";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { invocar } from "@/lib/monitoresApi";
import { listarPorIds, listarTudo } from "@/lib/paginar";
import {
  STATUS_RESERVA,
  acoesReserva,
  fimDoHorario,
  formatarDataLonga,
  monitorPath,
  TEXTO_CONTATO_APOS_CONFIRMACAO,
  papelNaReserva,
  reservaDeveExpirar,
  reservaLiberaContato,
  rotuloLocal,
} from "@/lib/monitores";
import { CalendarCheck, Loader2 } from "lucide-react";

const COR = {
  solicitada: "bg-accent/25 text-accent-ink",
  confirmada: "bg-primary/10 text-primary dark:text-accent",
  paga: "bg-primary text-primary-foreground",
  finalizada: "bg-muted text-foreground",
  cancelada: "bg-destructive/15 text-destructive",
  expirada: "bg-destructive/15 text-destructive",
};

const ROTULO_ACAO = {
  confirmar: "Confirmar reserva",
  pagamento_cliente: "Já paguei",
  pagamento_monitor: "Já recebi o pagamento",
  finalizar: "Finalizar atendimento",
  cancelar: "Cancelar",
};

function marcarExpirada(reserva) {
  if (reserva?.status === "expirada" || reservaDeveExpirar(reserva)) return { ...reserva, status: "expirada" };
  return reserva;
}

function textoPagamento(reserva) {
  if (reserva.status === "expirada") return "Esta reserva expirou e o horário foi liberado.";
  if (reserva.status === "paga") return "Os dois lados confirmaram o pagamento. A reserva está agendada.";
  if (reserva.status !== "confirmada") return "";
  const cliente = reserva.cliente_pago ? "Você já marcou o pagamento." : "O cliente ainda não marcou o pagamento.";
  const monitor = reserva.monitor_pago ? "O monitor já marcou o recebimento." : "O monitor ainda não marcou o recebimento.";
  if (reserva._papel === "cliente") {
    return `${reserva.cliente_pago ? "Você confirmou que pagou." : "Falta você confirmar que pagou."} ${reserva.monitor_pago ? "O monitor confirmou o recebimento." : "Falta o monitor confirmar o recebimento."}`;
  }
  if (reserva._papel === "monitor") {
    return `${reserva.monitor_pago ? "Você confirmou o recebimento." : "Falta você confirmar o recebimento."} ${reserva.cliente_pago ? "O cliente confirmou o pagamento." : "Falta o cliente confirmar o pagamento."}`;
  }
  return `${cliente} ${monitor}`;
}

function CartaoReserva({ reserva, avaliada, onAtualizar, onAvaliada }) {
  const { toast } = useToast();
  const [ocupado, setOcupado] = useState("");
  const [contato, setContato] = useState(null);
  const papel = reserva._papel;
  const mostraContato = papel === "cliente" && reservaLiberaContato(reserva.status);

  useEffect(() => {
    if (!mostraContato) {
      setContato(null);
      return undefined;
    }
    let vivo = true;
    setContato(null);
    invocar("lerContatoMonitor", { monitor_id: reserva.monitor_id, reserva_id: reserva.id })
      .then((data) => { if (vivo) setContato(data.contato || {}); })
      .catch(() => { if (vivo) setContato(false); });
    return () => { vivo = false; };
  }, [mostraContato, reserva.monitor_id, reserva.id, reserva.status]);
  const acoes = acoesReserva(reserva, papel, avaliada);
  const status = STATUS_RESERVA[reserva.status] || { label: reserva.status, descricao: "" };
  const local = rotuloLocal({ estado: reserva.local_estado, cidade: reserva.local_cidade, bairro: reserva.local_bairro, local: reserva.local_nome });

  const agir = async (acao) => {
    if (acao === "cancelar" && !confirm("Cancelar esta reserva? O horário volta a ficar livre.")) return;
    setOcupado(acao);
    try {
      const data = await invocar("atualizarReserva", { reserva_id: reserva.id, acao });
      onAtualizar(data.reserva);
      toast({ title: "Reserva atualizada" });
    } catch (err) {
      toast({ title: "Não foi possível atualizar", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setOcupado("");
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5 card-shadow space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-700 text-lg break-words">
            {papel === "monitor" ? reserva.cliente_nome : reserva.monitor_nome}
          </h3>
          <p className="text-sm text-muted-foreground">
            {papel === "monitor" ? "Solicitou" : "Com"} {papel === "monitor" ? reserva.jogo : (
              <Link to={monitorPath({ slug: reserva.monitor_slug, id: reserva.monitor_id })} className="font-600 text-primary dark:text-accent hover:underline">{reserva.monitor_nome}</Link>
            )}
            {papel === "monitor" ? "" : ` · ${reserva.jogo}`}
          </p>
        </div>
        <span className={`inline-flex items-center min-h-8 px-2.5 rounded-full text-xs font-700 ${COR[reserva.status] || "bg-muted"}`}>
          {status.label}
        </span>
      </div>
      <p className="text-sm">
        <span className="font-600">{formatarDataLonga(reserva.data)}</span>
        {" · "}{reserva.inicio}–{fimDoHorario(reserva.inicio, reserva.duracao_horas)}
        {" · "}{reserva.duracao_horas}h
      </p>
      {local && <p className="text-sm text-muted-foreground break-words">{local}</p>}
      {(reserva.jogos_evento || []).length > 0 && (
        <details className="text-sm rounded-lg border border-border px-3 py-2">
          <summary className="cursor-pointer font-600 min-h-8 flex items-center">
            Jogos do evento ({reserva.jogos_evento.length}){papel === "monitor" ? " · estude antes" : ""}
          </summary>
          <ul className="mt-2 columns-1 sm:columns-2 gap-6 text-muted-foreground">
            {reserva.jogos_evento.map((j) => <li key={j} className="break-words">{j}</li>)}
          </ul>
        </details>
      )}
      {reserva.observacao && <p className="text-sm break-words">“{reserva.observacao}”</p>}
      <p className="text-sm text-muted-foreground">{status.descricao} O valor é combinado entre vocês, fora do site.</p>
      {textoPagamento(reserva) && <p className="text-sm">{textoPagamento(reserva)}</p>}
      {papel === "cliente" && reserva.status === "solicitada" && (
        <p className="text-sm text-muted-foreground">{TEXTO_CONTATO_APOS_CONFIRMACAO}</p>
      )}
      {mostraContato && (
        <div className="space-y-2">
          <p className="text-sm font-600">Contato do monitor</p>
          {contato === null && <p className="text-sm text-muted-foreground">Carregando contato…</p>}
          {contato === false && <p className="text-sm text-muted-foreground">Não foi possível carregar o contato.</p>}
          {contato && <BotoesContato contato={contato} />}
          {contato && !contato.whatsapp && !contato.instagram && !contato.email && (
            <p className="text-sm text-muted-foreground">Este monitor não informou um contato.</p>
          )}
        </div>
      )}
      {acoes.filter((a) => a !== "avaliar").length > 0 && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {acoes.filter((a) => a !== "avaliar").map((acao) => (
            <Button
              key={acao}
              type="button"
              variant={acao === "cancelar" ? "outline" : "default"}
              className={acao === "cancelar" ? "text-destructive" : ""}
              disabled={!!ocupado}
              onClick={() => agir(acao)}
            >
              {ocupado === acao ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {ROTULO_ACAO[acao]}
            </Button>
          ))}
        </div>
      )}
      {acoes.includes("avaliar") && (
        <FormAvaliar reservaId={reserva.id} onFeito={() => onAvaliada(reserva.id)} />
      )}
    </article>
  );
}

export default function MinhasReservas() {
  const { user } = useAuth();
  const [cliente, setCliente] = useState([]);
  const [monitor, setMonitor] = useState([]);
  const [avaliadas, setAvaliadas] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState("cliente");

  const carregar = async () => {
    setLoading(true);
    try {
      await invocar("expirarReservas", {}).catch(() => null);
      const [c, m] = await Promise.all([
        listarTudo(base44.entities.ReservaMonitor, { cliente_id: user.id }, { sort: "-created_date", limit: 100 }),
        listarTudo(base44.entities.ReservaMonitor, { monitor_owner_id: user.id }, { sort: "-created_date", limit: 100 }),
      ]);
      const finalizadas = c.filter((r) => r.status === "finalizada").map((r) => r.id);
      const a = finalizadas.length
        ? await listarPorIds(base44.entities.AvaliacaoMonitor, "reserva_id", finalizadas, { limit: 50, fields: ["reserva_id"] })
        : [];
      setCliente(c.map(marcarExpirada));
      setMonitor(m.map(marcarExpirada));
      setAvaliadas(new Set(a.map((item) => item.reserva_id)));
      if (m.length && !c.length) setAba("monitor");
    } catch {
      setCliente([]);
      setMonitor([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) carregar();
  }, [user]);

  const ordenar = (lista, papel) => [...lista].sort((a, b) => {
    const pa = acoesReserva(a, papel, avaliadas.has(a.id)).some((acao) => acao !== "cancelar") ? 0 : 1;
    const pb = acoesReserva(b, papel, avaliadas.has(b.id)).some((acao) => acao !== "cancelar") ? 0 : 1;
    return pa - pb || String(a.data).localeCompare(String(b.data)) || String(a.inicio).localeCompare(String(b.inicio));
  });

  const listas = {
    cliente: ordenar(cliente, "cliente").map((r) => ({ ...r, _papel: papelNaReserva(user, r) || "cliente" })),
    monitor: ordenar(monitor, "monitor").map((r) => ({ ...r, _papel: papelNaReserva(user, r) || "monitor" })),
  };

  const pendencias = useMemo(() => (
    listas.cliente.filter((r) => acoesReserva(r, "cliente", avaliadas.has(r.id)).some((a) => a !== "cancelar")).length
    + listas.monitor.filter((r) => acoesReserva(r, "monitor", avaliadas.has(r.id)).some((a) => a !== "cancelar")).length
  ), [cliente, monitor, avaliadas, user]);

  const atualizar = (reserva) => {
    const porId = (lista) => lista.map((r) => (r.id === reserva.id ? marcarExpirada({ ...r, ...reserva }) : r));
    setCliente(porId);
    setMonitor(porId);
  };

  const atual = listas[aba];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="font-display font-700 text-3xl sm:text-4xl flex items-center gap-2">
          <CalendarCheck className="w-8 h-8 text-accent-ink" aria-hidden="true" /> Minhas reservas
        </h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Acompanhe pedidos, confirmação, pagamento combinado entre as duas partes e a avaliação depois do atendimento.
        </p>
        {pendencias > 0 && (
          <p className="mb-4 rounded-xl bg-accent/20 text-accent-ink px-4 py-3 text-sm font-600" role="status">
            {pendencias} {pendencias === 1 ? "pendência pede" : "pendências pedem"} a sua ação.
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Tipo de reserva">
          <button type="button" role="tab" aria-selected={aba === "cliente"} onClick={() => setAba("cliente")} className={`min-h-11 px-4 rounded-lg text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${aba === "cliente" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            Como cliente ({cliente.length})
          </button>
          <button type="button" role="tab" aria-selected={aba === "monitor"} onClick={() => setAba("monitor")} className={`min-h-11 px-4 rounded-lg text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${aba === "monitor" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            Como monitor ({monitor.length})
          </button>
        </div>

        {loading ? (
          <LogoSpinner />
        ) : atual.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              {aba === "cliente" ? "Você ainda não pediu uma reserva." : "Ninguém reservou seu horário ainda."}
            </p>
            <Button asChild className="mt-4">
              <Link to={aba === "cliente" ? "/monitores" : "/painel/monitor"}>
                {aba === "cliente" ? "Ver monitores" : "Editar meu perfil"}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4" role="tabpanel">
            {atual.map((r) => (
              <CartaoReserva
                key={`${aba}-${r.id}`}
                reserva={r}
                avaliada={avaliadas.has(r.id)}
                onAtualizar={atualizar}
                onAvaliada={(id) => setAvaliadas((s) => new Set([...s, id]))}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
