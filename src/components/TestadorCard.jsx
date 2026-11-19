import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Globe, FlaskConical, ChevronRight } from "lucide-react";
import { testadorPath, rotuloExperiencia } from "@/lib/testadores";
import { rotuloModalidadeProcura } from "@/lib/procuro";

export default function TestadorCard({ testador: t }) {
  const onde = t.modalidade === "online" ? "Online" : [t.cidade, t.estado].filter(Boolean).join(" · ");
  const tipos = (t.tipos_jogo || []).slice(0, 4);
  const n = (t.jogos_testados || []).length;
  return (
    <Link
      to={testadorPath(t)}
      className="group flex items-start gap-3 rounded-2xl bg-card border border-border card-shadow p-4 sm:p-5 hover:border-primary/40 transition-colors"
    >
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/20 text-accent-ink shrink-0">
        <FlaskConical className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-700 uppercase tracking-[0.12em] text-accent-ink">{rotuloExperiencia(t.experiencia) || "Testador"}</span>
        <span className="block font-display font-700 text-lg leading-tight mt-0.5 break-words">{t.nome}</span>
        {t.bio && <span className="block text-sm text-muted-foreground mt-1 line-clamp-2 break-words">{t.bio}</span>}
        {tipos.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {tipos.map((x) => <span key={x} className="rounded-full bg-primary/10 text-primary text-xs font-600 px-2.5 py-0.5">{x}</span>)}
            {(t.tipos_jogo || []).length > tipos.length && <span className="text-xs text-muted-foreground self-center">+{t.tipos_jogo.length - tipos.length}</span>}
          </span>
        )}
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {onde && (
            <span className="inline-flex items-center gap-1">
              {t.modalidade === "online" ? <Globe className="w-3.5 h-3.5" aria-hidden="true" /> : <MapPin className="w-3.5 h-3.5" aria-hidden="true" />} {onde}
            </span>
          )}
          {t.modalidade === "tanto_faz" && <span className="rounded-full bg-muted px-2.5 py-0.5 font-600">{rotuloModalidadeProcura(t.modalidade)}</span>}
          {n > 0 && <span>{n} {n === 1 ? "jogo testado" : "jogos testados"}</span>}
        </span>
      </span>
      <ChevronRight className="w-5 h-5 mt-3 text-muted-foreground group-hover:text-primary shrink-0" aria-hidden="true" />
    </Link>
  );
}
