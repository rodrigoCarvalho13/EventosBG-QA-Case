// Podcasts: lê o link do episódio (Spotify, YouTube, Apple Podcasts ou outro),
// monta o player embutido quando a plataforma permite e o link para abrir no app.

export const PODCAST_PLATAFORMAS = {
  spotify: { label: "Spotify", cor: "from-green-600 to-green-500", texto: "text-green-500" },
  youtube: { label: "YouTube", cor: "from-red-600 to-red-500", texto: "text-red-500" },
  apple: { label: "Apple Podcasts", cor: "from-purple-600 to-fuchsia-500", texto: "text-purple-500" },
  outro: { label: "Ouvir", cor: "from-zinc-800 to-zinc-600", texto: "text-foreground" },
};

const urlSegura = (texto) => {
  try {
    const t = texto.trim();
    return new URL(t.startsWith("http") ? t : `https://${t}`);
  } catch {
    return null;
  }
};

// Devolve { platform, episodio_id, url } ou { erro }.
export function lerLinkEpisodio(texto) {
  const u = texto && urlSegura(texto);
  if (!u) return { erro: "Cole o link completo do episódio." };
  const host = u.hostname.replace(/^(www|m|open|podcasts)\./, "");
  const partes = u.pathname.split("/").filter(Boolean);

  if (host === "spotify.com") {
    const i = partes.findIndex((p) => p === "episode" || p === "show");
    if (i >= 0 && partes[i + 1]) {
      return { platform: "spotify", episodio_id: `${partes[i]}/${partes[i + 1]}`, url: `https://open.spotify.com/${partes[i]}/${partes[i + 1]}` };
    }
    return { erro: "Use o link de um episódio (ou programa) do Spotify." };
  }
  if (host === "youtu.be" && partes[0]) {
    return { platform: "youtube", episodio_id: partes[0], url: `https://www.youtube.com/watch?v=${partes[0]}` };
  }
  if (host.endsWith("youtube.com")) {
    const v = u.searchParams.get("v");
    const id = v || (["live", "embed"].includes(partes[0]) ? partes[1] : null);
    if (id) return { platform: "youtube", episodio_id: id, url: `https://www.youtube.com/watch?v=${id}` };
    return { erro: "Não achamos o vídeo neste link do YouTube." };
  }
  if (host === "apple.com") return { platform: "apple", episodio_id: "", url: u.toString() };
  return { platform: "outro", episodio_id: "", url: u.toString() };
}

export function embedEpisodio(ep) {
  if (ep.platform === "spotify" && ep.episodio_id) return `https://open.spotify.com/embed/${ep.episodio_id}`;
  if (ep.platform === "youtube" && ep.episodio_id) return `https://www.youtube-nocookie.com/embed/${ep.episodio_id}?autoplay=1&rel=0`;
  return null;
}

export const thumbEpisodio = (ep) =>
  ep.thumb_url || (ep.platform === "youtube" && ep.episodio_id ? `https://i.ytimg.com/vi/${ep.episodio_id}/hqdefault.jpg` : null) || ep.podcast_photo || null;

// Links do programa (botões "Ouvir no…").
export const REDES_PODCAST = ["spotify", "apple", "youtube", "instagram", "site"];

export function linkPrograma(rede, valor) {
  if (!valor) return null;
  const v = valor.trim();
  if (/^https?:\/\//.test(v)) return v;
  const h = v.replace(/^@/, "");
  if (rede === "instagram") return `https://www.instagram.com/${h}/`;
  if (rede === "youtube") return `https://www.youtube.com/@${h}`;
  return `https://${v}`;
}

export const ROTULO_REDE = { spotify: "Spotify", apple: "Apple Podcasts", youtube: "YouTube", instagram: "Instagram", site: "Site" };

export { slugify, gerarSlugUnico } from "@/lib/slug";

// Podcasts antigos, sem slug, seguem pelo id.
export const podcastPath = (p) => `/podcasts/${p.slug || p.id}`;
export const episodioPodcastPath = (ep) => `/podcasts/${ep.podcast_slug || ep.podcast_id}`;
