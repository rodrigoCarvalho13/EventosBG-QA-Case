// SEO de cada página: título, descrição, canonical, robots, prévia de compartilhamento
// (Open Graph / X) e dados estruturados (JSON-LD). Tudo é aplicado no <head> pelo navegador;
// o Google executa JavaScript e lê essas tags.
import { useEffect } from "react";
import { lojaPath, eventoPath } from "@/lib/slug";
import { materiaPath } from "@/lib/materias";
import { monitorPath, resumoLocais, textoPreco } from "@/lib/monitores";
import { podcastPath } from "@/lib/podcasts";
import { vagaPath } from "@/lib/vagas";
import { criadorPath, linkPerfil } from "@/lib/videos";
import { cidadeDe, estadoDe } from "@/lib/regiao";
import { entradaTexto, normalizeUrl } from "@/lib/eventoInfo";

export const SITE_URL = "https://eventosboardgame.com";
export const NOME_SITE = "eventosboardgame.com";
const IMAGEM_PADRAO = `${SITE_URL}/og-image.jpg`;
const TITULO_PADRAO = `Eventos de board game no DF | ${NOME_SITE}`;
const DESCRICAO_PADRAO =
  "Agenda de eventos de board game no DF: encontros semanais, campeonatos e feiras, além de lojas, ludotecas, grupos, influencers e podcasts da comunidade.";

// ---------- textos ----------

const limpar = (t = "") => String(t).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Corta no fim de uma palavra e põe reticências.
export function cortar(texto, max) {
  const t = limpar(texto);
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const ultimoEspaco = corte.lastIndexOf(" ");
  return `${(ultimoEspaco > max * 0.6 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,.;:–-]+$/, "")}…`;
}

// "Programação" -> "Programação | eventosboardgame.com". O Google mostra cerca de 60 caracteres:
// quando a marca não cabe, ela sai e fica só o nome da página, que vale mais.
export function montarTitulo(base) {
  const t = limpar(base);
  if (!t) return TITULO_PADRAO;
  if (t.toLowerCase().includes("eventosboardgame")) return t;
  const comMarca = `${t} | ${NOME_SITE}`;
  return comMarca.length <= 65 ? comMarca : cortar(t, 65);
}

const absoluta = (url) => (/^https:\/\//.test(url || "") ? url : null);

// ---------- <head> ----------

function meta(atributo, chave, conteudo) {
  const seletor = `meta[${atributo}="${chave}"]`;
  let el = document.head.querySelector(seletor);
  if (conteudo === null || conteudo === undefined || conteudo === "") {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(atributo, chave);
    document.head.appendChild(el);
  }
  el.setAttribute("content", conteudo);
}

function canonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!url) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function jsonLdScripts(itens) {
  document.head.querySelectorAll('script[data-seo="jsonld"]').forEach((s) => s.remove());
  (itens || []).filter(Boolean).forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.seo = "jsonld";
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

export function aplicarSeo({ title, description, path, image, imageAlt, type = "website", noindex = false, jsonLd } = {}) {
  if (typeof document === "undefined") return;
  const caminho = path ?? window.location.pathname;
  const url = `${SITE_URL}${caminho === "/" ? "/" : caminho.replace(/\/$/, "")}`;
  const titulo = montarTitulo(title);
  const desc = cortar(description || DESCRICAO_PADRAO, 160);
  const img = absoluta(image) || IMAGEM_PADRAO;
  const imgPadrao = img === IMAGEM_PADRAO;

  document.title = titulo;
  meta("name", "description", desc);
  meta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1");
  canonical(noindex ? null : url);

  meta("property", "og:type", type);
  meta("property", "og:site_name", NOME_SITE);
  meta("property", "og:locale", "pt_BR");
  meta("property", "og:url", url);
  meta("property", "og:title", titulo);
  meta("property", "og:description", desc);
  meta("property", "og:image", img);
  meta("property", "og:image:secure_url", img);
  meta("property", "og:image:alt", imageAlt || (imgPadrao ? "Logo do eventosboardgame.com: pin de mapa com um meeple sobre o Congresso Nacional" : titulo));
  // As medidas e o tipo só valem para a imagem padrão do site.
  meta("property", "og:image:type", imgPadrao ? "image/jpeg" : null);
  meta("property", "og:image:width", imgPadrao ? "1200" : null);
  meta("property", "og:image:height", imgPadrao ? "630" : null);

  meta("name", "twitter:card", "summary_large_image");
  meta("name", "twitter:title", titulo);
  meta("name", "twitter:description", desc);
  meta("name", "twitter:image", img);

  jsonLdScripts(jsonLd);
}

// Aplica o SEO da página quando o conteúdo muda. `config` nulo = ainda carregando (não mexe).
export function useSeo(config) {
  const chave = config ? JSON.stringify(config) : "";
  useEffect(() => {
    if (config) aplicarSeo(config);
  }, [chave]);
}

// ---------- dados estruturados ----------

const breadcrumb = (itens) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: itens.map(([nome, caminho], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: nome,
    item: `${SITE_URL}${caminho}`,
  })),
});

