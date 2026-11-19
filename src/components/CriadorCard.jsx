import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import PlataformaIcon from "@/components/PlataformaIcon";
import { Avatar } from "@/components/VideoCard";
import { criadorPath } from "@/lib/videos";
import ComCurtir from "@/components/CurtirBotao";

function CriadorCardBase({ criador }) {
  const redes = ["instagram", "youtube", "tiktok"].filter((r) => criador[r]);
  return (
    <Link
      to={criadorPath(criador)}
      className="group flex flex-col items-center text-center rounded-3xl bg-card border border-border p-5 card-shadow hover:-translate-y-1 transition-transform"
    >
      <span className={`rounded-full p-[3px] ${criador.influencer ? "bg-accent" : "bg-border"}`}>
        <span className="block rounded-full bg-card p-[3px]">
          <Avatar name={criador.name} photo={criador.photo_url} className="w-20 h-20 text-2xl !ring-0" />
        </span>
      </span>
      <span className="mt-3 font-display font-700 leading-tight flex items-center gap-1">
        {criador.name}
        {criador.influencer && <Sparkles className="w-4 h-4 text-accent-ink shrink-0" aria-label="Influenciador" />}
      </span>
      {criador.bio && <span className="mt-1 text-xs text-muted-foreground line-clamp-2">{criador.bio}</span>}
      {redes.length > 0 && (
        <span className="mt-3 flex gap-2 text-muted-foreground">
          {redes.map((r) => <PlataformaIcon key={r} platform={r} className="w-4 h-4" />)}
        </span>
      )}
    </Link>
  );
}

export default function CriadorCard(props) {
  return (
    <ComCurtir tipo="criador" id={props.criador?.id}>
      <CriadorCardBase {...props} />
    </ComCurtir>
  );
}
