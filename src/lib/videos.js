// Vídeos de YouTube, TikTok e Instagram: lê o link colado pela pessoa,
// monta o player embutido e o link para abrir no próprio aplicativo.

export const PLATAFORMAS = {
  youtube: { label: "YouTube", cor: "from-red-600 to-red-500", texto: "text-red-500" },
  tiktok: { label: "TikTok", cor: "from-zinc-900 to-zinc-700", texto: "text-foreground" },
  instagram: { label: "Instagram", cor: "from-accent to-accent", texto: "text-accent-ink" },
};

const urlSegura = (texto) => {
  try {
    const u = new URL(texto.trim().startsWith("http") ? texto.trim() : `https://${texto.trim()}`);
    return u;
  } catch {
    return null;
  }
};

// Devolve { platform, video_id, vertical, url } ou { erro }.
export function lerLinkVideo(texto) {
  const u = texto && urlSegura(texto);
  if (!u) return { erro: "Cole o link completo do vídeo." };
  const host = u.hostname.replace(/^(www|m|vm|vt)\./, "");
  const partes = u.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && partes[0]) {
    return { platform: "youtube", video_id: partes[0], vertical: false, url: `https://www.youtube.com/watch?v=${partes[0]}` };
  }
  if (host.endsWith("youtube.com")) {
    const v = u.searchParams.get("v");
    if (v) return { platform: "youtube", video_id: v, vertical: false, url: `https://www.youtube.com/watch?v=${v}` };
    if (["shorts", "live", "embed"].includes(partes[0]) && partes[1]) {
      const vertical = partes[0] === "shorts";
      return {
        platform: "youtube",
        video_id: partes[1],
        vertical,
        url: vertical ? `https://www.youtube.com/shorts/${partes[1]}` : `https://www.youtube.com/watch?v=${partes[1]}`,
      };
    }
    return { erro: "Não achamos o vídeo neste link do YouTube." };
  }
  if (host.endsWith("tiktok.com")) {
    const i = partes.indexOf("video");
    const id = i >= 0 ? partes[i + 1] : null;
    if (id && /^\d+$/.test(id)) {
      const user = partes.find((p) => p.startsWith("@")) || "@";
      return { platform: "tiktok", video_id: id, vertical: true, url: `https://www.tiktok.com/${user}/video/${id}` };
    }
    return { erro: "Use o link completo do TikTok (abra o vídeo no navegador e copie o endereço com /video/)." };
  }
  if (host.endsWith("instagram.com")) {
    if (["p", "reel", "reels", "tv"].includes(partes[0]) && partes[1]) {
      const tipo = partes[0] === "reels" ? "reel" : partes[0];
      return { platform: "instagram", video_id: partes[1], vertical: tipo !== "p", url: `https://www.instagram.com/${tipo}/${partes[1]}/` };
    }
    return { erro: "Use o link de um post ou reel do Instagram." };
  }
  return { erro: "Por enquanto aceitamos vídeos do YouTube, TikTok e Instagram." };
}

export function embedUrl(video) {
  switch (video.platform) {
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0&playsinline=1`;
    case "tiktok":
      return `https://www.tiktok.com/player/v1/${video.video_id}?autoplay=1&rel=0&description=1`;
    case "instagram":
      return `https://www.instagram.com/p/${video.video_id}/embed/`;
    default:
      return null;
  }
}

// Capa enviada pela pessoa; sem ela, só o YouTube dá miniatura sem chave de API
// e nos outros a capa é desenhada.
export const thumbUrl = (video) =>
  video.thumb_url || (video.platform === "youtube" ? `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg` : null);

const semArroba = (h) => (h || "").trim().replace(/^@/, "");

export function linkPerfil(platform, handle) {
  if (!handle) return null;
  const h = handle.trim();
  if (/^https?:\/\//.test(h)) return h;
  if (platform === "instagram") return `https://www.instagram.com/${semArroba(h)}/`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${semArroba(h)}`;
  if (platform === "youtube") return `https://www.youtube.com/@${semArroba(h)}`;
  if (platform === "facebook") return `https://www.facebook.com/${semArroba(h)}`;
  return null;
}

// Perfis antigos, sem slug, seguem pelo id.
export const criadorPath = (c) => `/influencers/${c.slug || c.id}`;
export const videoCriadorPath = (v) => `/influencers/${v.criador_slug || v.criador_id}`;

// Do mais recente para o mais antigo: vale a data de publicação na rede e, sem ela, a do cadastro.
export const dataDoVideo = (v) => v.publicado_em || v.created_date || "";
export const maisRecentesPrimeiro = (lista) => [...lista].sort((a, b) => dataDoVideo(b).localeCompare(dataDoVideo(a)));

// Uma lista por rede (só as que têm vídeo), cada uma já ordenada.
export function videosPorPlataforma(lista) {
  const ordenados = maisRecentesPrimeiro(lista);
  return Object.keys(PLATAFORMAS)
    .map((platform) => ({ platform, videos: ordenados.filter((v) => v.platform === platform) }))
    .filter((g) => g.videos.length > 0);
}