const semVazios = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)));

export const PAGINA_INICIAL_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: NOME_SITE,
      description: DESCRICAO_PADRAO,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#organizacao` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organizacao`,
      name: NOME_SITE,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png`, width: 512, height: 512 },
      areaServed: { "@type": "AdministrativeArea", name: "Distrito Federal" },
    },
  ],
};

const DIAS = {
  domingo: { idx: 0, schema: "Sunday", rotulo: "todo domingo" },
  segunda: { idx: 1, schema: "Monday", rotulo: "toda segunda" },
  terca: { idx: 2, schema: "Tuesday", rotulo: "toda terça" },
  quarta: { idx: 3, schema: "Wednesday", rotulo: "toda quarta" },
  quinta: { idx: 4, schema: "Thursday", rotulo: "toda quinta" },
  sexta: { idx: 5, schema: "Friday", rotulo: "toda sexta" },
  sabado: { idx: 6, schema: "Saturday", rotulo: "todo sábado" },
};

const br = (iso) => {
  const p = String(iso || "").split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : "";
};

const proximaData = (idx) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + ((idx - d.getDay() + 7) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// "toda sexta, 19:00" ou "14/11/2026, 14:00".
function quando(e) {
  const hora = e.start_time ? `, ${e.start_time}` : "";
  if (e.recurrence_type === "fixa" && DIAS[e.day_of_week]) return `${DIAS[e.day_of_week].rotulo}${hora}`;
  if (e.event_date) return `${br(e.event_date)}${hora}`;
  return "";
}

export function seoEvento(e) {
  const path = eventoPath(e);
  const nome = limpar(e.title);
  const local = [e.location_name || e.loja_name, e.neighborhood].filter(Boolean).join(", ");
  const entrada = entradaTexto(e);
  const quandoTxt = quando(e);
  const sobre = limpar(e.description);
  const descricao =
    sobre.length >= 60
      ? sobre
      : [`${nome}${quandoTxt ? ` — ${quandoTxt}` : ""}${local ? ` em ${local}` : ` em ${cidadeDe(e)}`}.`, entrada ? `Entrada: ${entrada}.` : "", "Veja horário, local e como participar."]
          .filter(Boolean)
          .join(" ");

  const fixa = e.recurrence_type === "fixa" && DIAS[e.day_of_week];
  const dataInicio = fixa ? proximaData(DIAS[e.day_of_week].idx) : e.event_date;
  const inicio = dataInicio ? `${dataInicio}T${e.start_time || "00:00"}:00-03:00` : undefined;
  const dataFim = fixa ? dataInicio : e.event_end_date || e.event_date;
  const fim = dataFim && e.end_time ? `${dataFim}T${e.end_time}:00-03:00` : e.event_end_date ? `${e.event_end_date}T23:59:00-03:00` : undefined;
  const preco = e.entrada === "gratuito" ? "0" : String(e.valor || "").replace(/\s*([.,])\s*/g, "$1").match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".");

  const jsonEvento = semVazios({
    "@context": "https://schema.org",
    "@type": "Event",
    name: nome,
    description: cortar(descricao, 300),
    url: `${SITE_URL}${path}`,
    startDate: inicio,
    endDate: fim,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: "pt-BR",
    image: absoluta(e.photo_url) ? [e.photo_url] : undefined,
    location: semVazios({
      "@type": "Place",
      name: e.location_name || e.loja_name || cidadeDe(e),
      address: semVazios({
        "@type": "PostalAddress",
        streetAddress: e.address,
        addressLocality: e.neighborhood ? `${e.neighborhood}, ${cidadeDe(e)}` : cidadeDe(e),
        addressRegion: estadoDe(e),
        addressCountry: "BR",
      }),
      geo: e.latitude != null && e.longitude != null ? { "@type": "GeoCoordinates", latitude: e.latitude, longitude: e.longitude } : undefined,
    }),
    organizer: e.loja_name
      ? semVazios({ "@type": "Organization", name: e.loja_name, url: e.loja_id ? `${SITE_URL}/lojas/${e.loja_slug || e.loja_id}` : undefined })
      : undefined,
    offers: preco !== undefined ? { "@type": "Offer", price: preco, priceCurrency: "BRL", url: `${SITE_URL}${path}` } : undefined,
    eventSchedule: fixa
      ? semVazios({
          "@type": "Schedule",
          repeatFrequency: "P1W",
          byDay: `https://schema.org/${DIAS[e.day_of_week].schema}`,
          startTime: e.start_time,
          endTime: e.end_time,
          scheduleTimezone: "America/Sao_Paulo",
        })
      : undefined,
  });

  return {
    title: `${nome}${quandoTxt ? ` – ${fixa ? DIAS[e.day_of_week].rotulo : br(e.event_date)}` : ""}`,
    description: descricao,
    path,
    image: e.photo_url,
    imageAlt: nome,
    type: "article",
    noindex: !!e.status && e.status !== "approved",
    jsonLd: [jsonEvento, breadcrumb([["Início", "/"], ["Programação", "/eventos"], [nome, path]])],
  };
}

