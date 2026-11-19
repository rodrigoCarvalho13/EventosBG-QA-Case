import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import { dataVisivel, formatarDataLonga, materiaPath } from "@/lib/materias";
import ComCurtir from "@/components/CurtirBotao";

function MateriaCardBase({ materia }) {
  const data = formatarDataLonga(dataVisivel(materia));
  return (
    <Link
      to={materiaPath(materia)}
      className="press group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card card-shadow transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-white">
        {materia.capa_url ? (
          <img
            {...imagemOtimizada(materia.capa_url, { width: 720, height: 480, crop: true, larguras: [360, 540, 720] })}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 45vw, 100vw"
            alt={`Capa de ${materia.titulo || "matéria"}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 dice-pattern" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-lg font-700 leading-tight break-words transition-colors group-hover:text-primary">
          {materia.titulo}
        </h2>
        {materia.subtitulo && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{materia.subtitulo}</p>
        )}
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-sm text-muted-foreground">
          {data && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <time dateTime={dataVisivel(materia)}>{data}</time>
            </span>
          )}
          {materia.cidade && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {materia.cidade}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default function MateriaCard(props) {
  return (
    <ComCurtir tipo="materia" id={props.materia?.id}>
      <MateriaCardBase {...props} />
    </ComCurtir>
  );
}
