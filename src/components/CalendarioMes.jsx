import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DIAS,
  NOMES_MES,
  ROTULO_DIA,
  datasEntre,
  estadoDiaCalendario,
  gradeDoMes,
  mesesDoHorizonte,
} from "@/lib/monitores";

function classeDia(estado, selecionado, naFaixa) {
  if (selecionado) return "bg-primary text-primary-foreground border-primary";
  if (naFaixa) return "bg-primary/25 border-primary text-foreground";
  if (estado === "disponivel" || estado === "parcial") return "bg-primary/15 border-primary/40 text-foreground";
  if (estado === "bloqueado") return "bg-muted text-muted-foreground border-border";
  if (estado === "reservado") return "bg-destructive/10 text-destructive border-destructive/30";
  if (estado === "passado") return "border-transparent text-muted-foreground/50";
  return "bg-card text-muted-foreground border-border";
}

export default function CalendarioMes({
  modo = "escolher",
  acao = "disponivel",
  onAcaoChange,
  monitor,
  ocupados,
  duracaoHoras = 1,
  selecionada = "",
  onSelecionar,
  onFaixa,
}) {
  const meses = mesesDoHorizonte();
  const [indice, setIndice] = useState(0);
  const [faixa, setFaixa] = useState([]);
  const gradeRef = useRef(null);
  const arrastando = useRef(false);
  const origem = useRef("");
  const faixaRef = useRef([]);
  const mes = meses[Math.min(indice, meses.length - 1)] || meses[0];
  const celulas = gradeDoMes(mes.ano, mes.mes);
  const titulo = `${NOMES_MES[mes.mes]} de ${mes.ano}`;

  const estadoDe = (iso) => estadoDiaCalendario(monitor, iso, { ocupados, duracaoHoras });
  const podeEditar = (iso) => !!iso && estadoDe(iso) !== "passado";
  const podeEscolher = (iso) => {
    const estado = estadoDe(iso);
    return estado === "disponivel" || estado === "parcial";
  };

  const soltar = () => {
    if (!arrastando.current) return;
    arrastando.current = false;
    const datas = faixaRef.current;
    faixaRef.current = [];
    setFaixa([]);
    if (datas.length && onFaixa) onFaixa(datas);
  };

  const mover = (e) => {
    if (!arrastando.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const dia = el?.closest?.("[data-dia]")?.getAttribute("data-dia");
    if (!dia) return;
    const intervalo = datasEntre(origem.current, dia).filter(podeEditar);
    faixaRef.current = intervalo;
    setFaixa(intervalo);
  };

  const comecar = (e) => {
    if (modo !== "editar" || e.button > 0) return;
    const dia = e.target.closest?.("[data-dia]")?.getAttribute("data-dia");
    if (!dia || !podeEditar(dia)) return;
    e.preventDefault();
    arrastando.current = true;
    origem.current = dia;
    faixaRef.current = [dia];
    setFaixa([dia]);
    gradeRef.current?.setPointerCapture?.(e.pointerId);
  };

  const tecla = (e, iso) => {
    const desloca = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (desloca[e.key]) {
      e.preventDefault();
      const alvo = datasEntre(iso, iso)[0];
      const [y, m, d] = alvo.split("-").map(Number);
      const prox = new Date(Date.UTC(y, m - 1, d + desloca[e.key], 15)).toISOString().slice(0, 10);
      gradeRef.current?.querySelector(`[data-dia="${prox}"]`)?.focus();
      return;
    }
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (modo === "editar" && podeEditar(iso)) onFaixa?.([iso]);
    if (modo === "escolher" && podeEscolher(iso)) onSelecionar?.(iso);
  };

  return (
    <div className="space-y-3">
      {modo === "editar" && (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Como marcar os dias">
          <button
            type="button"
            aria-pressed={acao === "disponivel"}
            onClick={() => onAcaoChange?.("disponivel")}
            className={`min-h-11 rounded-lg border px-3 text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              acao === "disponivel" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
            }`}
          >
            Marcar disponível
          </button>
          <button
            type="button"
            aria-pressed={acao === "bloqueado"}
            onClick={() => onAcaoChange?.("bloqueado")}
            className={`min-h-11 rounded-lg border px-3 text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              acao === "bloqueado" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
            }`}
          >
            Bloquear
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mês anterior"
          disabled={indice === 0}
          onClick={() => setIndice((n) => Math.max(0, n - 1))}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <p className="font-display font-700 text-lg capitalize" aria-live="polite">{titulo}</p>
        <button
          type="button"
          aria-label="Próximo mês"
          disabled={indice >= meses.length - 1}
          onClick={() => setIndice((n) => Math.min(meses.length - 1, n + 1))}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="-mx-4 sm:mx-0">
        <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-px px-0.5 sm:gap-1.5 sm:px-0" aria-hidden="true">
          {DIAS.map((dia) => (
            <div key={dia.id} className="h-8 grid place-items-center text-xs font-600 uppercase text-muted-foreground">
              {dia.curto}
            </div>
          ))}
        </div>
        <div
          ref={gradeRef}
          role="grid"
          aria-label={modo === "editar" ? `Calendário de ${titulo}. Arraste para marcar dias.` : `Calendário de ${titulo}`}
          className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-px px-0.5 sm:gap-1.5 sm:px-0 select-none"
          style={{ touchAction: modo === "editar" ? "none" : "manipulation" }}
          onPointerDown={comecar}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
        >
          {Array.from({ length: celulas.length / 7 }, (_, semana) => (
            <div key={semana} role="row" className="contents">
            {celulas.slice(semana * 7, semana * 7 + 7).map((iso, i) => {
            if (!iso) return <div key={`vazio-${semana}-${i}`} className="min-h-11" />;
            const estado = estadoDe(iso);
            const escolhido = modo === "escolher" && selecionada === iso;
            const naFaixa = faixa.includes(iso);
            const ativo = modo === "editar" ? podeEditar(iso) : podeEscolher(iso);
            const numero = Number(iso.slice(8));
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                data-dia={iso}
                aria-disabled={!ativo}
                aria-pressed={escolhido || (modo === "editar" && (estado === "disponivel" || estado === "parcial"))}
                aria-label={`${numero} de ${NOMES_MES[mes.mes]}, ${ROTULO_DIA[estado] || estado}`}
                onClick={() => {
                  if (modo === "escolher" && podeEscolher(iso)) onSelecionar?.(iso);
                }}
                onKeyDown={(e) => tecla(e, iso)}
                className={`min-h-11 rounded-lg border text-sm font-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${ativo ? "" : "cursor-default"} ${classeDia(estado, escolhido, naFaixa)}`}
              >
                <span className="block leading-none">{numero}</span>
                {estado === "parcial" && <span className={`block text-xs leading-tight ${escolhido ? "text-primary-foreground/80" : "text-accent-ink"}`}>reserva</span>}
                {estado === "reservado" && <span className="block text-xs leading-tight">lotado</span>}
            </button>
            );
            })}
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legenda do calendário">
        <li className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/15 border border-primary/40" aria-hidden="true" /> Disponível</li>
        <li className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted border border-border" aria-hidden="true" /> Bloqueado</li>
        <li className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-destructive/10 border border-destructive/30" aria-hidden="true" /> Reservado</li>
      </ul>
    </div>
  );
}