const TIPOS_LOJA = {
  luderia: { rotulo: "Espaço de jogos", schema: "LocalBusiness" },
  loja: { rotulo: "Loja de board games", schema: "Store" },
  cafe: { rotulo: "Café de board games", schema: "CafeOrCoffeeShop" },
  bar: { rotulo: "Bar de board games", schema: "BarOrPub" },
  espaco: { rotulo: "Espaço de jogos", schema: "LocalBusiness" },
  organizador: { rotulo: "Grupo de board game", schema: "Organization" },
  editora: { rotulo: "Editora de jogos", schema: "Organization" },
};

export function seoLoja(l) {
  const path = lojaPath(l);
  const tipo = TIPOS_LOJA[l.type] || TIPOS_LOJA.luderia;
  const sobre = limpar(l.description);
  const onde = l.neighborhood ? `${l.neighborhood}, ${cidadeDe(l)}` : cidadeDe(l);
  const descricao = sobre.length >= 60 ? sobre : `${l.name}: ${tipo.rotulo.toLowerCase()} em ${onde}. Veja a programação, endereço, contatos e avaliações.`;
  const sameAs = ["instagram", "facebook", "youtube", "tiktok"].map((r) => (l[r] ? linkPerfil(r, l[r]) : null)).concat(normalizeUrl(l.website) || null).filter(Boolean);
  const ehGrupo = l.type === "organizador" || l.type === "editora";

  const jsonLoja = semVazios({
    "@context": "https://schema.org",
    "@type": tipo.schema,
    name: l.name,
    description: cortar(descricao, 300),
    url: `${SITE_URL}${path}`,
    image: absoluta(l.photo_url) ? [l.photo_url] : undefined,
    telephone: ehGrupo ? undefined : l.phone || l.whatsapp,
    email: l.email,
    address: ehGrupo
      ? undefined
      : semVazios({ "@type": "PostalAddress", streetAddress: l.address, addressLocality: l.neighborhood ? `${l.neighborhood}, ${cidadeDe(l)}` : cidadeDe(l), addressRegion: estadoDe(l), addressCountry: "BR" }),
    geo: !ehGrupo && l.latitude != null && l.longitude != null ? { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude } : undefined,
    areaServed: ehGrupo ? { "@type": "City", name: cidadeDe(l) } : undefined,
    sameAs,
  });

  return {
    title: `${l.name} – ${tipo.rotulo.toLowerCase()} em ${cidadeDe(l)}`,
    description: descricao,
    path,
    image: l.photo_url,
    imageAlt: l.name,
    noindex: !!l.status && l.status !== "approved",
    jsonLd: [jsonLoja, breadcrumb([["Início", "/"], ["Lojas e espaços", "/lojas"], [l.name, path]])],
  };
}

