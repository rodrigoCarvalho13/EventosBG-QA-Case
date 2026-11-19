import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Globe, Dices, ChevronRight } from "lucide-react";
import { canal, procuraPath, quandoPostou, rotuloModalidadeProcura } from "@/lib/procuro";

export default function ProcuraCard({ procura: p }) {
  const c = canal(p.canal);
  const Icon = c.icon;
  const onde = p.modalidade === "online" ? "Online" : [p.bairro, p.cidade, p.estado].filter(Boolean).join(" · ");
  return (
    <Link
      to={procuraPath(p)}
      className="group flex items-start gap-3 rounded-2xl bg-card border border-border card-shadow p-4 sm:p-5 hover:border-primary/40 transition-colors"
    >
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/20 text-accent-ink shrink-0">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-700 uppercase tracking-[0.12em] text-accent-ink">{c.label}</span>
        <span className="block font-display font-700 text-lg leading-tight mt-0.5 break-words">{p.titulo}</span>
        {p.descricao && <span className="block text-sm text-muted-foreground mt-1 line-clamp-2 break-words">{p.descricao}</span>}
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {p.jogo && <span className="inline-flex items-center gap-1 font-600 text-foreground"><Dices className="w-3.5 h-3.5" aria-hidden="true" /> {p.jogo}</span>}
          {onde && (
            <span className="inline-flex items-center gap-1">
              {p.modalidade === "online" ? <Globe className="w-3.5 h-3.5" aria-hidden="true" /> : <MapPin className="w-3.5 h-3.5" aria-hidden="true" />} {onde}
            </span>
          )}
          {p.modalidade === "tanto_faz" && <span className="rounded-full bg-muted px-2.5 py-0.5 font-600">{rotuloModalidadeProcura(p.modalidade)}</span>}
          <span>{p.autor_nome ? `${p.autor_nome} · ` : ""}{quandoPostou(p.renovado_em || p.created_date)}</span>
        </span>
      </span>
      <ChevronRight className="w-5 h-5 mt-3 text-muted-foreground group-hover:text-primary shrink-0" aria-hidden="true" />
    </Link>
  );
}
