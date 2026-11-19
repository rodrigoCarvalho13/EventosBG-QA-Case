import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin } from "lucide-react";
import TagBadges from "@/components/TagBadges";
import { NotaResumo } from "@/components/EstrelasNota";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import { generoVisivel, idadeVisivel, monitorPath, resumoLocais, textoPreco } from "@/lib/monitores";
import ComCurtir from "@/components/CurtirBotao";

function MonitorCardBase({ monitor }) {
  const preco = textoPreco(monitor);
  const locais = resumoLocais(monitor);
  const meta = [idadeVisivel(monitor.idade), generoVisivel(monitor.genero)].filter(Boolean).join(" · ");
  return (
    <Link
      to={monitorPath(monitor)}
      className="press group flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border card-shadow hover:-translate-y-1 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-white overflow-hidden">
        {monitor.photo_url ? (
          <img
            {...imagemOtimizada(monitor.photo_url, { width: 640, height: 480, crop: true, larguras: [320, 480, 640] })}
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
            alt={`Foto de ${monitor.name || "monitor"}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 dice-pattern grid place-items-center">
            <GraduationCap className="w-14 h-14 text-primary/40" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
        <h2 className="font-display font-700 text-lg leading-tight group-hover:text-primary transition-colors break-words">
          {monitor.name}
        </h2>
        {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
        {(monitor.servicos || []).length > 0 && (
          <p className="text-sm font-600 text-accent-ink break-words">{monitor.servicos.slice(0, 3).join(" · ")}</p>
        )}
        {locais && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span className="break-words">{locais}</span>
          </p>
        )}
        {(monitor.tipos_evento || []).length > 0 && (
          <p className="text-sm text-muted-foreground break-words">
            {(monitor.tipos_evento || []).slice(0, 2).join(" · ")}
            {monitor.tipos_evento.length > 2 ? ` +${monitor.tipos_evento.length - 2}` : ""}
          </p>
        )}
        <TagBadges tags={monitor.estilos} limit={3} />
        {(monitor.jogos || []).length > 0 && (
          <p className="text-sm break-words">
            <span className="font-600">Ensina </span>
            {monitor.jogos.slice(0, 3).join(", ")}
            {monitor.jogos.length > 3 ? ` +${monitor.jogos.length - 3}` : ""}
          </p>
        )}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-600 break-words">{preco || "Valor a combinar"}</p>
            <NotaResumo nota={monitor.nota_media} total={monitor.total_avaliacoes} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MonitorCard(props) {
  return (
    <ComCurtir tipo="monitor" id={props.monitor?.id}>
      <MonitorCardBase {...props} />
    </ComCurtir>
  );
}
