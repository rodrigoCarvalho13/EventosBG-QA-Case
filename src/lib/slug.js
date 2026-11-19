// Endereço amigável: "Podcast BG" vira "podcast-bg". Registros antigos, sem slug, seguem pelo id.
export const slugify = (texto) =>
  (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// Gera um slug livre: "nome", "nome-2", "nome-3"… `existe(slug)` diz se já está em uso.
export async function gerarSlugUnico(nome, existe, padrao = "item") {
  const base = slugify(nome) || padrao;
  let slug = base;
  for (let i = 2; await existe(slug); i++) slug = `${base}-${i}`;
  return slug;
}

// Acha o registro pelo slug da URL (/lojas/ludoverso-delas) ou, nos links antigos, pelo id.
export async function buscarPorSlugOuId(entidade, valor) {
  const porSlug = await entidade.filter({ slug: valor }, { limit: 1 });
  return (porSlug.items || [])[0] || (await entidade.get(valor));
}

// Slug do registro: mantém o que já existe (links não quebram) ou gera um livre a partir do nome.
export async function slugDoRegistro(entidade, nome, registro, padrao) {
  if (registro?.slug) return registro.slug;
  return gerarSlugUnico(
    nome,
    async (s) => {
      const r = await entidade.filter({ slug: s }, { limit: 1 });
      const achado = (r.items || [])[0];
      return !!achado && achado.id !== registro?.id;
    },
    padrao
  );
}

// Registros antigos, sem slug, seguem pelo id.
export const lojaPath = (l) => `/lojas/${l.slug || l.id}`;
export const eventoPath = (e) => `/eventos/${e.slug || e.id}`;
