import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ExternalLink, Users, Clock, Dices } from "lucide-react";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import { tipoLancamento, situacao, periodo } from "@/lib/lancamentos";
import { normalizeUrl } from "@/lib/eventoInfo";

const SELO = {
  aberto: { texto: "Aberto agora", cls: "bg-primary text-primary-foreground" },
  em_breve: { texto: "Em breve", cls: "bg-accent text-accent-foreground" },
  encerrado: { texto: "Encerrado", cls: "bg-muted text-muted-foreground" },
};

export default function LancamentoCard({ lancamento: l, editoraPath }) {
  const tipo = tipoLancamento(l.tipo);
  const sit = situacao(l);
  const link = l.link ? normalizeUrl(l.link) : "";
  return (
    <article className={`flex gap-4 rounded-2xl bg-card border border-border card-shadow p-4 ${sit === "encerrado" ? "opacity-75" : ""}`}>
      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-muted grid place-items-center">
        {l.imagem_url ? (
          <img {...imagemOtimizada(l.imagem_url, { width: 256, height: 256, crop: true })} alt={`Capa de ${l.titulo}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        ) : (
          <Dices className="w-8 h-8 text-accent-ink" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-700 ${SELO[sit].cls}`}>{SELO[sit].texto}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-600 text-muted-foreground">{tipo.label}</span>
        </div>
        <h3 className="font-display font-700 text-lg leading-tight">{l.titulo}</h3>
        <p className="text-sm text-muted-foreground">
          {editoraPath ? <Link to={editoraPath} className="hover:underline">{l.editora}</Link> : l.editora}
        </p>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" aria-hidden="true" /> {periodo(l)}</span>
          {l.jogadores && <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" aria-hidden="true" /> {l.jogadores}</span>}
          {l.duracao && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden="true" /> {l.duracao}</span>}
          {l.preco && <span className="font-700 text-foreground">{l.preco}</span>}
        </p>
        {l.descricao && <p className="mt-2 text-sm line-clamp-2">{l.descricao}</p>}
        {link && sit !== "encerrado" && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 min-h-11 rounded-lg bg-primary text-primary-foreground px-4 text-sm font-600 hover:bg-primary/90"
          >
            {tipo.acao} <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
