import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Repeat, MapPin, Store, Star } from "lucide-react";
import ArteEvento from "@/components/ArteEvento";
import TagBadges from "@/components/TagBadges";
import { formatDistancia } from "@/lib/geo";
import { entradaTexto, publicoLabel } from "@/lib/eventoInfo";
import { dataFinal, formatarPeriodo } from "@/lib/eventStatus";
import { eventoPath } from "@/lib/slug";
import ComCurtir from "@/components/CurtirBotao";

const dayLabels = {
  domingo: "Domingo",
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const SIGLA = { domingo: "Dom", segunda: "Seg", terca: "Ter", quarta: "Qua", quinta: "Qui", sexta: "Sex", sabado: "Sáb" };

function ticketTopo(e) {
  if (e.recurrence_type === "fixa") return "toda";
  if (!e.event_date) return "em";
  return new Date(e.event_date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function ticketMeio(e) {
  if (e.recurrence_type === "fixa") return SIGLA[e.day_of_week] || "—";
  if (!e.event_date) return "breve";
  const dia = (iso) => String(new Date(iso + "T00:00:00").getDate()).padStart(2, "0");
  const fim = dataFinal(e);
  return fim !== e.event_date ? `${dia(e.event_date)}–${dia(fim)}` : dia(e.event_date);
}

// compacto: no celular vira uma linha (arte à esquerda) para caberem mais eventos na tela.
function EventoCardBase({ evento, largo = false, compacto = false }) {
  const isFixa = evento.recurrence_type === "fixa";
  return (
    <Link
      to={eventoPath(evento)}
      className={`press group flex w-full min-w-0 overflow-hidden rounded-2xl bg-card border border-border card-shadow hover:-translate-y-0.5 hover:shadow-lg transition-all ${largo ? "flex-row" : compacto ? "flex-row sm:flex-col" : "flex-col"}`}
    >
      <div className={`relative shrink-0 bg-board ${largo ? "w-28 self-stretch sm:w-48" : compacto ? "w-28 self-stretch sm:w-auto" : ""}`}>
        <ArteEvento evento={evento} className={largo ? "h-full min-h-36 w-full sm:h-64" : compacto ? "h-full min-h-36 sm:h-52" : "h-44 sm:h-52"} />
        <span
          className={`absolute grid place-items-center rounded-xl ${compacto || largo ? "bottom-1.5 left-1.5 min-w-11 px-1.5 py-1 sm:bottom-2 sm:left-2 sm:min-w-[3.25rem] sm:px-2 sm:py-1.5" : "bottom-2 left-2 min-w-[3.25rem] px-2 py-1.5"} bg-card/95 text-foreground shadow-md leading-none text-center backdrop-blur`}
          aria-hidden="true"
        >
          <span className="text-xs font-700 uppercase tracking-wider text-accent-ink">{ticketTopo(evento)}</span>
          <span className={`font-display font-900 mt-0.5 ${compacto || largo ? "text-base sm:text-xl" : "text-xl"}`}>{ticketMeio(evento)}</span>
        </span>
      </div>
      <div className={`flex-1 min-w-0 ${compacto || largo ? "p-3 sm:p-4" : "p-4"}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          {evento._destaque && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-700 bg-accent text-accent-foreground">
              <Star className="w-3 h-3 fill-current" aria-hidden="true" /> Destaque
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600 ${
              isFixa ? "bg-primary/10 text-primary dark:text-foreground" : "bg-accent/20 text-foreground"
            }`}
          >
            {isFixa ? <Repeat className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {isFixa ? dayLabels[evento.day_of_week] || "Fixa" : formatarPeriodo(evento)}
          </span>
          {typeof evento._dist === "number" && (
            <span className="inline-flex items-center gap-1 text-xs font-600 text-muted-foreground" data-testid="horaCardTest">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {formatDistancia(evento._dist)}
            </span>
          )}
          {entradaTexto(evento) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 border border-border text-foreground" data-testid="priceTag">
              {entradaTexto(evento)}
            </span>
          )}
          {evento.publico && evento.publico !== "misto" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 bg-secondary text-secondary-foreground">
              {publicoLabel(evento.publico)}
            </span>
          )}
        </div>
        <h3 className="font-display font-700 text-base leading-tight group-hover:text-primary transition-colors line-clamp-2" data-testid="eventoTitulo">
          {evento.title}
        </h3>
        {(evento.start_time || evento.loja_name || evento.location_name) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {evento.start_time && (
              <span className="flex items-center gap-1" data-testid="horaCardTest">
                <Clock className="w-3 h-3" />
                {evento.start_time}
                {evento.end_time ? `–${evento.end_time}` : ""}
              </span>
            )}
            {(evento.loja_name || evento.location_name) && (
              <span className="flex items-center gap-1 truncate" data-testid="localCardTest">
                {evento.loja_name ? <Store className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                {evento.loja_name || evento.location_name}
              </span>
            )}
          </div>
        )}
        <TagBadges tags={evento.tags} limit={3} className="mt-1.5" />
      </div>
    </Link>
  );
}

export default function EventoCard(props) {
  return (
    <ComCurtir tipo="evento" id={props.evento?.id}>
      <EventoCardBase {...props} />
    </ComCurtir>
  );
}
