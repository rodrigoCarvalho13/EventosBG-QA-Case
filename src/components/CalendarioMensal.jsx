import { dataFinal } from "@/lib/eventStatus";
import { eventoPath } from "@/lib/slug";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArteEvento from "@/components/ArteEvento";

const WEEKDAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Returns the events that happen on a given calendar date.
function eventsForDate(eventos, date) {
  const iso = toISO(date);
  const weekdayKey = WEEKDAYS[date.getDay()];
  return eventos
    .filter(
      (e) =>
        (e.recurrence_type === "fixa" && e.day_of_week === weekdayKey) ||
        (e.recurrence_type === "unica" && e.event_date && e.event_date <= iso && iso <= dataFinal(e))
    )
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || "") || (a.title || "").localeCompare(b.title || "", "pt-BR"));
}

// Builds a 6-row grid (42 cells) covering the month.
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const start = new Date(year, month, 1 - startOffset);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

export default function CalendarioMensal({ eventos, loading }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    cells.forEach((d) => {
      const key = toISO(d);
      map.set(key, eventsForDate(eventos, d));
    });
    return map;
  }, [cells, eventos]);

  const selectedKey = toISO(selected);
  const selectedEvents = eventsByDate.get(selectedKey) || [];
  const monthEventCount = useMemo(
    // Conta cada evento uma vez (um evento de 3 dias não vira 3 programações).
    () => {
      const ids = new Set();
      cells
        .filter((d) => d.getMonth() === month)
        .forEach((d) => (eventsByDate.get(toISO(d)) || []).forEach((e) => ids.add(e.id)));
      return ids.size;
    },
    [cells, eventsByDate, month]
  );

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
  };

  const isSameMonth = (d) => d.getMonth() === month;
  const isToday = (d) => toISO(d) === toISO(today);
  const isSelected = (d) => toISO(d) === selectedKey;

  return (
    <div>
      {/* Header / navigation */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-700 text-xl sm:text-2xl">
            {MONTH_LABELS[month]} <span className="text-muted-foreground font-500">{year}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Carregando…" : `${monthEventCount} ${monthEventCount === 1 ? "programação" : "programações"} neste mês`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToday} className="hidden sm:inline-flex">
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mês anterior">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Próximo mês">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-600 text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1" data-testid="calendarioGrid">
        {cells.map((d) => {
          const key = toISO(d);
          const dayEvents = eventsByDate.get(key) || [];
          const inMonth = isSameMonth(d);
          const todayCell = isToday(d);
          const selectedCell = isSelected(d);
          const visiveis = dayEvents.slice(0, 2);
          return (
            <button
              data-testid={`calendarioCell-${key}`}
              key={key}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={selectedCell}
              aria-label={`${d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}${dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "programação" : "programações"}` : ", sem programação"}`}
              className={`relative min-h-12 sm:min-h-[104px] rounded-lg border p-1 text-left transition-colors flex flex-col gap-0.5 ${
                selectedCell
                  ? "border-primary bg-primary/5"
                  : inMonth
                    ? "border-border bg-card hover:border-primary/40"
                    : "border-dashed border-border bg-muted/40 hover:border-primary/40"
              }`}
            >
              <span
                className={`text-xs font-600 leading-none ${
                  todayCell
                    ? "grid place-items-center w-5 h-5 rounded-full bg-accent text-accent-foreground"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {d.getDate()}
              </span>
              <div className="hidden min-[480px]:flex flex-col gap-0.5 overflow-hidden">
                {visiveis.map((e) => (
                  <span
                    key={e.id}
                    title={e.title}
                    className={`line-clamp-2 rounded px-1 py-0.5 text-xs font-500 leading-tight ${
                      e.recurrence_type === "fixa"
                        ? "bg-primary/15 text-foreground"
                        : "bg-accent/25 text-foreground"
                    }`}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > visiveis.length && (
                  <span className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - visiveis.length} mais
                  </span>
                )}
              </div>
              {dayEvents.length > 0 && (
                <span className="min-[480px]:hidden mt-auto flex flex-wrap items-center gap-0.5" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={`w-1.5 h-1.5 rounded-full ${e.recurrence_type === "fixa" ? "bg-primary" : "bg-accent-ink"}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs font-600 leading-none text-muted-foreground">+{dayEvents.length - 3}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="font-display font-700 text-lg" data-testid="data-final">
            {selected.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </h3>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center bg-card rounded-xl border border-border">
            Nenhuma programação neste dia.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <Link
                key={e.id}
                to={eventoPath(e)}
                className="flex items-center gap-3 min-h-11 rounded-xl bg-card border border-border card-shadow hover:-translate-y-0.5 transition-transform p-3"
              >
                <ArteEvento evento={e} className="w-14 h-[4.5rem] shrink-0 rounded-lg" />
                {e.recurrence_type === "fixa" && (
                  <span className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600 shrink-0 bg-primary/10 text-primary dark:text-foreground">
                    Semanal
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-700 text-sm leading-tight truncate">{e.title}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {e.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {e.start_time}
                        {e.end_time ? `–${e.end_time}` : ""}
                      </span>
                    )}
                    {(e.loja_name || e.location_name) && (
                      <span className="flex items-center gap-1 truncate">
                        {e.loja_name ? <Store className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {e.loja_name || e.location_name}
                      </span>
                    )}
                    {e._dist != null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e._dist < 1 ? `${Math.round(e._dist * 1000)} m` : `${e._dist.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}