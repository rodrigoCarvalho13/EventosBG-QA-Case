import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, ChevronRight } from "lucide-react";
import { cidadeDe, estadoDe } from "@/lib/regiao";
import { vagaPath, rotuloContratacao, rotuloModalidade } from "@/lib/vagas";

export default function VagaCard({ vaga }) {
  const selos = [rotuloContratacao(vaga.contratacao), rotuloModalidade(vaga.modalidade)].filter(Boolean);
  return (
    <Link
      to={vagaPath(vaga)}
      className="group flex items-start gap-3 rounded-2xl bg-card border border-border card-shadow p-4 sm:p-5 hover:border-primary/40 transition-colors"
    >
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/20 text-accent-ink shrink-0">
        <Briefcase className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-display font-700 text-lg leading-tight">{vaga.titulo}</span>
        <span className="block text-sm text-muted-foreground mt-0.5">{vaga.empresa}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {cidadeDe(vaga)} - {estadoDe(vaga)}
          </span>
          {selos.map((s) => (
            <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 font-600 text-muted-foreground">{s}</span>
          ))}
        </span>
      </span>
      <ChevronRight className="w-5 h-5 mt-3 text-muted-foreground group-hover:text-primary shrink-0" aria-hidden="true" />
    </Link>
  );
}