export function seoCriador(c, videos = []) {
  const path = criadorPath(c);
  const sobre = limpar(c.bio);
  const descricao = sobre.length >= 40 ? sobre : `${c.name}: vídeos de board game no YouTube, TikTok e Instagram — reviews, partidas e os rolês da comunidade.`;
  const sameAs = ["instagram", "youtube", "tiktok"].map((r) => (c[r] ? linkPerfil(r, c[r]) : null)).filter(Boolean);
  const pessoa = semVazios({
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.name,
    description: cortar(descricao, 300),
    url: `${SITE_URL}${path}`,
    image: absoluta(c.photo_url),
    jobTitle: c.influencer ? "Influenciador de board games" : "Criador de conteúdo de board games",
    sameAs,
    subjectOf: videos.slice(0, 10).map((v) => semVazios({ "@type": "VideoObject", name: v.title || `Vídeo de ${c.name}`, url: v.url, thumbnailUrl: absoluta(v.thumb_url), uploadDate: v.created_date })),
  });
  return {
    title: `${c.name} – vídeos de board game`,
    description: descricao,
    path,
    image: c.photo_url,
    imageAlt: c.name,
    type: "profile",
    jsonLd: [pessoa, breadcrumb([["Início", "/"], ["Influenciadores", "/influencers"], [c.name, path]])],
  };
}

export function seoMonitor(m) {
  const path = monitorPath(m);
  const onde = resumoLocais(m, 3);
  const jogos = (m.jogos || []).slice(0, 5).join(", ");
  const preco = textoPreco(m);
  const sobre = limpar(m.bio);
  const descricao = sobre.length >= 60
    ? sobre
    : `${m.name} ensina e conduz board game${onde ? ` em ${onde}` : ""}${jogos ? `. Jogos: ${jogos}.` : "."}${preco ? ` ${preco}.` : ""}`;
  const pessoa = semVazios({
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    description: cortar(descricao, 300),
    url: `${SITE_URL}${path}`,
    image: absoluta(m.photo_url),
    jobTitle: (m.servicos || []).slice(0, 2).join(" e ") || "Monitor de jogos de tabuleiro",
    areaServed: (m.cidades || []).slice(0, 8).map((c) => ({ "@type": "City", name: c })),
    knowsAbout: [...(m.estilos || []), ...(m.jogos || [])].slice(0, 12),
    aggregateRating: Number(m.total_avaliacoes) > 0
      ? { "@type": "AggregateRating", ratingValue: Number(m.nota_media) || 0, reviewCount: Number(m.total_avaliacoes), bestRating: 5, worstRating: 1 }
      : undefined,
  });
  return {
    title: `${m.name} – monitor de jogos${onde ? ` em ${onde.split(",")[0]}` : ""}`,
    description: descricao,
    path,
    image: m.photo_url,
    imageAlt: m.name,
    type: "profile",
    noindex: m.publicado === false,
    jsonLd: [pessoa, breadcrumb([["Início", "/"], ["Monitores", "/monitores"], [m.name, path]])],
  };
}

export function seoMateria(m, { noindex = false } = {}) {
  const path = materiaPath(m);
  const texto = String(m.corpo || "").replace(/<[^>]+>/g, " ");
  const descricao = limpar(m.subtitulo) || cortar(texto, 160) || `${m.titulo}: relato e fotos de um evento de board game.`;
  const artigo = semVazios({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m.titulo,
    description: cortar(descricao, 300),
    image: absoluta(m.capa_url),
    datePublished: m.publicada_em,
    author: (m.autor_nome || m.autor) ? { "@type": "Person", name: m.autor_nome || m.autor } : undefined,
    inLanguage: "pt-BR",
    mainEntityOfPage: `${SITE_URL}${path}`,
  });
  return {
    title: m.titulo,
    description: descricao,
    path,
    image: m.capa_url,
    imageAlt: `Capa: ${m.titulo}`,
    type: "article",
    noindex: noindex || m.status !== "publicada",
    jsonLd: [artigo, breadcrumb([["Início", "/"], ["Matérias", "/materias"], [m.titulo, path]])],
  };
}

