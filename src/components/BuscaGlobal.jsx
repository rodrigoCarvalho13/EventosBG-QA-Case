import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  CalendarDays,
  Store,
  GraduationCap,
  Newspaper,
  ArrowRight,
  Plus,
  Clapperboard,
  Loader2,
} from "lucide-react";
import { useEstado, filtroEstado } from "@/lib/regiao";
import { casa } from "@/lib/busca";
import { proximaOcorrencia } from "@/lib/eventStatus";
import { eventoPath, lojaPath } from "@/lib/slug";
import { filtrarMonitores, monitorPath } from "@/lib/monitores";
import { listarTudo } from "@/lib/paginar";
import { CAMPOS_MATERIA_LISTA, materiaPath, materiaPublicada, ordenarMaterias } from "@/lib/materias";

const POR_GRUPO = 5;
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const TIPOS_LOJA = {
  loja: "Loja", luderia: "Ludoteca", cafe: "Café", bar: "Bar", espaco: "Espaço", organizador: "Grupo", editora: "Editora",
};
const ATALHOS = [
  { to: "/eventos", titulo: "Agenda completa", icon: CalendarDays },
  { to: "/lojas", titulo: "Lugares e lojas", icon: Store },
  { to: "/monitores", titulo: "Monitores", icon: GraduationCap },
  { to: "/materias", titulo: "Matérias", icon: Newspaper },
  { to: "/influencers", titulo: "Influenciadores", icon: Clapperboard },
  { to: "/cadastrar", titulo: "Cadastrar meu evento ou espaço", icon: Plus },
];

// Os dados ficam em memória por estado: a segunda abertura é instantânea.
const cache = new Map();

function carregar(sigla) {
  if (cache.has(sigla)) return cache.get(sigla);
  const filtro = { status: "approved", ...filtroEstado(sigla) };
  const seguro = (p) => p.catch(() => []);
  const promessa = Promise.all([
    seguro(
      base44.entities.Programacao.filter(filtro, {
        sort: "-created_date",
        limit: 200,
        fields: ["title", "slug", "loja_name", "location_name", "neighborhood", "cidade", "tags", "entrada", "recurrence_type", "day_of_week", "event_date", "event_end_date", "start_time", "end_time"],
      }).then((p) => p.items || [])
    ),
    seguro(
      base44.entities.Loja.filter(filtro, {
        sort: "-created_date",
        limit: 200,
        fields: ["name", "slug", "type", "neighborhood", "cidade", "tags", "acervo"],
      }).then((p) => p.items || [])
    ),
    seguro(
      listarTudo(base44.entities.Monitor, { publicado: true }, {
        sort: "-created_date",
        limit: 100,
        fields: ["name", "slug", "jogos", "estilos", "servicos", "cidades", "bairros", "locais", "estado", "publicado"],
      }).then((itens) => filtrarMonitores(itens, { estado: sigla }))
    ),
    seguro(
      listarTudo(base44.entities.Materia, { publicada: true, ...filtroEstado(sigla) }, {
        sort: "-publicada_em",
        limit: 50,
        maxPaginas: 2,
        fields: [...CAMPOS_MATERIA_LISTA, "tags"],
      }).then((itens) => ordenarMaterias(itens.filter(materiaPublicada)))
    ),
  ]).then(([eventos, lojas, monitores, materias]) => ({
    eventos: eventos
      .map((e) => ({ ...e, _prox: proximaOcorrencia(e) }))
      .filter((e) => e._prox)
      .sort((a, b) => a._prox - b._prox),
    lojas,
    monitores,
    materias,
  }));
  cache.set(sigla, promessa);
  promessa.catch(() => cache.delete(sigla));
  return promessa;
}

function quando(e) {
  const d = e._prox;
  const hora = e.start_time ? ` · ${e.start_time.slice(0, 5).replace(":00", "h").replace(/^0/, "")}` : "";
  return `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}${hora}`;
}

// Quando a busca acha o lugar pelo acervo, mostra qual jogo ele tem.
function jogoDoAcervo(termo, loja) {
  if (casa(termo, loja.name, loja.neighborhood, loja.cidade, loja.tags)) return "";
  const jogo = (loja.acervo || []).find((j) => casa(termo, j));
  return jogo ? `Tem ${jogo}` : "";
}

function Linha({ icon: Icon, titulo, sub }) {
  return (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-accent-ink">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-600">{titulo}</span>
        {sub && <span className="block truncate text-xs text-muted-foreground">{sub}</span>}
      </span>
    </>
  );
}

