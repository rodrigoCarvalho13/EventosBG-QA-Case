import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/VideoCard";
import { podcastPath } from "@/lib/podcasts";
import { imagemOtimizada } from "@/lib/imagemOtimizada";
import ComCurtir from "@/components/CurtirBotao";

function PodcastCardBase({ podcast }) {
  return (
    <Link
      to={podcastPath(podcast)}
      className="group flex flex-col items-center text-center rounded-3xl bg-card border border-border p-5 card-shadow hover:-translate-y-1 transition-transform"
    >
      <span className="rounded-3xl p-[3px] bg-accent">
        {podcast.photo_url ? (
          <img {...imagemOtimizada(podcast.photo_url, { width: 96, crop: true })} alt={podcast.name || "Capa do podcast"} loading="lazy" className="w-24 h-24 rounded-[1.25rem] object-cover" />
        ) : (
          <Avatar name={podcast.name} className="w-24 h-24 !rounded-[1.25rem] text-3xl !ring-0" />
        )}
      </span>
      <span className="mt-3 font-display font-700 leading-tight">{podcast.name}</span>
      {podcast.bio && <span className="mt-1 text-xs text-muted-foreground line-clamp-2">{podcast.bio}</span>}
    </Link>
  );
}

export default function PodcastCard(props) {
  return (
    <ComCurtir tipo="podcast" id={props.podcast?.id}>
      <PodcastCardBase {...props} />
    </ComCurtir>
  );
}