export function seoPodcast(p, episodios = []) {
  const path = podcastPath(p);
  const sobre = limpar(p.bio);
  const descricao = sobre.length >= 40 ? sobre : `${p.name}: podcast de board game com episódios no Spotify, YouTube e Apple Podcasts.`;
  const sameAs = [p.spotify, p.apple, p.site].map((u) => normalizeUrl(u)).concat(p.youtube ? linkPerfil("youtube", p.youtube) : null, p.instagram ? linkPerfil("instagram", p.instagram) : null).filter(Boolean);
  const serie = semVazios({
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: p.name,
    description: cortar(descricao, 300),
    url: `${SITE_URL}${path}`,
    image: absoluta(p.photo_url),
    inLanguage: "pt-BR",
    sameAs,
    episode: episodios.slice(0, 20).map((e, i) =>
      semVazios({ "@type": "PodcastEpisode", name: e.title || `Episódio ${episodios.length - i}`, url: e.url, datePublished: e.created_date, partOfSeries: { "@type": "PodcastSeries", name: p.name } })
    ),
  });
  return {
    title: `${p.name} – podcast de board game`,
    description: descricao,
    path,
    image: p.photo_url,
    imageAlt: p.name,
    jsonLd: [serie, breadcrumb([["Início", "/"], ["Podcasts", "/podcasts"], [p.name, path]])],
  };
}

export function seoVaga(v) {
  const path = vagaPath(v);
  const local = `${cidadeDe(v)} - ${estadoDe(v)}`;
  const sobre = limpar(v.descricao);
  const descricao = sobre.length >= 60 ? sobre : `${v.empresa} está contratando: ${v.titulo} em ${local}. Veja o perfil buscado e envie seu currículo.`;
  const emprego = semVazios({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.titulo,
    description: cortar(descricao, 500),
    datePosted: v.created_date,
    hiringOrganization: { "@type": "Organization", name: v.empresa },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: cidadeDe(v), addressRegion: estadoDe(v), addressCountry: "BR" } },
    employmentType: { clt: "FULL_TIME", pj: "CONTRACTOR", estagio: "INTERN", temporario: "TEMPORARY", freelancer: "CONTRACTOR", voluntario: "VOLUNTEER" }[v.contratacao],
  });
  return {
    title: `${v.titulo} – ${v.empresa}`,
    description: descricao,
    path,
    noindex: v.status === "encerrada",
    jsonLd: [emprego, breadcrumb([["Início", "/"], ["Vagas", "/vagas"], [v.titulo, path]])],
  };
}

// ---------- páginas de endereço fixo ----------

const NAO_INDEXAR = { noindex: true };