export default function BuscaGlobal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { sigla } = useEstado();
  const [termo, setTermo] = useState("");
  const [dados, setDados] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let ativo = true;
    setDados(null);
    carregar(sigla).then((d) => ativo && setDados(d));
    return () => { ativo = false; };
  }, [open, sigla]);

  useEffect(() => {
    if (!open) setTermo("");
  }, [open]);

  const ir = (to) => {
    onOpenChange(false);
    navigate(to);
  };

  const t = termo.trim();
  const grupos = useMemo(() => {
    if (!dados || !t) return null;
    const eventos = dados.eventos.filter((e) =>
      casa(t, e.title, e.loja_name, e.location_name, e.neighborhood, e.cidade, e.tags, e.recurrence_type === "fixa" ? e.day_of_week : "", e.entrada === "gratuito" ? "gratis gratuito" : "")
    );
    const lojas = dados.lojas.filter((l) => casa(t, l.name, TIPOS_LOJA[l.type], l.neighborhood, l.cidade, l.tags, l.acervo));
    const monitores = dados.monitores.filter((m) => casa(t, m.name, m.jogos, m.estilos, m.servicos, m.cidades, m.bairros, m.locais));
    const materias = dados.materias.filter((m) => casa(t, m.titulo, m.subtitulo, m.tags));
    return { eventos, lojas, monitores, materias };
  }, [dados, t]);

  const total = grupos ? grupos.eventos.length + grupos.lojas.length + grupos.monitores.length + grupos.materias.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[6%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:top-[12%]">
        <DialogTitle className="sr-only">Buscar no site</DialogTitle>
        <DialogDescription className="sr-only">Busque eventos, lugares, monitores e matérias.</DialogDescription>
        <Command shouldFilter={false} loop className="bg-card">
          <CommandInput
            value={termo}
            onValueChange={setTermo}
            placeholder="Evento, lugar, monitor, matéria…"
            aria-label="Buscar no site"
            className="h-14 text-base"
          />
          <CommandList className="max-h-[65vh] sm:max-h-[28rem]">
            {!t && (
              <>
                <div className="flex flex-wrap items-center gap-2 px-3 pb-1 pt-3">
                  <span className="text-xs text-muted-foreground">Experimente:</span>
                  {["grátis", "sábado", "RPG", "cartas"].map((sugestao) => (
                    <button
                      key={sugestao}
                      type="button"
                      onClick={() => setTermo(sugestao)}
                      className="min-h-9 rounded-full bg-muted px-3 text-sm font-600 hover:bg-accent/30"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
                {dados && dados.eventos.length > 0 && (
                  <CommandGroup heading="Próximos eventos">
                    {dados.eventos.slice(0, 4).map((e) => (
                      <CommandItem key={e.id} value={`ev-${e.id}`} onSelect={() => ir(eventoPath(e))} className="min-h-12 gap-3">
                        <Linha icon={CalendarDays} titulo={e.title} sub={[quando(e), e.loja_name || e.location_name].filter(Boolean).join(" · ")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {!dados && (
                  <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Carregando…
                  </p>
                )}
                <CommandGroup heading="Ir para">
                  {ATALHOS.map(({ to, titulo, icon: Icon }) => (
                    <CommandItem key={to} value={`ir-${to}`} onSelect={() => ir(to)} className="min-h-12 gap-3">
                      <Linha icon={Icon} titulo={titulo} />
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {t && !dados && (
              <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Buscando…
              </p>
            )}

            {t && grupos && total === 0 && (
              <CommandEmpty>
                <p className="font-600">Nada encontrado para “{t}”.</p>
                <p className="mx-auto mt-1 max-w-xs text-muted-foreground">
                  Confira a escrita ou tente o nome do bairro, do espaço ou do jogo.
                </p>
              </CommandEmpty>
            )}

            {grupos && grupos.eventos.length > 0 && (
              <CommandGroup heading={`Eventos (${grupos.eventos.length})`}>
                {grupos.eventos.slice(0, POR_GRUPO).map((e) => (
                  <CommandItem key={e.id} value={`ev-${e.id}`} onSelect={() => ir(eventoPath(e))} className="min-h-12 gap-3">
                    <Linha icon={CalendarDays} titulo={e.title} sub={[quando(e), e.loja_name || e.location_name].filter(Boolean).join(" · ")} />
                  </CommandItem>
                ))}
                {grupos.eventos.length > POR_GRUPO && (
                  <CommandItem value="ev-todos" onSelect={() => ir(`/eventos?q=${encodeURIComponent(t)}`)} className="min-h-11 text-primary dark:text-accent">
                    <span className="text-sm font-600">Ver os {grupos.eventos.length} eventos</span>
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            {grupos && grupos.lojas.length > 0 && (
              <CommandGroup heading={`Lugares, lojas e grupos (${grupos.lojas.length})`}>
                {grupos.lojas.slice(0, POR_GRUPO).map((l) => (
                  <CommandItem key={l.id} value={`lj-${l.id}`} onSelect={() => ir(lojaPath(l))} className="min-h-12 gap-3">
                    <Linha icon={Store} titulo={l.name} sub={[TIPOS_LOJA[l.type], l.neighborhood || l.cidade, jogoDoAcervo(t, l)].filter(Boolean).join(" · ")} />
                  </CommandItem>
                ))}
                {grupos.lojas.length > POR_GRUPO && (
                  <CommandItem value="lj-todos" onSelect={() => ir("/lojas")} className="min-h-11 text-primary dark:text-accent">
                    <span className="text-sm font-600">Ver todos os lugares</span>
                    <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            {grupos && grupos.monitores.length > 0 && (
              <CommandGroup heading={`Monitores (${grupos.monitores.length})`}>
                {grupos.monitores.slice(0, POR_GRUPO).map((m) => (
                  <CommandItem key={m.id} value={`mo-${m.id}`} onSelect={() => ir(monitorPath(m))} className="min-h-12 gap-3">
                    <Linha icon={GraduationCap} titulo={m.name} sub={[].concat(m.cidades || []).filter((c) => typeof c === "string").slice(0, 2).join(", ")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {grupos && grupos.materias.length > 0 && (
              <CommandGroup heading={`Matérias (${grupos.materias.length})`}>
                {grupos.materias.slice(0, POR_GRUPO).map((m) => (
                  <CommandItem key={m.id || m.slug} value={`ma-${m.id || m.slug}`} onSelect={() => ir(materiaPath(m))} className="min-h-12 gap-3">
                    <Linha icon={Newspaper} titulo={m.titulo} sub={m.subtitulo} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <p className="hidden border-t border-border px-4 py-2 text-xs text-muted-foreground sm:block">
          <kbd className="rounded border border-border px-1">↑</kbd> <kbd className="rounded border border-border px-1">↓</kbd> navegar ·{" "}
          <kbd className="rounded border border-border px-1">Enter</kbd> abrir · <kbd className="rounded border border-border px-1">Esc</kbd> fechar
        </p>
      </DialogContent>
    </Dialog>
  );
}
