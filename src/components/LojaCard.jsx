import React from "react";
import { lojaPath } from "@/lib/slug";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import EditoraArt from "@/components/EditoraArt";
import TagBadges from "@/components/TagBadges";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import ComCurtir from "@/components/CurtirBotao";

const typeLabels = {
  luderia: "Espaço de jogos",
  loja: "Loja",
  cafe: "Café",
  bar: "Bar",
  espaco: "Outro espaço",
  organizador: "Grupo",
  editora: "Editora",
};

function LojaCardBase({ loja, parceira = false }) {
  return (
    <Link
      to={lojaPath(loja)}
      aria-label={`${loja.name}${parceira ? " — Parceira" : ""}`}
      data-parceira={parceira ? "true" : "false"}
      className={`press group flex sm:block rounded-2xl overflow-hidden bg-card border card-shadow hover:-translate-y-1 hover:shadow-lg transition-all ${
        parceira ? "border-accent ring-2 ring-accent/40" : "border-border"
      }`}
    >
      <div className="relative shrink-0 w-24 sm:w-auto aspect-square sm:aspect-[4/3] bg-white overflow-hidden border-r sm:border-r-0 sm:border-b border-border">
        {loja.photo_url ? (
          <img
            {...imagemOtimizada(loja.photo_url, { width: 640, height: 480, larguras: [96, 192, 300, 600] })}
            sizes="(min-width: 640px) 300px, 96px"
            alt={loja.name || "Logo"}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-scale-down p-3 bg-white group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : loja.type === "editora" ? (
          <div className="absolute inset-0 bg-board grid place-items-center">
            <EditoraArt className="w-3/4 text-accent/70" />
          </div>
        ) : (
          <div className="absolute inset-0 dice-pattern grid place-items-center">
            <span className="font-display text-5xl text-primary/30">
              {loja.name?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
        <span className="hidden sm:inline-block absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-600 bg-accent text-accent-foreground">
          {typeLabels[loja.type] || "Loja"}
        </span>
        {parceira && (
          <span className="hidden sm:inline-flex absolute top-3 right-3 items-center gap-1 px-2.5 py-1 rounded-full text-xs font-700 bg-primary text-primary-foreground shadow">
            <Star className="w-3 h-3 fill-current" aria-hidden="true" /> Parceira
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4 min-w-0 flex-1">
        <p className="sm:hidden text-xs font-700 uppercase tracking-wide text-accent-ink mb-0.5">
          {typeLabels[loja.type] || "Loja"}
          {parceira && <span className="ml-1.5 inline-flex items-center gap-0.5 text-primary dark:text-accent"><Star className="w-3 h-3 fill-current" aria-hidden="true" /> Parceira</span>}
        </p>
        <h3 className="font-display font-700 text-base sm:text-lg leading-tight mb-1 sm:mb-1.5 line-clamp-3 group-hover:text-primary transition-colors" data-testid="tituloLugar">
          {loja.name}
        </h3>
        {loja.neighborhood && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {loja.neighborhood}
          </p>
        )}
        {loja.description && (
          <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">{loja.description}</p>
        )}
        <TagBadges tags={loja.tags} limit={3} className="mt-2 hidden sm:flex" />
      </div>
    </Link>
  );
}

export default function LojaCard(props) {
  return (
    <ComCurtir tipo="loja" id={props.loja?.id}>
      <LojaCardBase {...props} />
    </ComCurtir>
  );
}