export const SEO_PAGINAS = {
  "/": {
    title: "Eventos de board game no DF",
    description: DESCRICAO_PADRAO,
    jsonLd: [PAGINA_INICIAL_JSONLD],
  },
  "/materias": {
    title: "Matérias de eventos de board game",
    description:
      "Relatos e fotos dos eventos de board game que já aconteceram: como foi a mesa, quem organizou e o que rolou na cidade.",
    jsonLd: [breadcrumb([["Início", "/"], ["Matérias", "/materias"]])],
  },
  "/eventos": {
    title: "Programação de board game no DF",
    description:
      "Calendário de jogos de tabuleiro no DF: mesas fixas semanais, campeonatos, encontros e eventos especiais, com horário, local e como participar.",
    jsonLd: [breadcrumb([["Início", "/"], ["Programação", "/eventos"]])],
  },
  "/lojas": {
    title: "Lojas e espaços de board game no DF",
    description:
      "Onde jogar board game no DF: ludotecas, lojas, cafés, bares e grupos organizadores, com endereço, contatos, redes sociais e a programação de cada um.",
    jsonLd: [breadcrumb([["Início", "/"], ["Lojas e espaços", "/lojas"]])],
  },
  "/influencers": {
    title: "Influenciadores de board game no DF",
    description:
      "Reviews, partidas, unboxings e os rolês da comunidade: vídeos de board game de criadores brasileiros no YouTube, TikTok e Instagram.",
    jsonLd: [breadcrumb([["Início", "/"], ["Influenciadores", "/influencers"]])],
  },
  "/podcasts": {
    title: "Podcasts de board game no DF",
    description:
      "Conversas, reviews e bastidores da comunidade: podcasts de board game do DF, com episódios no Spotify, YouTube e Apple Podcasts.",
    jsonLd: [breadcrumb([["Início", "/"], ["Podcasts", "/podcasts"]])],
  },
  "/monitores": {
    title: "Monitores de jogos de tabuleiro",
    description:
      "Encontre quem ensina e conduz board game: veja jogos, estilos, tipos de evento, bairros, preço e a agenda para reservar. O valor é combinado direto com a pessoa.",
    jsonLd: [breadcrumb([["Início", "/"], ["Monitores", "/monitores"]])],
  },
  "/vagas": {
    title: "Estamos contratando: vagas em lojas de board game",
    description:
      "Vagas em lojas, espaços de jogos e grupos de board game: veja o perfil que cada um procura e envie seu currículo direto por e-mail.",
    jsonLd: [breadcrumb([["Início", "/"], ["Vagas", "/vagas"]])],
  },
  "/mapa": {
    title: "Mapa do board game: lugares e eventos",
    description:
      "Veja no mapa os espaços de jogos, lojas, cafés e os próximos eventos de board game perto de você, com rota pelo Waze ou Google Maps.",
    jsonLd: [breadcrumb([["Início", "/"], ["Mapa", "/mapa"]])],
  },
  "/app": {
    title: "Instale o app da agenda de board game",
    description: "Leve a agenda de board game na tela do celular: instale o eventosboardgame.com como aplicativo, grátis e sem loja de apps.",
    jsonLd: [breadcrumb([["Início", "/"], ["App", "/app"]])],
  },
  "/seguindo": { title: "Seguindo", ...NAO_INDEXAR },
  "/perfil": { title: "Meu perfil", ...NAO_INDEXAR },
  "/lancamentos": {
    title: "Lançamentos de board game: pré-vendas e jogos novos",
    description:
      "Calendário de pré-vendas, financiamentos coletivos e lançamentos de jogos de tabuleiro das editoras do Brasil.",
    jsonLd: [breadcrumb([["Início", "/"], ["Lançamentos", "/lancamentos"]])],
  },
  "/procuro": {
    title: "Procuro: classificados de board game",
    description:
      "Ache gente para jogar, um grupo fixo, testadores para o seu protótipo, parceria para criar jogos ou aquele jogo esgotado. Anuncie grátis.",
    jsonLd: [breadcrumb([["Início", "/"], ["Procuro", "/procuro"]])],
  },
  "/testadores": {
    title: "Testadores de jogos de tabuleiro",
    description:
      "Quem gosta de testar protótipos de board game: veja os jogos que cada testador já testou e os tipos de jogo de que gosta. Cadastre seu perfil grátis.",
    jsonLd: [breadcrumb([["Início", "/"], ["Testadores", "/testadores"]])],
  },
  "/anuncie": {
    title: "Anuncie: destaque seu lugar ou evento de board game",
    description:
      "Planos de destaque para lojas, luderias, cafés e eventos de board game. O site continua grátis para quem joga.",
    jsonLd: [breadcrumb([["Início", "/"], ["Anuncie", "/anuncie"]])],
  },
  "/sobre": {
    title: "Sobre – a agenda de board game do DF",
    description:
      "Conheça o eventosboardgame.com: quem faz, por que existe e como ajudar a comunidade de board game do DF a encontrar mesa para jogar.",
    jsonLd: [breadcrumb([["Início", "/"], ["Sobre", "/sobre"]])],
  },
  "/sugerir": {
    title: "Cadastrar um evento de board game",
    description: "Sabe de um encontro, campeonato ou mesa fixa de board game no DF? Cadastre o evento, sem precisar de conta.",
  },
  "/cadastrar": { title: "Cadastrar", ...NAO_INDEXAR },
  "/login": { title: "Entrar", ...NAO_INDEXAR },
  "/register": { title: "Criar conta", ...NAO_INDEXAR },
  "/forgot-password": { title: "Recuperar senha", ...NAO_INDEXAR },
  "/reset-password": { title: "Nova senha", ...NAO_INDEXAR },
};

// Resolve a configuração de SEO de um endereço fixo; undefined para páginas de registro
// (cada uma define o próprio SEO ao carregar) e para endereços que não existem.
export function seoDoCaminho(pathname) {
  const caminho = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (caminho === "/painel" || caminho.startsWith("/painel/")) return { title: "Painel", ...NAO_INDEXAR };
  const cfg = SEO_PAGINAS[caminho];
  return cfg ? { ...cfg, path: caminho } : undefined;
}
